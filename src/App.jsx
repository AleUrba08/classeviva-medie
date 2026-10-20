import { useEffect, useMemo, useRef, useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import SaveCredentialsModal from './components/SaveCredentialsModal.jsx';
import {
  clearAuth,
  loadSavedAuth,
  offerBrowserPasswordSave,
  saveAuth,
} from './lib/credentials.js';

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCreds, setPendingCreds] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const autoLoginTried = useRef(false);

  const title = useMemo(() => {
    if (!data?.user) return 'ClasseViva Medie';
    const name = [data.user.firstName, data.user.lastName].filter(Boolean).join(' ');
    return name || 'ClasseViva Medie';
  }, [data]);

  async function loginRequest(uid, pass) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, pass }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload.error || 'Login non riuscito.');
    }
    return payload;
  }

  async function handleLogin({ uid, pass, stayLoggedIn }) {
    setLoading(true);
    setError('');
    setShowSaveModal(false);

    try {
      const payload = await loginRequest(uid, pass);
      setData(payload);

      // Prompt nativo Chrome/Google per salvare la password
      await offerBrowserPasswordSave(uid, pass);

      if (stayLoggedIn) {
        saveAuth({ uid, pass, stayLoggedIn: true });
      } else {
        setPendingCreds({ uid, pass });
        setShowSaveModal(true);
      }
    } catch (err) {
      setData(null);
      setError(err.message || 'Si è verificato un errore.');
    } finally {
      setLoading(false);
    }
  }

  function confirmSaveCredentials() {
    if (pendingCreds) {
      saveAuth({ ...pendingCreds, stayLoggedIn: true });
    }
    setPendingCreds(null);
    setShowSaveModal(false);
  }

  function declineSaveCredentials() {
    setPendingCreds(null);
    setShowSaveModal(false);
  }

  function handleLogout() {
    clearAuth();
    setData(null);
    setError('');
    setPendingCreds(null);
    setShowSaveModal(false);
  }

  useEffect(() => {
    if (autoLoginTried.current) return;
    autoLoginTried.current = true;

    const saved = loadSavedAuth();
    if (!saved?.stayLoggedIn) return;

    setLoading(true);
    loginRequest(saved.uid, saved.pass)
      .then((payload) => {
        setData(payload);
      })
      .catch((err) => {
        clearAuth();
        setError(err.message || 'Sessione scaduta. Accedi di nuovo.');
      })
      .finally(() => setLoading(false));
  }, []);

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
          Creato da <strong>Alessandro Urbani</strong>
        </p>
        <p>
          Non ufficiale · le credenziali restano solo sul tuo dispositivo se le salvi
        </p>
      </footer>

      {showSaveModal && (
        <SaveCredentialsModal
          onConfirm={confirmSaveCredentials}
          onDecline={declineSaveCredentials}
        />
      )}
    </div>
  );
}
