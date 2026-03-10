const fs = require('fs');
const path = 'controllers/importController.js';
let content = fs.readFileSync(path, 'utf8');

const calcLogic = `
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
`;

content = content.replace(/\/\/ 预处理托寄物品拼接和解析[\s\S]*?(?=\/\/ 查询订单是否已存在)/, calcLogic);

const updateStr = `UPDATE orders SET customer_name = ?, phone = ?, address = ?, item_desc = ?, shipping_method = ?, total_price = ?, order_time = ?, estimated_cost = ?, estimated_freight = ?, estimated_profit = ?, channel = ? WHERE id = ?`;
const insertStr = `INSERT INTO orders (order_no, customer_name, phone, address, item_desc, shipping_method, total_price, status, order_time, estimated_cost, estimated_freight, estimated_profit, channel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

content = content.replace(/UPDATE orders SET[^\n]+WHERE id = \?'/g, "'" + updateStr + "'");
content = content.replace(/INSERT INTO orders[^\n]+\)'/g, "'" + insertStr + "'");

content = content.replace(/\[order\.receiver_name.*?order_id\]/g, "[order.receiver_name, order.receiver_phone, order.receiver_address, finalItemName, order.express_product, total_price, order_time, estimated_cost, estimated_freight, estimated_profit, channel, order_id]");
content = content.replace(/\[order_no.*?pending\']/g, "[order_no, order.receiver_name, order.receiver_phone, order.receiver_address, finalItemName, order.express_product, total_price, 'pending', order_time, estimated_cost, estimated_freight, estimated_profit, channel]");

fs.writeFileSync(path, content);
console.log('Update done');
