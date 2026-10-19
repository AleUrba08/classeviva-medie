import { useState } from 'react';

export default function LoginForm({ onSubmit, loading, error }) {
  const [uid, setUid] = useState('');
  const [pass, setPass] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ uid: uid.trim(), pass });
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
        <p className="creator- cred">
          Creato da <strong>Alessandro Urbani</strong>
        </p>
      </div>

      <form className="login-panel" onSubmit={handleSubmit}>
        <label>
          <span>Codice utente</span>
          <input
            type="text"
            name="uid"
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
            name="pass"
            autoComplete="current-password"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            disabled={loading}
          />
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
