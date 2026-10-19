import { login, fetchGrades, fetchPeriods } from '../server/spaggiari.js';
import { computeAverages } from '../server/averages.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  const { uid, pass } = req.body ?? {};

  if (!uid || !pass || typeof uid !== 'string' || typeof pass !== 'string') {
    return res.status(400).json({ error: 'Inserisci codice utente e password.' });
  }

  try {
    const session = await login(uid.trim(), pass);
    const [gradesPayload, periodsPayload] = await Promise.all([
      fetchGrades(session.token, session.studentId),
      fetchPeriods(session.token, session.studentId).catch(() => ({ periods: [] })),
    ]);

    const result = computeAverages(gradesPayload.grades ?? [], periodsPayload.periods ?? []);

    return res.status(200).json({
      user: {
        firstName: session.firstName,
        lastName: session.lastName,
        ident: session.ident,
      },
      ...result,
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      error: err.message || 'Errore durante il recupero dei voti.',
    });
  }
}
