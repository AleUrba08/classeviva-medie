function isCountableGrade(grade) {
  return (
    !grade.canceled &&
    grade.decimalValue !== null &&
    grade.decimalValue !== undefined &&
    Number.isFinite(Number(grade.decimalValue))
  );
}

function averageOf(grades) {
  if (!grades.length) return null;

  const weighted = grades.reduce(
    (acc, g) => {
      const value = Number(g.decimalValue);
      const weight = Number(g.weightFactor);
      const w = Number.isFinite(weight) && weight > 0 ? weight : 1;
      acc.sum += value * w;
      acc.weight += w;
      return acc;
    },
    { sum: 0, weight: 0 },
  );

  if (weighted.weight === 0) return null;
  return Math.round((weighted.sum / weighted.weight) * 100) / 100;
}

function simpleAverageOf(grades) {
  if (!grades.length) return null;
  const sum = grades.reduce((acc, g) => acc + Number(g.decimalValue), 0);
  return Math.round((sum / grades.length) * 100) / 100;
}

function mapGrade(g) {
  return {
    date: g.evtDate,
    value: g.decimalValue,
    displayValue: g.displayValue,
    component: g.componentDesc || '',
    notes: g.notesForFamily || '',
    color: g.color || '',
    periodPos: g.periodPos,
    periodDesc: g.periodDesc || '',
    weightFactor: g.weightFactor ?? 1,
  };
}

export function computeAverages(grades, periods = []) {
  const countable = (grades ?? []).filter(isCountableGrade);
  const bySubject = new Map();

  for (const grade of countable) {
    const key = grade.subjectId ?? grade.subjectDesc;
    if (!bySubject.has(key)) {
      bySubject.set(key, {
        subjectId: grade.subjectId,
        subject: grade.subjectDesc || 'Materia sconosciuta',
        grades: [],
      });
    }
    bySubject.get(key).grades.push(grade);
  }

  const subjects = [...bySubject.values()]
    .map((entry) => {
      const mapped = entry.grades.map(mapGrade).sort((a, b) => (a.date < b.date ? 1 : -1));
      const byPeriod = {};

      for (const g of entry.grades) {
        const pKey = String(g.periodPos ?? 'all');
        if (!byPeriod[pKey]) {
          byPeriod[pKey] = {
            periodPos: g.periodPos,
            periodDesc: g.periodDesc || `Periodo ${g.periodPos}`,
            grades: [],
          };
        }
        byPeriod[pKey].grades.push(g);
      }

      const periodAverages = Object.values(byPeriod).map((p) => ({
        periodPos: p.periodPos,
        periodDesc: p.periodDesc,
        count: p.grades.length,
        weightedAverage: averageOf(p.grades),
        simpleAverage: simpleAverageOf(p.grades),
      }));

      return {
        subjectId: entry.subjectId,
        subject: entry.subject,
        count: entry.grades.length,
        weightedAverage: averageOf(entry.grades),
        simpleAverage: simpleAverageOf(entry.grades),
        periodAverages,
        grades: mapped,
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject, 'it'));

  const periodList =
    periods.length > 0
      ? periods.map((p) => ({
          periodPos: p.periodPos ?? p.pos,
          periodDesc: p.desc || p.periodDesc || `Periodo ${p.periodPos ?? p.pos}`,
        }))
      : [
          ...new Map(
            countable.map((g) => [
              g.periodPos,
              { periodPos: g.periodPos, periodDesc: g.periodDesc || `Periodo ${g.periodPos}` },
            ]),
          ).values(),
        ];

  return {
    summary: {
      subjectCount: subjects.length,
      gradeCount: countable.length,
      overallWeightedAverage: averageOf(countable),
      overallSimpleAverage: simpleAverageOf(countable),
    },
    periods: periodList,
    subjects,
  };
}
