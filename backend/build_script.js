const fs = require('fs');
const content = `exports.exportOrders = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    
    if (startTime) {
      query += ' AND created_at >= ?';
      params.push(startTime);
    }
    if (endTime) {
      query += ' AND created_at <= ?';
      params.push(endTime);
    }
    
    query += ' ORDER BY created_at ASC';
    const db = require('../db');
    const [orders] = await db.execute(query, params);

    const ExcelJS = require('exceljs');
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

    // Set Column Widths
    sheet.getColumn(1).width = 10;
    sheet.getColumn(2).width = 15;
    sheet.getColumn(3).width = 18;
    sheet.getColumn(4).width = 40;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 18;
    sheet.getColumn(7).width = 40;
    sheet.getColumn(8).width = 25;
    sheet.getColumn(9).width = 15;
    sheet.getColumn(10).width = 15;
    sheet.getColumn(11).width = 15;
    sheet.getColumn(12).width = 15;
    sheet.getColumn(13).width = 15;
    sheet.getColumn(14).width = 15;
    sheet.getColumn(15).width = 20;

    // Merge Cells
    sheet.mergeCells('B1:D1');
    sheet.mergeCells('E1:G1');
    sheet.mergeCells('I1:K1');
    sheet.mergeCells('L1:N1');

    // Background Colors exactly matching the legacy legacy template
    const colors = [
      'FF339966', 'FFFFCC99', 'FFFFCC99', 'FFFFCC99', 'FFFFCC99', 
      'FFFFCC99', 'FFFFCC99', 'FFC0C0C0', 'FF99CC00', 'FF99CC00', 
      'FF99CC00', 'FFCCCCFF', 'FFCCCCFF', 'FFCCCCFF', 'FFCCFFFF'
    ];

    [row1, row2].forEach(row => {
      row.height = 20;
      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        const colIdx = colNum - 1;
        if (colIdx < colors.length) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors[colIdx] } };
        }
      });
    });

    const senderName = '王卿';
    const senderPhone = '13822931562';
    const senderAddress = '广东省惠州市惠城区芦洲镇岚田村怡可蓝莓园';
    const logistcPayType = '寄付月结';

    orders.forEach((order, index) => {
      const orderNo = "琪" + (index + 1);
      const dataRow = sheet.addRow([
        orderNo, order.customer_name, order.phone, order.address,
        senderName, senderPhone, senderAddress, order.item_desc,
        order.shipping_method || '顺丰特快', logistcPayType,
        '', '', '', '', ''
      ]);
      
      dataRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent('订单导出.xlsx'));
    
    await wb.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ code: 500, message: '导出失败' });
  }
};`;

const codePath = './controllers/orderController.js';
const oldFile = fs.readFileSync(codePath, 'utf8');
const newFile = oldFile.replace(/exports\.exportOrders = async \(req, res\) => \{[\s\S]*?\};\n?$/, content + '\n');
fs.writeFileSync(codePath, newFile);
console.log('done modifying');
