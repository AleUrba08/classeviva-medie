import https from 'https';

const API_HOST = 'web.spaggiari.eu';
const API_KEY = 'Tg1NWEwNGIgIC0K';
const USER_AGENT = 'CVVS/std/4.1.7 Android/10';

function studentIdFromIdent(ident) {
  if (!ident || typeof ident !== 'string') {
    throw Object.assign(new Error('Identificativo studente non valido.'), { status: 500 });
  }
  // L'API richiede solo la parte numerica (es. S10870242C → 10870242)
  const numeric = ident.replace(/\D/g, '');
  if (!numeric) {
    throw Object.assign(new Error('Identificativo studente non valido.'), { status: 500 });
  }
  return numeric;
}

function requestJson(method, path, { token, body } = {}) {
  const payload = body === undefined ? null : JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: API_HOST,
        path: `/rest/v1${path}`,
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Z-Dev-ApiKey': API_KEY,
          'User-Agent': USER_AGENT,
          ...(token ? { 'Z-Auth-Token': token } : {}),
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let data = null;
          try {
            data = raw ? JSON.parse(raw) : null;
          } catch {
            data = null;
          }
          resolve({ status: res.statusCode || 500, raw, data });
        });
      },
    );

    req.on('error', (err) => {
      reject(Object.assign(new Error(`Connessione a Spaggiari fallita: ${err.message}`), { status: 502 }));
    });

    if (payload) req.write(payload);
    req.end();
  });
}

function loginError(status, data, raw) {
  const info = data?.info || data?.error || raw?.slice(0, 160) || '';
  const rawText = String(raw || '');

  if (/Access Denied/i.test(rawText) || status === 403) {
    return Object.assign(
      new Error(
        'Spaggiari blocca i server cloud (Vercel). Avvia l’app in locale con npm run dev oppure npm run share.',
      ),
      { status: 503 },
    );
  }

  if (status === 422 || info === 'WrongCredentials' || /authentication failed/i.test(String(info))) {
    return Object.assign(new Error('Credenziali non valide. Controlla codice utente e password.'), {
      status: 401,
    });
  }

  if (status === 400 && /apikey/i.test(String(info))) {
    return Object.assign(
      new Error('Spaggiari ha rifiutato la richiesta API (header). Riprova tra poco.'),
      { status: 502 },
    );
  }

  return Object.assign(new Error(`Login Spaggiari fallito (${status}). ${info}`), {
    status: status >= 400 && status < 600 ? status : 502,
  });
}

export async function login(uid, pass) {
  const { status, data, raw } = await requestJson('POST', '/auth/login', {
    body: { ident: null, uid, pass },
  });

  if (status !== 200) {
    throw loginError(status, data, raw);
  }

  if (!data?.token || !data?.ident) {
    throw Object.assign(
      new Error('Risposta di login incompleta. Potrebbe essere richiesto un secondo fattore o una scelta profilo.'),
      { status: 502 },
    );
  }

  return {
    token: data.token,
    ident: data.ident,
    studentId: studentIdFromIdent(data.ident),
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
  };
}

export async function fetchGrades(token, studentId) {
  const { status, data, raw } = await requestJson('GET', `/students/${studentId}/grades`, { token });

  if (status === 401 || status === 403) {
    throw Object.assign(new Error('Sessione scaduta. Effettua di nuovo il login.'), { status: 401 });
  }

  if (status !== 200) {
    throw Object.assign(new Error(`Impossibile recuperare i voti (${status}). ${raw?.slice(0, 80) || ''}`), {
      status,
    });
  }

  return data;
}

export async function fetchPeriods(token, studentId) {
  const { status, data, raw } = await requestJson('GET', `/students/${studentId}/periods`, { token });

  if (status !== 200) {
    throw Object.assign(new Error(`Impossibile recuperare i periodi (${status}). ${raw?.slice(0, 80) || ''}`), {
      status,
    });
  }

  return data;
}
