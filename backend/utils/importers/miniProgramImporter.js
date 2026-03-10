const xlsx = require('xlsx');

/**
 * 导入小程序订单数据
 * @param {Buffer} buffer - 文件的 Buffer 数据
 * @returns {Array} - 解析后的订单数据列表
 */
async function parseMiniProgramOrders(buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // 解析为二维数组，方便处理表头之前的无效数据
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    console.log(`解析到 ${rows} 行数据，正在寻找表头...`);
    let headerRowIndex = -1;
    let headers = [];
    
    // 1. 寻找表头所在行
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        // 判断是否是表头行：这里简单用几个关键字段来匹配
        const rowStr = row.join(',');
        if (rowStr.includes('订单编号') && rowStr.includes('付款状态') && rowStr.includes('订购时间')) {
            headerRowIndex = i;
            headers = row.map(h => (h ? h.toString().trim() : ''));
            break;
        }
    }
    
    if (headerRowIndex === -1) {
        throw new Error('未找到有效的订单表头行，请检查文件格式是否为微信小程序导出格式');
    }
    
    const parsedDataMap = new Map();
    let lastOrderNo = '';
    
    // 2. 解析有效数据行，利用 Map 将同订单号下的多行商品进行合并
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        // 将当前行数据映射为对象
        const rowData = {};
        for (let j = 0; j < headers.length; j++) {
            rowData[headers[j]] = row[j] !== undefined ? row[j].toString().trim() : '';
        }
        
        let orderNo = rowData['订单编号'];
        if (orderNo) {
            lastOrderNo = orderNo;
        } else {
            // 如果因为单元格合并等原因当前行没有订单编号，则沿用上一行的订单编号
            orderNo = lastOrderNo;
        }
        
        // 如果依旧没有订单编号，或者这一行是没有订单号也没有商品名称的空行，直接跳过
        if (!orderNo || (!rowData['订单编号'] && !rowData['商品'])) continue;

        let productName = rowData['商品'] || '';
        const quantity = rowData['购买数量'] || rowData['数量'] || '1';
        console.log('当前的订单数据行:', rowData);
        // 过滤不需要的商品
        if (productName.includes('省内1斤/仅购红果/省外需加运费')) {
            productName = '';
        }

        // 把商品和数量拼接，后续在 importController.js 解析即可拆分成多件
        if (productName) {
            productName = `${productName} * ${quantity}`;
        }
        
        if (parsedDataMap.has(orderNo)) {
            // 已存在的主订单，如果当前行有商品，往上追加
            const existingOrder = parsedDataMap.get(orderNo);
            if (productName) {
                if (existingOrder.item_name) {
                    existingOrder.item_name += `，${productName}`;
                } else {
                    existingOrder.item_name = productName;
                }
            }
        } else {
            // 首次遇到该订单编号
            const address = rowData['顾客地址'] || '';
            const isGuangdong = address.startsWith('广东省') || address.includes('广东省');
            
            const mappedOrder = {
                original_order_no: orderNo,
                original_status: rowData['付款状态'],
                original_order_time: rowData['订购时间'],
                
                // 映射目标信息
                receiver_name: rowData['顾客姓名'] || '',
                receiver_phone: rowData['顾客电话'] || '',
                receiver_address: address,                    
                item_name: productName,                       
                total_price: parseFloat(rowData['订单金额（元）'] || rowData['实际支付金额'] || rowData['订单金额'] || rowData['小计'] || '0') || 0,
                
                // 判断物流产品
                express_product: isGuangdong ? '陆运包裹' : '顺丰特快',
                
                // 可以存一份原始的所有数据便于后续扩展
                raw_data: rowData
            };
            parsedDataMap.set(orderNo, mappedOrder);
        }
    }
    
    return Array.from(parsedDataMap.values());
}

module.exports = {
    parseMiniProgramOrders
};
