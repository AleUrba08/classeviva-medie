/**
 * Cloudflare Worker: proxy verso Spaggiari con CORS aperto.
 * Le richieste partono dagli IP Cloudflare (da verificare se accettati).
 */

const API_BASE = 'https://web.spaggiari.eu/rest/v1';
const API_KEY = 'Tg1NWEwNGIgIC0K';
const USER_AGENT = 'CVVS/std/4.1.7 Android/10';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function spaggiariHeaders(token) {
  const h = {
    'Content-Type': 'application/json',
    'Z-Dev-ApiKey': API_KEY,
    'User-Agent': USER_AGENT,
  };
  if (token) h['Z-Auth-Token'] = token;
  return h;
}

function studentIdFromIdent(ident) {
  return String(ident).replace(/\D/g, '');
}

function averageOf(grades) {
  if (!grades.length) return null;
  let sum = 0;
  let weight = 0;
  for (const g of grades) {
    const value = Number(g.decimalValue);
    const wRaw = Number(g.weightFactor);
    const w = Number.isFinite(wRaw) && wRaw > 0 ? wRaw : 1;
    sum += value * w;
    weight += w;
  }
  if (!weight) return null;
  return Math.round((sum / weight) * 100) / 100;
}

function simpleAverageOf(grades) {
  if (!grades.length) return null;
  const sum = grades.reduce((acc, g) => acc + Number(g.decimalValue), 0);
  return Math.round((sum / grades.length) * 100) / 100;
}

function isCountable(g) {
  return !g.canceled && g.decimalValue !== null && g.decimalValue !== undefined && Number.isFinite(Number(g.decimalValue));
}

function computeAverages(grades, periods = []) {
  const countable = (grades || []).filter(isCountable);
  const bySubject = new Map();

  for (const grade of countable) {
    const key = grade.subjectId ?? grade.subjectDesc;
    if (!bySubject.has(key)) {
      bySubject.set(key, {
        subjectId: grade.subjectId,
        subject: grade.subjectDesc || 'Materia sconosciuta',
        grades: [],
      });
    }
    bySubject.get(key).grades.push(grade);
  }

  const subjects = [...bySubject.values()]
    .map((entry) => {
      const mapped = entry.grades
        .map((g) => ({
          date: g.evtDate,
          value: g.decimalValue,
          displayValue: g.displayValue,
          component: g.componentDesc || '',
          notes: g.notesForFamily || '',
          color: g.color || '',
          periodPos: g.periodPos,
          periodDesc: g.periodDesc || '',
          weightFactor: g.weightFactor ?? 1,
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1));

      const byPeriod = {};
      for (const g of entry.grades) {
        const pKey = String(g.periodPos ?? 'all');
        if (!byPeriod[pKey]) {
          byPeriod[pKey] = {
            periodPos: g.periodPos,
            periodDesc: g.periodDesc || `Periodo ${g.periodPos}`,
            grades: [],
          };
        }
        byPeriod[pKey].grades.push(g);
      }

      return {
        subjectId: entry.subjectId,
        subject: entry.subject,
        count: entry.grades.length,
        weightedAverage: averageOf(entry.grades),
        simpleAverage: simpleAverageOf(entry.grades),
        periodAverages: Object.values(byPeriod).map((p) => ({
          periodPos: p.periodPos,
          periodDesc: p.periodDesc,
          count: p.grades.length,
          weightedAverage: averageOf(p.grades),
          simpleAverage: simpleAverageOf(p.grades),
        })),
        grades: mapped,
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject, 'it'));

  const periodList =
    periods.length > 0
      ? periods.map((p) => ({
          periodPos: p.periodPos ?? p.pos,
          periodDesc: p.desc || p.periodDesc || `Periodo ${p.periodPos ?? p.pos}`,
        }))
      : [
          ...new Map(
            countable.map((g) => [
              g.periodPos,
              { periodPos: g.periodPos, periodDesc: g.periodDesc || `Periodo ${g.periodPos}` },
            ]),
          ).values(),
        ];

  return {
    summary: {
      subjectCount: subjects.length,
      gradeCount: countable.length,
      overallWeightedAverage: averageOf(countable),
      overallSimpleAverage: simpleAverageOf(countable),
    },
    periods: periodList,
    subjects,
  };
}

async function handleLogin(request) {
  const { uid, pass } = await request.json();
  if (!uid || !pass) {
    return Response.json({ error: 'Inserisci codice utente e password.' }, { status: 400 });
  }

  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: spaggiariHeaders(),
    body: JSON.stringify({ ident: null, uid: String(uid).trim(), pass: String(pass) }),
  });

  const loginText = await loginRes.text();
  if (/Access Denied/i.test(loginText)) {
    return Response.json(
      { error: 'Spaggiari blocca anche questo host cloud. Serve un altro provider.' },
      { status: 503 },
    );
  }

  if (!loginRes.ok) {
    let info = loginText.slice(0, 160);
    try {
      const j = JSON.parse(loginText);
      info = j.info || j.error || info;
    } catch {
      /* ignore */
    }
    if (loginRes.status === 422 || info === 'WrongCredentials') {
      return Response.json(
        { error: 'Credenziali non valide. Controlla codice utente e password.' },
        { status: 401 },
      );
    }
    return Response.json({ error: `Login Spaggiari fallito (${loginRes.status}). ${info}` }, { status: 502 });
  }

  const session = JSON.parse(loginText);
  const studentId = studentIdFromIdent(session.ident);
  const token = session.token;

  const [gradesRes, periodsRes] = await Promise.all([
    fetch(`${API_BASE}/students/${studentId}/grades`, { headers: spaggiariHeaders(token) }),
    fetch(`${API_BASE}/students/${studentId}/periods`, { headers: spaggiariHeaders(token) }).catch(() => null),
  ]);

  if (!gradesRes.ok) {
    return Response.json({ error: `Impossibile recuperare i voti (${gradesRes.status}).` }, { status: gradesRes.status });
  }

  const gradesPayload = await gradesRes.json();
  const periodsPayload = periodsRes && periodsRes.ok ? await periodsRes.json() : { periods: [] };
  const result = computeAverages(gradesPayload.grades ?? [], periodsPayload.periods ?? []);

  return Response.json({
    user: {
      firstName: session.firstName ?? '',
      lastName: session.lastName ?? '',
      ident: session.ident,
    },
    ...result,
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    if (request.method === 'POST' && (url.pathname === '/api/login' || url.pathname === '/login')) {
      const res = await handleLogin(request);
      const headers = new Headers(res.headers);
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => headers.set(k, v));
      return new Response(res.body, { status: res.status, headers });
    }

    if (url.pathname === '/health') {
      return Response.json({ ok: true }, { headers: corsHeaders(origin) });
    }

    // Frontend statico (Vite build in /dist)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders(origin) });
  },
};
