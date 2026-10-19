import { useState } from 'react';

function formatAvg(value) {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(2).replace('.', ',');
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function avgTone(value) {
  if (value === null || value === undefined) return 'neutral';
  if (value >= 8) return 'good';
  if (value >= 6) return 'ok';
  return 'low';
}

export default function SubjectCard({ subject }) {
  const [open, setOpen] = useState(false);
  const tone = avgTone(subject.displayAverage);

  return (
    <article className={`subject-row tone-${tone}`}>
      <button
        type="button"
        className="subject-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="subject-main">
          <h2>{subject.subject}</h2>
          <p>
            {subject.displayCount} vot{subject.displayCount === 1 ? 'o' : 'i'} · media
            semplice {formatAvg(subject.displaySimple)}
          </p>
        </div>
        <div className="subject-avg">
          <div className="avg-block">
            <span className="avg-label">Media ponderata</span>
            <span className="avg-number">{formatAvg(subject.displayAverage)}</span>
          </div>
          <span className="chevron" data-open={open}>
            ▾
          </span>
        </div>
      </button>

      {open && (
        <div className="grade-panel">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Voto</th>
                <th>Tipo</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {subject.displayGrades.map((g, i) => (
                <tr key={`${g.date}-${g.displayValue}-${i}`}>
                  <td>{formatDate(g.date)}</td>
                  <td>
                    <span className={`grade-pill color-${g.color || 'blue'}`}>
                      {g.displayValue}
                    </span>
                  </td>
                  <td>{g.component || '—'}</td>
                  <td className="notes">{g.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
