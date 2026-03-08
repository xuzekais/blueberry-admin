const db = require('../db');
const xlsx = require('xlsx');

// 获取所有订单（支持分页和简单搜索），并联表查出其托寄物明细
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders';
    const params = [];

    if (search) {
      query += ' WHERE customer_name LIKE ? OR order_no LIKE ? OR phone LIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await db.execute(query, params);

    // 查询总数
    let countQuery = 'SELECT COUNT(*) as total FROM orders';
    const countParams = [];
    if (search) {
      countQuery += ' WHERE customer_name LIKE ? OR order_no LIKE ? OR phone LIKE ?';
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam);
    }
    const [countRows] = await db.execute(countQuery, countParams);

    // 批量查出对应订单项
    const orderIds = rows.map(r => r.id);
    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => '?').join(',');
      const [items] = await db.query(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`, orderIds);
      
      // 合并到订单列表中
      rows.forEach(order => {
        order.items = items.filter(item => item.order_id === order.id);
      });
    } else {
      rows.forEach(order => {
        order.items = [];
      });
    }

    res.json({
      code: 200,
      data: {
        list: rows,
        total: countRows[0].total
      },
      message: 'success'
    });
  } catch (error) {
    console.error('Failed to get orders:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};

// 获取单个订单
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '未找到该订单' });
    }
    
    const [items] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [id]);
    const order = rows[0];
    order.items = items;
    
    res.json({ code: 200, data: order, message: 'success' });
  } catch (error) {
    console.error('Failed to get order:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};

// 创建新订单（主要由前端调用）
exports.createOrder = async (req, res) => {
  try {
    const { customer_name, phone, address, item_desc, shipping_method, status } = req.body;
    
    const dateStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const randomNum = Math.floor(Math.random() * 9000 + 1000);
    const order_no = `LM${dateStr}${randomNum}`;

    const [result] = await db.execute(
      'INSERT INTO orders (order_no, customer_name, phone, address, item_desc, shipping_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [order_no, customer_name, phone, address, item_desc, shipping_method, status || 'pending']
    );

    res.json({ code: 200, data: { id: result.insertId, order_no }, message: '订单创建成功' });
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};

// 更新订单信息/状态
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, phone, address, item_desc, shipping_method, status } = req.body;

    const [result] = await db.execute(
      'UPDATE orders SET customer_name = ?, phone = ?, address = ?, item_desc = ?, shipping_method = ?, status = ? WHERE id = ?',
      [customer_name, phone, address, item_desc, shipping_method, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '未找到该订单或无更改' });
    }

    res.json({ code: 200, message: '订单更新成功' });
  } catch (error) {
    console.error('Failed to update order:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};

// 删除订单
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM orders WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '未找到该订单' });
    }

    res.json({ code: 200, message: '订单删除成功' });
  } catch (error) {
    console.error('Failed to delete order:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
};

// 辅助方法：解析单个托寄物字符串，抽取出各项属性
function parseItemDesc(desc) {
  let weight = null;
  let size_type = '';
  let package_type = '';
  let is_gift_box = false;
  
  // 检查是否礼盒
  if (desc.includes('礼盒')) {
    is_gift_box = true;
  }
  
  // 匹配斤数 (如果是简单的数字+斤这种格式，也可以单独抽出数字部分；这里做个基本得数字提取或者直接留源字符串处理，
  // 比如： 3斤, 10, 或者 10斤装。如果用户只写数字我们提取数字
  const weightMatch = desc.match(/(\d+(?:\.\d+)?)\s*斤?/);
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
  
  // 匹配包装类型
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
    raw_desc: desc
  };
}

// 上传并解析 Excel 的处理函数
exports.uploadExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: '请选择要上传的Excel文件' });
  }

  // 避免事务或者多次执行出错
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (data.length < 3) {
      throw new Error('文件内容不足，必须包含表头行以及至少一行数据。');
    }

    const headerRow = data[1];

    const findIndex = (keywords) => {
      return headerRow.findIndex(cell => {
        if (!cell) return false;
        const text = String(cell).trim();
        return keywords.some(kw => text.includes(kw));
      });
    };

    const idxOrderNo = findIndex(['订单编号', '运单号', '订单号']);
    const idxCustomer = findIndex(['收件人', '收件方姓名', '姓名']);
    const idxPhone = findIndex(['收件人手机', '联系方式', '电话', '手机']);
    const idxAddress = findIndex(['收件人详细地址', '地址']);
    const idxItemDesc = findIndex(['托寄物', '物品']);
    const idxShipping = findIndex(['物流产品', '快递种类', '产品']);

    if (idxOrderNo === -1 || idxCustomer === -1 || idxPhone === -1 || idxAddress === -1 || idxItemDesc === -1 || idxShipping === -1) {
      throw new Error('第二行的表头列未完全找到必要字段，要求包含：订单编号、收件人、收件人手机、收件人详细地址、托寄物、物流产品');
    }

    let insertOrderCount = 0;
    
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const order_no = String(row[idxOrderNo] || '').trim();
      if (!order_no) continue; 

      const customer_name = String(row[idxCustomer] || '').trim();
      const phone = String(row[idxPhone] || '').trim();
      const address = String(row[idxAddress] || '').trim();
      const raw_item_desc = String(row[idxItemDesc] || '').trim();
      const shipping_method = String(row[idxShipping] || '').trim();

      // 这里先检查是否存在这个单号，避免主键冲突
      const [existed] = await connection.execute('SELECT id FROM orders WHERE order_no = ?', [order_no]);
      let order_id = null;
      
      if (existed.length === 0) {
        // 插入主表 order
        const [result] = await connection.execute(
          'INSERT INTO orders (order_no, customer_name, phone, address, item_desc, shipping_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [order_no, customer_name, phone, address, raw_item_desc, shipping_method, 'pending']
        );
        order_id = result.insertId;
        insertOrderCount++;
      } else {
        // 如果想要更新已有订单可在此补充，这里假设导入以新增为主，重复就单纯覆盖或者获取旧ID来叠加商品
        order_id = existed[0].id;
      }

      // 将原托寄物拆分：考虑到可能会用中文逗号或者英文逗号隔开多个不同的产品
      if (raw_item_desc) {
         // 先清理这个订单下原先可能有的该商品(防止重复导入导致无限叠加明细)
         await connection.execute('DELETE FROM order_items WHERE order_id = ? AND raw_desc = ?', [order_id, raw_item_desc]);

         const itemsStrs = raw_item_desc.split(/,|，/).map(s => s.trim()).filter(s => s);
         for (let itemStr of itemsStrs) {
           const parsed = parseItemDesc(itemStr);
           await connection.execute(
             'INSERT INTO order_items (order_id, weight, size_type, package_type, is_gift_box, raw_desc) VALUES (?, ?, ?, ?, ?, ?)',
             [order_id, parsed.weight, parsed.size_type, parsed.package_type, parsed.is_gift_box, parsed.raw_desc]
           );
         }
      }
    }

    await connection.commit();
    res.json({
      code: 200,
      message: `成功解析Excel，新增主订单数：${insertOrderCount}，并已完成子产品拆分录入！`,
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('上传解析Excel失败:', error);
    res.status(500).json({ code: 500, message: error.message || '后端解析Excel文件时发生错误' });
  } finally {
    if (connection) connection.release();
  }
};
