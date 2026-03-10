const fs = require('fs');
let code = fs.readFileSync('src/views/order/index.vue', 'utf8');

// remove duplicate in dialog form
const dupRegex = /(<el-form-item label="订单金额" prop="total_price">[\s\S]*?<\/el-form-item>\s*){2}/;
code = code.replace(dupRegex, `<el-form-item label="订单金额" prop="total_price">\n          <el-input-number v-model="temp.total_price" :precision="2" :step="0.1" />\n        </el-form-item>\n        `);

// remove duplicate columns if any exists
const dupColRegex = /(<el-table-column label="订单金额" prop="total_price" align="center" width="100">[\s\S]*?<\/el-table-column>\s*下单时间[\s\S]*?<\/el-table-column>\s*){2}/;
// Actually I'll just check if it's there
fs.writeFileSync('src/views/order/index.vue', code);
