const fs = require('fs');
const path = 'src/views/order/index.vue';
let content = fs.readFileSync(path, 'utf8');

const targetTableColumn = `<el-table-column label="物流产品" prop="shipping_method" align="center" width="120" />`;
const newTableColumns = `<el-table-column label="物流产品" prop="shipping_method" align="center" width="120" />
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
        </el-table-column>`;

content = content.replace(targetTableColumn, newTableColumns);

const targetFormItem = `<el-form-item label="物流产品" prop="shipping_method">
          <el-input v-model="temp.shipping_method" />
        </el-form-item>`;
const newFormItems = `<el-form-item label="物流产品" prop="shipping_method">
          <el-input v-model="temp.shipping_method" />
        </el-form-item>
        <el-form-item label="订单金额" prop="total_price">
          <el-input-number v-model="temp.total_price" :precision="2" :step="0.1" />
        </el-form-item>`;

content = content.replace(targetFormItem, newFormItems);

fs.writeFileSync(path, content);
console.log('Update done');
