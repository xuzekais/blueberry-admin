const xlsx = require('xlsx-js-style');
const wb = xlsx.readFile('../frontend/public/模版.xls', { cellStyles: true });
const sheet = wb.Sheets[wb.SheetNames[0]];

console.log(sheet['!cols'] ? sheet['!cols'].slice(0, 15).map(c => c ? c.wpx || c.wch : 'none') : 'no cols');
