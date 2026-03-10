const xlsx = require('xlsx-js-style');
const path = require('path');
const wb = xlsx.readFile('../frontend/public/模版.xls', { cellStyles: true });
const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];

// Fix styles for xlsx-js-style
for (let key in sheet) {
  if (key[0] !== '!' && sheet[key] && sheet[key].s) {
    const oldStyle = sheet[key].s;
    const newStyle = { ...oldStyle };
    if (oldStyle.fgColor) {
      newStyle.fill = {
         patternType: oldStyle.patternType || 'solid',
         fgColor: oldStyle.fgColor
      };
    }
    // Also fonts, alignment, etc can be copied if needed
    sheet[key].s = newStyle;
  }
}

const data = [
  ['琪1', 'Test', '123', 'address', 'sender', 'sender_phone', 'sender_address', 'items', 'SF', 'cash', '', '', '', '', ''],
  ['琪2', 'Test2', '456', 'address2', 'sender', 'sender_phone', 'sender_address', 'items2', 'SF', 'cash', '', '', '', '', '']
];
xlsx.utils.sheet_add_aoa(sheet, data, { origin: 'A3' });

xlsx.writeFile(wb, 'test_output.xlsx', { bookType: 'xlsx', cellStyles: true });
console.log('done');
