const fs = require('fs');
let code = fs.readFileSync('src/views/order/index.vue', 'utf8');

const regex = /(<el-table-column label="订单金额" prop="total_price" align="center" width="100">[\s\S]*?<\/el-table-column>\s*<el-table-column label="下单时间" prop="order_time" align="center" width="160">[\s\S]*?<\/template>\s*<\/el-table-column>\s*<el-table-column label="预计成本" prop="estimated_cost" align="center" width="100">[\s\S]*?<\/template>\s*<\/el-table-column>\s*<el-table-column label="预计运费" prop="estimated_freight" align="center" width="100">[\s\S]*?<\/template>\s*<\/el-table-column>\s*<el-table-column label="预计盈利" prop="estimated_profit" align="center" width="100">[\s\S]*?<\/template>\s*<\/el-table-column>\s*<el-table-column label="渠道" prop="channel" align="center" width="120">[\s\S]*?<\/template>\s*<\/el-table-column>\s*){2}/;

const text = `<el-table-column label="订单金额" prop="total_price" align="center" width="100">
          <template #default="{ row }">
            {{ row.total_price != null ? '¥ ' + row.total_price : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="order_time" align="center" width="160">
          <template #default="{ row }">
            <span>{{ row.order_time ? new Date(row.order_time).toLocaleString() : "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预计成本" prop="estimated_cost" align="center" width="100">
          <template #default="{ row }">
            {{ row.estimated_cost != null ? '¥ ' + row.estimated_cost : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="预计运费" prop="estimated_freight" align="center" width="100">
          <template #default="{ row }">
            {{ row.estimated_freight != null ? '¥ ' + row.estimated_freight : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="预计盈利" prop="estimated_profit" align="center" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.estimated_profit > 0 ? '#67C23A' : '#F56C6C' }">
              {{ row.estimated_profit != null ? '¥ ' + row.estimated_profit : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="渠道" prop="channel" align="center" width="120">
          <template #default="{ row }">
            <el-tag type="info">{{ row.channel === 'miniprogram' ? '小程序' : row.channel || '-' }}</el-tag>
          </template>
        </el-table-column>
        `;

code = code.replace(regex, text);

fs.writeFileSync('src/views/order/index.vue', code);
