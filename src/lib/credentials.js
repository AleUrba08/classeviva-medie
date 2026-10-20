const STORAGE_KEY = 'classeviva-medie.auth';

export function loadSavedAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.uid || !data?.pass) return null;
    return {
      uid: String(data.uid),
      pass: String(data.pass),
      stayLoggedIn: Boolean(data.stayLoggedIn),
    };
  } catch {
    return null;
  }
}

export function saveAuth({ uid, pass, stayLoggedIn }) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      uid,
      pass,
      stayLoggedIn: Boolean(stayLoggedIn),
      savedAt: Date.now(),
    }),
  );
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Mostra il prompt nativo di Chrome/Google per salvare la password. */
export async function offerBrowserPasswordSave(uid, pass) {
  try {
    if (typeof window === 'undefined' || !window.PasswordCredential) return false;
    const cred = new window.PasswordCredential({
      id: uid,
      password: pass,
      name: uid,
    });
    await navigator.credentials.store(cred);
    return true;
  } catch {
    return false;
  }
}
