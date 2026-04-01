const xlsx = require('xlsx');

/**
 * 微信小店订单 Excel 导入解析器
 * 根据 PRD 3.2 字段映射规则实现
 * 
 * @param {Buffer} buffer - Excel 文件 Buffer
 * @returns {Array} - 解析后的订单数据列表
 */
async function parseWechatShopOrders(buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // 解析为二维数组
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    console.log(`微信小店订单：解析到 ${rows.length} 行数据，正在寻找表头...`);
    
    let headerRowIndex = -1;
    let headers = [];
    
    // 1. 寻找表头（根据微信小店导出格式的关键字段）
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const rowStr = row.join(',');
        // 微信小店表头特征字段
        if (rowStr.includes('订单编号') && rowStr.includes('收货人') && rowStr.includes('实付金额')) {
            headerRowIndex = i;
            headers = row.map(h => (h ? h.toString().trim() : ''));
            break;
        }
    }
    
    if (headerRowIndex === -1) {
        throw new Error('未找到有效的订单表头行，请检查文件格式是否为微信小店导出格式');
    }
    
    console.log(`微信小店订单：表头位于第 ${headerRowIndex + 1} 行，表头字段：${headers.join(', ')}`);
    
    const parsedOrders = [];
    let skippedCount = 0;
    
    // 2. 解析数据行
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        // 映射为对象
        const rowData = {};
        for (let j = 0; j < headers.length; j++) {
            rowData[headers[j]] = row[j] !== undefined ? row[j].toString().trim() : '';
        }
        
        // 3. 字段映射（PRD 3.2 字段映射规则）
        const orderNo = rowData['订单编号'];
        if (!orderNo) {
            skippedCount++;
            continue; // 跳过无订单号的行
        }
        
        const receiverName = rowData['收货人'];
        const phone = rowData['联系电话'];
        const address = rowData['收货地址'];
        const totalPrice = parseFloat(rowData['实付金额'] || '0') || 0;
        const orderTime = rowData['下单时间'];
        const itemDesc = rowData['商家备注'] || ''; // 托寄物映射自商家备注
        const trackingNo = rowData['物流单号'] || '';
        const logisticsCompany = rowData['物流公司'] || '';
        
        // 4. 数据校验（PRD 3.4 异常处理规则）
        // 4.1 必填字段校验
        if (!receiverName) {
            console.warn(`第 ${i + 1} 行缺少收货人，已跳过`);
            skippedCount++;
            continue;
        }
        if (!phone) {
            console.warn(`第 ${i + 1} 行缺少联系电话，已跳过`);
            skippedCount++;
            continue;
        }
        if (!address) {
            console.warn(`第 ${i + 1} 行缺少收货地址，已跳过`);
            skippedCount++;
            continue;
        }
        
        // 4.2 手机号格式校验（11 位手机号）
        const phoneRegex = /^1[3-9]\d{9}$/;
        const cleanPhone = phone.replace(/\s|-/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            console.warn(`第 ${i + 1} 行手机号格式错误：${phone}，已跳过`);
            skippedCount++;
            continue;
        }
        
        // 4.3 订单金额校验
        if (totalPrice < 0) {
            console.warn(`第 ${i + 1} 行订单金额为负数：${totalPrice}，已跳过`);
            skippedCount++;
            continue;
        }
        
        // 5. 自动计算物流产品（PRD 3.2）
        const isGuangdong = address.startsWith('广东省') || address.includes('广东省');
        let expressProduct = logisticsCompany; // 优先使用 Excel 中的物流公司
        
        if (!expressProduct) {
            // 无值则自动判断
            expressProduct = isGuangdong ? '陆运包裹' : '顺丰特快';
        }
        
        // 6. 构建订单对象
        const mappedOrder = {
            original_order_no: orderNo,
            original_order_time: orderTime,
            original_tracking_no: trackingNo,
            original_logistics_company: logisticsCompany,
            
            // 映射目标字段
            receiver_name: receiverName,
            receiver_phone: cleanPhone,
            receiver_address: address,
            item_name: itemDesc, // 商家备注 → 托寄物
            total_price: totalPrice,
            express_product: expressProduct,
            
            // 渠道标识
            channel: 'wechat_shop'
        };
        
        parsedOrders.push(mappedOrder);
    }
    
    console.log(`微信小店订单：成功解析 ${parsedOrders.length} 条有效订单，跳过 ${skippedCount} 条无效数据`);
    return parsedOrders;
}

module.exports = {
    parseWechatShopOrders
};
