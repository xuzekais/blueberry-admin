const fs = require('fs');
const path = '../frontend/src/views/order/index.vue';
let content = fs.readFileSync(path, 'utf8');

const target = `
        <el-table-column label="订单金额" prop="total_price" align="center" width="100">
          <template #default="{ row }">
            {{ row.total_price != null ? '¥ ' + row.total_price : '-' }}
          </template>
        </el-table-column>`;

const newColumns = `
        <el-table-column label="订单金额" prop="total_price" align="center" width="100">
          <template #default="{ row }">
            {{ row.total_price != null ? '¥ ' + row.total_price : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="order_time" align="center" width="160">
          <template #default="{ row }">
            <span>{{ row.order_time ? new Date(row.order_time).toLocaleString() : "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预计成本" prop="estimated_cost" align="center" width="100" />
        <el-table-column label="预计运费" prop="estimated_freight" align="center" width="100" />
        <el-table-column label="预计盈利" prop="estimated_profit" align="center" width="100" />
        <el-table-column label="渠道" prop="channel" align="center" width="120" />
`;

content = content.replace(target.trim(), newColumns.trim());
fs.writeFileSync(path, content);
