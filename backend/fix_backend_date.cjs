const fs = require('fs');
const path = 'controllers/orderController.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("query += ' AND created_at >= ?';", "query += ' AND IFNULL(order_time, created_at) >= ?';");
content = content.replace("query += ' AND created_at <= ?';", "query += ' AND IFNULL(order_time, created_at) <= ?';");
content = content.replace("query += ' ORDER BY created_at ASC';", "query += ' ORDER BY IFNULL(order_time, created_at) ASC';");

fs.writeFileSync(path, content);
console.log('Backend date update done');
