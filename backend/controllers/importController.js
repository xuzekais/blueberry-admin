const importerManager = require('../utils/importers');
const db = require('../db'); 

// 辅助函数：拆分和解析单个托寄物字符串
function parseItemDesc(desc) {
    let weight = null;
    let size_type = '';
    let package_type = '';
    let is_gift_box = false;
    let quantity = 1;
    
    // 检查是否附带了购买数量，例如 " * 2"
    const qtyMatch = desc.match(/\*\s*(\d+)$/);
    if (qtyMatch) {
        quantity = parseInt(qtyMatch[1], 10) || 1;
        // 提取数量后可以在源字符串中移除，以免干扰或保持原样。这里选择保持或者清洗
        desc = desc.replace(/\*\s*(\d+)$/, '').trim();
    }

    // 检查是否礼盒
    if (desc.includes('礼盒')) {
        is_gift_box = true;
    }
    
    // 匹配斤数 (如果是简单的数字+斤这种格式)
    // 明确要求遇到 '斤'，防止将 12+ 等果径误认为是斤数
    const weightMatch = desc.match(/(\d+(?:\.\d+)?)\s*斤/);
    if (weightMatch) {
        weight = parseFloat(weightMatch[1]);
    }
    
    // 匹配果径类型
    const sizes = ['次果', '红果', '12+', '15+', '18+', '22+'];
    for (let s of sizes) {
        if (desc.includes(s)) {
            size_type = s;
            break;
        }
    }
    
    // 匹配包装规格
    const pkgs = ['125g', '250g', '500g'];
    for (let p of pkgs) {
        if (desc.includes(p)) {
            package_type = p;
            break;
        }
    }
    
    return {
        weight,
        size_type,
        package_type,
        is_gift_box,
        quantity,
        raw_desc: desc
    };
}

exports.uploadOrders = async (req, res) => {
    let connection;
    try {
        if (!req.file) {
            return res.status(400).json({ code: 400, message: '请上传文件' });
        }
        
        // 获取前端传入的 source 类型（默认为小程序的）
        const source = req.body.source || 'miniprogram';
        const rawBuffer = req.file.buffer;
        
        // 1. 调用刚刚建立的分类解析工厂获取清洗后的 JSON 数组
        const parsedOrders = await importerManager.parseOrdersBySource(source, rawBuffer);
        
        if (parsedOrders.length === 0) {
            return res.json({ code: 200, message: '文件中没有解析到有效的订单数据', data: [] });
        }

        // 2. 存入数据库
        connection = await db.getConnection();
        await connection.beginTransaction();

        let insertCount = 0;
        let updateCount = 0;

        for (const order of parsedOrders) {
            // 用导入表的订单号如果没抓到则随机生成
            const order_no = order.original_order_no || `LM${Date.now()}${Math.floor(Math.random() * 1000)}`;
            
            // 查询订单是否已存在
            const [existing] = await connection.execute('SELECT id FROM orders WHERE order_no = ?', [order_no]);
            let order_id;

            if (existing.length > 0) {
                order_id = existing[0].id;
                // 更新现有订单
                await connection.execute(
                    'UPDATE orders SET customer_name = ?, phone = ?, address = ?, item_desc = ?, shipping_method = ? WHERE id = ?',
                    [order.receiver_name, order.receiver_phone, order.receiver_address, order.item_name, order.express_product, order_id]
                );
                updateCount++;
            } else {
                // 插入新订单
                const [result] = await connection.execute(
                    'INSERT INTO orders (order_no, customer_name, phone, address, item_desc, shipping_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [order_no, order.receiver_name, order.receiver_phone, order.receiver_address, order.item_name, order.express_product, 'pending']
                );
                order_id = result.insertId;
                insertCount++;
            }
            // 3. 商品/托寄物拆分入库 (order_items)
            if (order.item_name) {
                // 先清理该订单旧明细防止重复数据堆积
                await connection.execute('DELETE FROM order_items WHERE order_id = ?', [order_id]);
                
                // 支持中文或英文逗号拆分商品
                const itemsStrs = order.item_name.split(/,|，/).map(s => s.trim()).filter(s => s && !s.includes('省内1斤/仅购红果/省外需加运费'));
                for (let itemStr of itemsStrs) {
                    const parsedItem = parseItemDesc(itemStr);
                    // 根据购买数量，插入对应多条记录
                    const qtyToInsert = parsedItem.quantity || 1;
                    for (let q = 0; q < qtyToInsert; q++) {
                        await connection.execute(
                            'INSERT INTO order_items (order_id, weight, size_type, package_type, is_gift_box, raw_desc) VALUES (?, ?, ?, ?, ?, ?)',
                            [order_id, parsedItem.weight, parsedItem.size_type, parsedItem.package_type, parsedItem.is_gift_box, parsedItem.raw_desc]
                        );
                    }
                }
            }
        }

        await connection.commit();
        
        res.json({
            code: 200,
            message: `成功解析并入库 ${parsedOrders.length} 条订单 (新增 ${insertCount}, 更新 ${updateCount})，并完成商品智能拆分！`,
            data: parsedOrders
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('解析/入库订单报错:', error);
        res.status(500).json({ code: 500, message: `解析入库错误: ${error.message}` });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
