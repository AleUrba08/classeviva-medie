/** Scala colori medie: >=6 ok/good, 5–5.9 giallo, <5 rosso sbiadito */
export function avgTone(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'neutral';
  }
  const n = Number(value);
  if (n >= 8) return 'good';
  if (n >= 6) return 'ok';
  if (n >= 5) return 'warn';
  return 'bad';
}
