const importerManager = require('../utils/importers');
const db = require('../db'); 

// 辅助函数：拆分和解析单个托寄物字符串
function parseItemDesc(desc) {
    let weight = null; // 总斤数
    let size_type = '';
    let package_type = '';
    let is_gift_box = false;
    let gift_box_spec = null; // 礼盒装几斤的包装
    let quantity = 1;

    // 检查是否附带了购买数量，例如 " * 2"
    const qtyMatch = desc.match(/\*\s*(\d+)$/);
    if (qtyMatch) {
        quantity = parseInt(qtyMatch[1], 10) || 1;
        desc = desc.replace(/\*\s*(\d+)$/, '').trim();
    }

    // 检查是否礼盒
    if (desc.includes('礼盒')) {
        is_gift_box = true;
    }
    
    // 匹配斤数 (如果是简单的数字+斤这种格式)
    const weightMatch = desc.match(/(\d+(?:\.\d+)?)\s*斤/);
    if (weightMatch) {
        let base_weight = parseFloat(weightMatch[1]);
        if (is_gift_box) {
            gift_box_spec = base_weight;
        }
        // 总计斤数 = 购买数量 * 规格斤数
        weight = base_weight * quantity;
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
        gift_box_spec,
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
            
            
            // 预处理托寄物品拼接和解析
            let finalItemName = order.item_name;
            let parsedItemsList = [];
            
            // --- 预计成本等辅助配置 ---
            const costPrices = {
              '次果': 10,
              '红果': 15,
              '12+': 20,
              '15+': 25,
              '18+': 30,
              '20+': 35,
              '22+': 40
            };
            const packageCosts = {
              '125g': 1,
              '250g': 1.5,
              '500g': 2,
              '礼盒': 5
            };

            let estimated_cost = 0;
            let hasHongGuoOrCiGuo = false;
            
            if (order.item_name) {
                const itemsStrs = order.item_name.split(/,|，/).map(s => s.trim()).filter(s => s && !s.includes('省内1斤/仅购红果/省外需加运费'));
                const formattedStrs = [];
                for (let itemStr of itemsStrs) {
                    const parsedItem = parseItemDesc(itemStr);
                    parsedItemsList.push({ parsed: parsedItem, original: itemStr });
                    
                    let formatted = '';
                    if (parsedItem.weight) {
                        formatted += parsedItem.weight + '斤';
                    }
                    if (parsedItem.size_type) {
                        formatted += parsedItem.size_type;
                        if (parsedItem.size_type === '红果' || parsedItem.size_type === '次果') {
                            hasHongGuoOrCiGuo = true;
                        }
                    }
                    if (parsedItem.package_type) {
                        formatted += '（' + parsedItem.package_type + '）';
                    }
                    if (parsedItem.is_gift_box) {
                        if (parsedItem.gift_box_spec) {
                            formatted += parsedItem.gift_box_spec + '斤礼盒装';
                        } else {
                            formatted += '礼盒装';
                        }
                    }
                    
                    if (!formatted) { 
                        formatted = itemStr; // fallback
                    }
                    formattedStrs.push(formatted);

                    // --- 计算预估成本 ---
                    let w = parsedItem.weight || 0;
                    let cPrice = costPrices[parsedItem.size_type] || 0;
                    let itemCost = w * cPrice;
                    
                    let pkgCost = 0;
                    if (parsedItem.is_gift_box) {
                        pkgCost = (parsedItem.quantity || 1) * packageCosts['礼盒'];
                    } else if (parsedItem.package_type) {
                        let pGrams = parseFloat(parsedItem.package_type);
                        if (pGrams) {
                            let numPackages = (w * 500) / pGrams;
                            pkgCost = numPackages * (packageCosts[parsedItem.package_type] || 0);
                        }
                    }
                    estimated_cost += itemCost + pkgCost;
                }
                finalItemName = formattedStrs.join('，');
                order.item_name = finalItemName; 
            }

            // --- 计算预计运费 ---
            let estimated_freight = 0;
            const address = order.receiver_address || '';
            const isGuangdong = address.startsWith('广东省') || address.includes('广东省');

            if (isGuangdong) {
                estimated_freight = 10;
            } else {
                if (hasHongGuoOrCiGuo) {
                    estimated_freight = 0;
                } else {
                    estimated_freight = 18;
                }
            }

            // --- 计算预计盈利 ---
            let total_price = order.total_price || 0;
            let estimated_profit = total_price - estimated_cost - estimated_freight;
            
            // 下单时间和渠道
            let order_time = order.original_order_time ? new Date(order.original_order_time) : null;
            let channel = 'miniprogram';
// 查询订单是否已存在
            const [existing] = await connection.execute('SELECT id FROM orders WHERE order_no = ?', [order_no]);
            let order_id;

            if (existing.length > 0) {
                order_id = existing[0].id;
                // 更新现有订单
                await connection.execute(
                    'UPDATE orders SET customer_name = ?, phone = ?, address = ?, item_desc = ?, shipping_method = ?, total_price = ?, order_time = ?, estimated_cost = ?, estimated_freight = ?, estimated_profit = ?, channel = ? WHERE id = ?',
                    [order.receiver_name, order.receiver_phone, order.receiver_address, finalItemName, order.express_product, total_price, order_time, estimated_cost, estimated_freight, estimated_profit, channel, order_id]
                );
                updateCount++;
            } else {
                // 插入新订单
                const [result] = await connection.execute(
                    'INSERT INTO orders (order_no, customer_name, phone, address, item_desc, shipping_method, total_price, status, order_time, estimated_cost, estimated_freight, estimated_profit, channel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [order_no, order.receiver_name, order.receiver_phone, order.receiver_address, finalItemName, order.express_product, total_price, 'pending', order_time, estimated_cost, estimated_freight, estimated_profit, channel]
                );
                order_id = result.insertId;
                insertCount++;
            }

            // 3. 商品/托寄物拆分入库 (order_items)
            if (parsedItemsList.length > 0) {
                // 先清理该订单旧明细防止重复数据堆积
                await connection.execute('DELETE FROM order_items WHERE order_id = ?', [order_id]);
                
                for (let info of parsedItemsList) {
                    const pi = info.parsed;
                    await connection.execute(
                        'INSERT INTO order_items (order_id, weight, size_type, package_type, is_gift_box, gift_box_spec, raw_desc) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [order_id, pi.weight, pi.size_type, pi.package_type, pi.is_gift_box, pi.gift_box_spec, pi.raw_desc]
                    );
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
