import { useMemo, useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import Dashboard from './components/Dashboard.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    if (!data?.user) return 'ClasseViva Medie';
    const name = [data.user.firstName, data.user.lastName].filter(Boolean).join(' ');
    return name || 'ClasseViva Medie';
  }, [data]);

  async function handleLogin({ uid, pass }) {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, pass }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload.error || 'Login non riuscito.');
      }

      setData(payload);
    } catch (err) {
      setData(null);
      setError(err.message || 'Si è verificato un errore.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setData(null);
    setError('');
  }

  return (
    <div className="app-shell">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">Σ</span>
          <span className="brand-text">ClasseViva Medie</span>
        </div>
        {data && (
          <button type="button" className="ghost-btn" onClick={handleLogout}>
            Esci
          </button>
        )}
      </header>

      <main className="main">
        {!data ? (
          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
        ) : (
          <Dashboard data={data} title={title} />
        )}
      </main>

      <footer className="footer">
        <p>
          Non ufficiale · i dati restano sulla tua sessione e non vengono salvati dal server
        </p>
      </footer>
    </div>
  );
}
