import { computeAverages } from './averages.js';

const grades = [
  {
    subjectId: 1,
    subjectDesc: 'MATEMATICA',
    decimalValue: 8,
    displayValue: '8',
    evtDate: '2025-10-01',
    canceled: false,
    weightFactor: 1,
    periodPos: 1,
    periodDesc: 'Trimestre',
    componentDesc: 'Scritto',
    notesForFamily: '',
    color: 'green',
  },
  {
    subjectId: 1,
    subjectDesc: 'MATEMATICA',
    decimalValue: 6,
    displayValue: '6',
    evtDate: '2025-10-10',
    canceled: false,
    weightFactor: 2,
    periodPos: 1,
    periodDesc: 'Trimestre',
    componentDesc: 'Orale',
    notesForFamily: 'interrogazione',
    color: 'blue',
  },
  {
    subjectId: 2,
    subjectDesc: 'ITALIANO',
    decimalValue: null,
    displayValue: 'Nc',
    evtDate: '2025-10-05',
    canceled: false,
    weightFactor: 1,
    periodPos: 1,
    periodDesc: 'Trimestre',
    componentDesc: 'Scritto',
    notesForFamily: '',
    color: 'red',
  },
];

const result = computeAverages(grades);

const mate = result.subjects.find((s) => s.subject === 'MATEMATICA');
const expectedWeighted = Math.round(((8 * 1 + 6 * 2) / 3) * 100) / 100;

if (!mate || mate.weightedAverage !== expectedWeighted) {
  console.error('FAIL weighted', mate?.weightedAverage, expectedWeighted);
  process.exit(1);
}

if (result.subjects.length !== 1) {
  console.error('FAIL should ignore non-numeric grades');
  process.exit(1);
}

console.log('averages.test.js OK');
