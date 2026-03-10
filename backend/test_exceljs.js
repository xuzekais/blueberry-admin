const ExcelJS = require('exceljs');

async function test() {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet('Sheet1');

  // Add Row 1
  const row1 = sheet.addRow([' ', '收方信息', '', '', '寄方信息', '', '', '货物信息', '物流产品信息', '', '', '揽收&派送', '', '', '备注&补充信息']);
  
  // Add Row 2
  const row2 = sheet.addRow([
    '订单编号', '*收件人', '*收件人手机', '*收件人详细地址', 
    '*寄件人', '*寄件人手机', '*寄件人详细地址', 
    '*托寄物', '*物流产品', '*物流付款方式', '月结卡号', 
    '是否通知揽件', '预约揽收日期', '预约揽收时间', '订单备注'
  ]);

  // Set widths
  sheet.columns.forEach(col => col.width = 15);
  sheet.getColumn(4).width = 25; // 收件人地址
  sheet.getColumn(7).width = 25; // 寄件人地址
  sheet.getColumn(8).width = 20; // 托寄物

  // Merge
  sheet.mergeCells('B1:D1');
  sheet.mergeCells('E1:G1');
  sheet.mergeCells('I1:K1');
  sheet.mergeCells('L1:N1');

  // Styles
  const headerStyle = {
    font: { bold: true },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCC99' } },
    border: { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} }
  };
  
  const greenHeader = { ...headerStyle, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '339966' } } };

  [row1, row2].forEach(row => {
    row.eachCell((cell) => {
      cell.style = headerStyle;
    });
  });

  // Make column A slightly different if needed
  sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '339966' } };
  sheet.getCell('H1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '339966' } };

  // Data
  sheet.addRow(['琪1', '张三', '123', 'address', '王卿', '13822931562', '怡可蓝莓园', '1桶', '顺丰', '寄付', '', '', '', '', '']);

  await wb.xlsx.writeFile('test_exceljs.xlsx');
  console.log('done');
}
test();
