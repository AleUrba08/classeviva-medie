export default function SaveCredentialsModal({ onConfirm, onDecline }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-creds-title"
      >
        <h2 id="save-creds-title">Salvare le credenziali?</h2>
        <p>
          Vuoi salvare codice utente e password su questo dispositivo per non
          digitarli ogni volta? Restano solo sul tuo browser, non sul server.
        </p>
        <div className="modal-actions">
          <button type="button" className="ghost-btn" onClick={onDecline}>
            No, grazie
          </button>
          <button type="button" className="primary-btn modal-primary" onClick={onConfirm}>
            Sì, salva
          </button>
        </div>
      </div>
    </div>
  );
}
