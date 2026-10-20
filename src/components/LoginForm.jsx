import { useEffect, useState } from 'react';
import { loadSavedAuth } from '../lib/credentials.js';

export default function LoginForm({ onSubmit, loading, error }) {
  const saved = loadSavedAuth();
  const [uid, setUid] = useState(saved?.uid ?? '');
  const [pass, setPass] = useState(saved?.pass ?? '');
  const [stayLoggedIn, setStayLoggedIn] = useState(Boolean(saved?.stayLoggedIn));

  useEffect(() => {
    const latest = loadSavedAuth();
    if (!latest) return;
    setUid(latest.uid);
    setPass(latest.pass);
    setStayLoggedIn(Boolean(latest.stayLoggedIn));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ uid: uid.trim(), pass, stayLoggedIn });
  }

  return (
    <section className="hero-login">
      <div className="hero-copy">
        <p className="eyebrow">Registro Spaggiari</p>
        <h1>
          Le tue medie,
          <br />
          materia per materia
        </h1>
        <p className="lede">
          Accedi con le credenziali ClasseViva per calcolare automaticamente la media
          ponderata e semplice di ogni materia.
        </p>
        <p className="creator-cred">
          Creato da <strong>Alessandro Urbani</strong>
        </p>
      </div>

      <form className="login-panel" onSubmit={handleSubmit} autoComplete="on">
        <label>
          <span>Codice utente</span>
          <input
            type="text"
            name="username"
            autoComplete="username"
            placeholder="es. S1234567A"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={stayLoggedIn}
            onChange={(e) => setStayLoggedIn(e.target.checked)}
            disabled={loading}
          />
          <span>Rimani collegato su questo dispositivo</span>
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Caricamento voti…' : 'Calcola medie'}
        </button>

        <p className="form-hint">
          Usa lo stesso codice e password del portale{' '}
          <a href="https://web.spaggiari.eu" target="_blank" rel="noreferrer">
            web.spaggiari.eu
          </a>
          .
        </p>
      </form>
    </section>
  );
}
