import { useMemo, useState } from 'react';
import SubjectCard from './SubjectCard.jsx';
import { avgTone } from '../lib/avgTone.js';

function formatAvg(value) {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(2).replace('.', ',');
}

export default function Dashboard({ data, title }) {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredSubjects = useMemo(() => {
    const list = data.subjects.map((subject) => {
      if (periodFilter === 'all') {
        return {
          ...subject,
          displayAverage: subject.weightedAverage,
          displaySimple: subject.simpleAverage,
          displayCount: subject.count,
          displayGrades: subject.grades,
        };
      }

      const period = subject.periodAverages.find(
        (p) => String(p.periodPos) === String(periodFilter),
      );

      const grades = subject.grades.filter(
        (g) => String(g.periodPos) === String(periodFilter),
      );

      return {
        ...subject,
        displayAverage: period?.weightedAverage ?? null,
        displaySimple: period?.simpleAverage ?? null,
        displayCount: period?.count ?? 0,
        displayGrades: grades,
      };
    });

    const visible = list.filter((s) => s.displayCount > 0);

    visible.sort((a, b) => {
      if (sortBy === 'avg-desc') {
        return (b.displayAverage ?? -1) - (a.displayAverage ?? -1);
      }
      if (sortBy === 'avg-asc') {
        return (a.displayAverage ?? 99) - (b.displayAverage ?? 99);
      }
      return a.subject.localeCompare(b.subject, 'it');
    });

    return visible;
  }, [data.subjects, periodFilter, sortBy]);

  const filteredOverall = useMemo(() => {
    if (periodFilter === 'all') {
      return {
        weighted: data.summary.overallWeightedAverage,
        simple: data.summary.overallSimpleAverage,
        count: data.summary.gradeCount,
      };
    }

    const grades = data.subjects.flatMap((s) =>
      s.grades.filter((g) => String(g.periodPos) === String(periodFilter)),
    );

    if (!grades.length) {
      return { weighted: null, simple: null, count: 0 };
    }

    let wSum = 0;
    let wTot = 0;
    let sSum = 0;

    for (const g of grades) {
      const value = Number(g.value);
      const weight = Number(g.weightFactor);
      const w = Number.isFinite(weight) && weight > 0 ? weight : 1;
      wSum += value * w;
      wTot += w;
      sSum += value;
    }

    return {
      weighted: Math.round((wSum / wTot) * 100) / 100,
      simple: Math.round((sSum / grades.length) * 100) / 100,
      count: grades.length,
    };
  }, [data, periodFilter]);

  return (
    <section className="dashboard">
      <div className="dash-header">
        <div>
          <p className="eyebrow">Media voti</p>
          <h1>{title}</h1>
          <p className="lede compact">
            {filteredSubjects.length} materie · {filteredOverall.count} voti numerici
          </p>
        </div>

        <div className={`overall-chip tone-${avgTone(filteredOverall.weighted)}`}>
          <span className="overall-label">Media ponderata</span>
          <strong className="overall-value">{formatAvg(filteredOverall.weighted)}</strong>
          <span className="overall-sub">
            semplice {formatAvg(filteredOverall.simple)}
          </span>
        </div>
      </div>

      <div className="toolbar">
        <label className="toolbar-field">
          <span>Periodo</span>
          <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
            <option value="all">Anno intero</option>
            {(data.periods ?? []).map((p) => (
              <option key={p.periodPos} value={p.periodPos}>
                {p.periodDesc}
              </option>
            ))}
          </select>
        </label>

        <label className="toolbar-field">
          <span>Ordina</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Nome materia</option>
            <option value="avg-desc">Media ↓</option>
            <option value="avg-asc">Media ↑</option>
          </select>
        </label>
      </div>

      <h2 className="section-title">Media per materia</h2>
      <p className="section-sub">
        Per ogni materia vedi la media ponderata (in evidenza) e quella semplice. Apri una
        riga per il dettaglio dei voti.
      </p>

      {filteredSubjects.length === 0 ? (
        <p className="empty-state">Nessun voto numerico trovato per questo filtro.</p>
      ) : (
        <div className="subject-list">
          {filteredSubjects.map((subject) => (
            <SubjectCard key={subject.subjectId ?? subject.subject} subject={subject} />
          ))}
        </div>
      )}
    </section>
  );
}
