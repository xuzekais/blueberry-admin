const xlsx = require('xlsx-js-style');
const path = require('path');
const wb = xlsx.readFile('../frontend/public/模版.xls', { cellStyles: true });
const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];

const data = [
  ['琪1', 'Test', '123', 'address', 'sender', 'sender_phone', 'sender_address', 'items', 'SF', 'cash', '', '', '', '', ''],
  ['琪2', 'Test2', '456', 'address2', 'sender', 'sender_phone', 'sender_address', 'items2', 'SF', 'cash', '', '', '', '', '']
];

xlsx.utils.sheet_add_aoa(sheet, data, { origin: 'A3' });

xlsx.writeFile(wb, 'test_output.xls', { bookType: 'xls', cellStyles: true });
console.log('done, check test_output.xls');
