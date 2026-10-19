const API_BASE = 'https://web.spaggiari.eu/rest/v1';
const API_KEY = 'Tg1NWEwNGIgIC0K';
const USER_AGENT = 'CVVS/std/4.1.7 Android/10';

function baseHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
    'Z-Dev-ApiKey': API_KEY,
    'User-Agent': USER_AGENT,
  };
  if (token) headers['Z-Auth-Token'] = token;
  return headers;
}

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

export async function login(uid, pass) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ ident: null, uid, pass }),
  });

  if (response.status === 401 || response.status === 403) {
    throw Object.assign(new Error('Credenziali non valide. Controlla codice utente e password.'), {
      status: 401,
    });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw Object.assign(
      new Error(`Login fallito (${response.status}). ${text.slice(0, 120)}`),
      { status: response.status },
    );
  }

  const data = await response.json();

  if (!data.token || !data.ident) {
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
  const response = await fetch(`${API_BASE}/students/${studentId}/grades`, {
    headers: baseHeaders(token),
  });

  if (response.status === 401 || response.status === 403) {
    throw Object.assign(new Error('Sessione scaduta. Effettua di nuovo il login.'), { status: 401 });
  }

  if (!response.ok) {
    throw Object.assign(new Error(`Impossibile recuperare i voti (${response.status}).`), {
      status: response.status,
    });
  }

  return response.json();
}

export async function fetchPeriods(token, studentId) {
  const response = await fetch(`${API_BASE}/students/${studentId}/periods`, {
    headers: baseHeaders(token),
  });

  if (!response.ok) {
    throw Object.assign(new Error(`Impossibile recuperare i periodi (${response.status}).`), {
      status: response.status,
    });
  }

  return response.json();
}
