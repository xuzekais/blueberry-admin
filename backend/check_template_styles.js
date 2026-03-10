const xlsx = require('xlsx-js-style');
const wb = xlsx.readFile('../frontend/public/模版.xls', { cellStyles: true });
const sheet = wb.Sheets[wb.SheetNames[0]];

const cells = ['A1', 'B1', 'E1', 'H1', 'I1', 'L1', 'O1', 'A2', 'B2', 'H2', 'I2'];
cells.forEach(c => {
  const cell = sheet[c];
  if (cell) {
    console.log(`${c} v="${cell.v}"`);
    console.log(`  fill:`, cell.s ? cell.s.fill : 'none');
    console.log(`  fgColor:`, cell.s && cell.s.fgColor ? cell.s.fgColor : 'none');
    console.log(`  font:`, cell.s ? cell.s.font : 'none');
    console.log(`  alignment:`, cell.s ? cell.s.alignment : 'none');
  }
});
