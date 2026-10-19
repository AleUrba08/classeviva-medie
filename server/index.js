import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { login, fetchGrades, fetchPeriods } from './spaggiari.js';
import { computeAverages } from './averages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const dist = path.join(__dirname, '..', 'dist');
const serveFrontend = process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === '1';

app.use(cors({ origin: serveFrontend ? false : true }));
app.use(express.json({ limit: '32kb' }));

app.post('/api/login', async (req, res) => {
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

    res.json({
      user: {
        firstName: session.firstName,
        lastName: session.lastName,
        ident: session.ident,
      },
      ...result,
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      error: err.message || 'Errore durante il recupero dei voti.',
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

if (serveFrontend && fs.existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
