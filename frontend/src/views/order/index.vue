<template>
  <div class="order-container">
    <el-card shadow="never">
      <!-- 搜索栏及操作 -->
      <div class="filter-container">
        <el-input
          v-model="listQuery.search"
          placeholder="请输入订单号/姓名/电话"
          style="width: 300px; margin-right: 15px;"
          class="filter-item"
          @keyup.enter="handleFilter"
          clearable
        />
        <el-button class="filter-item" type="primary" :icon="Search" @click="handleFilter">
          搜索
        </el-button>
        <el-button type="success" :icon="Plus" @click="openImportDialog" style="margin-left: 10px;">导入订单</el-button>
        <el-button type="warning" :icon="Download" @click="handleExport" style="margin-left: 10px;">导出订单</el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div style="padding: 15px;">
              <h4 style="margin-top: 0;">在此订单的托寄产品明细：</h4>
              <el-table :data="props.row.items" border style="width: 80%">
                <el-table-column label="原始文本" prop="raw_desc" min-width="200" />
                <el-table-column label="斤数" prop="weight" align="center" width="100">
                  <template #default="{ row }">
                    {{ row.weight ? row.weight + ' 斤' : '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="果径类型" prop="size_type" align="center" width="120" />
                <el-table-column label="包装类型" prop="package_type" align="center" width="120" />
                <el-table-column label="礼盒装" prop="is_gift_box" align="center" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.is_gift_box ? 'success' : 'info'">
                      {{ row.is_gift_box ? '是' : '否' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="ID" prop="id" sortable align="center" width="80" />
        <el-table-column label="订单编号" prop="order_no" width="180" align="center" />
        <el-table-column label="收件人" prop="customer_name" align="center" width="120" />
        <el-table-column label="收件人手机" prop="phone" align="center" width="140" />
        <el-table-column label="详细地址" prop="address" align="center" min-width="150" show-overflow-tooltip />
        <el-table-column label="托寄物" prop="item_desc" align="center" width="120" />
        <el-table-column label="物流产品" prop="shipping_method" align="center" width="120" />
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
        </el-table-column>
        <el-table-column label="状态" class-name="status-col" width="100">
          <template #default="{ row }">
            <el-tag :type="statusFilter(row.status)">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="created_at" align="center" width="160">
          <template #default="{ row }">
            <span>{{ new Date(row.created_at).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-popconfirm title="确定删除该订单吗？" @confirm="handleDelete(row, row.id)">
              <template #reference>
                <el-button size="small" type="danger">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container" style="margin-top: 20px; text-align: right;">
        <el-pagination
          v-model:current-page="listQuery.page"
          v-model:page-size="listQuery.limit"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </el-card>

    <!-- 导出订单对话框 -->
    <el-dialog title="导出订单" v-model="exportDialogVisible" width="400px">
      <el-form label-width="100px">
        <el-form-item label="订单时间范围">
          <el-date-picker
            v-model="exportDateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="exporting" @click="submitExport">导出 Excel</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入订单对话框 -->
    <el-dialog title="导入订单" v-model="importDialogVisible" width="500px">
      <el-form label-width="100px">
        <el-form-item label="导入源方式">
          <el-radio-group v-model="importMethod">
            <el-radio label="default">默认格式</el-radio>
            <el-radio label="miniprogram">小程序</el-radio>
            <el-radio label="wechat_shop">微信小店</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload
            ref="uploadRef"
            action="http://localhost:3100/api/import/orders"
            :data="{ source: importMethod }"
            :auto-upload="false"
            :limit="1"
            :on-exceed="handleExceed"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            accept=".xlsx, .xls"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip" style="margin-top: 10px;">只能上传单个 Excel 文件 (.xlsx, .xls)</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="importing" @click="submitImport">开始导入</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus as keyof typeof textMap]" v-model="dialogFormVisible">
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="收件人" prop="customer_name">
          <el-input v-model="temp.customer_name" placeholder="输入收件人姓名" />
        </el-form-item>
        <el-form-item label="收件人手机" prop="phone">
          <el-input v-model="temp.phone" placeholder="输入收件人手机" />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="temp.address" type="textarea" placeholder="输入详细地址" />
        </el-form-item>
        <el-form-item label="托寄物" prop="item_desc">
          <el-input v-model="temp.item_desc" />
        </el-form-item>
        <el-form-item label="物流产品" prop="shipping_method">
          <el-input v-model="temp.shipping_method" />
        </el-form-item>
        <el-form-item label="订单金额" prop="total_price">
          <el-input-number v-model="temp.total_price" :precision="2" :step="0.1" />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="请选择">
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Download } from '@element-plus/icons-vue'
import { ElMessage, FormInstance, UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { fetchOrderList, createOrder, updateOrder, deleteOrder, OrderQuery, OrderModel } from '../../api/order'

interface OrderItem {
  id: number;
  order_id: number;
  weight: number | null;
  size_type: string;
  package_type: string;
  is_gift_box: boolean | number;
  raw_desc: string;
}

interface OrderData extends OrderModel {
  id: number;
  order_no: string;
  created_at: string;
  items: OrderItem[];
}

const list = ref<OrderData[]>([])
const total = ref(0)
const listLoading = ref(true)

const listQuery = reactive<OrderQuery>({
  page: 1,
  limit: 10,
  search: ''
})

const getList = async () => {
  listLoading.value = true
  try {
    const response: any = await fetchOrderList(listQuery)
    list.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.warn(error)
  }
  listLoading.value = false
}

onMounted(() => {
  getList()
})

const handleFilter = () => {
  listQuery.page = 1
  getList()
}

const statusOptions = [
  { key: 'pending', label: '待发货' },
  { key: 'shipped', label: '已发货' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
]

const statusFilter = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'info',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return statusMap[status] || 'info'
}

const statusLabel = (status: string) => {
  const item = statusOptions.find(o => o.key === status)
  return item ? item.label : status
}

// 导出相关状态与方法
const exportDialogVisible = ref(false)
const exportDateRange = ref<[string, string] | []>([])
const exporting = ref(false)

const handleExport = () => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

  const startDate = new Date(yesterday.getTime() + 16 * 60 * 60 * 1000) // 昨天 16:00:00
  const endDate = new Date(today.getTime() + 12 * 60 * 60 * 1000) // 今天 12:00:00

  const format = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  exportDateRange.value = [format(startDate), format(endDate)]
  exportDialogVisible.value = true
}

const submitExport = async () => {
  if (!exportDateRange.value || exportDateRange.value.length !== 2) {
    ElMessage.warning('请选择导出时间范围')
    return
  }
  
  exporting.value = true
  const [startDate, endDate] = exportDateRange.value
  try {
    const url = `/api/orders/export/download?startTime=${startDate}&endTime=${endDate}`
    window.open(url, '_blank')
    exportDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

// 导入相关状态与方法
const importDialogVisible = ref(false)
const importMethod = ref('default')
const uploadRef = ref<UploadInstance>()
const importing = ref(false)

const openImportDialog = () => {
  importMethod.value = 'miniprogram'
  importDialogVisible.value = true
  setTimeout(() => {
    uploadRef.value?.clearFiles()
  }, 0)
}

const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = Date.now()
  uploadRef.value!.handleStart(file)
}

const submitImport = () => {
  if (importMethod.value === 'wechat_shop' || importMethod.value === 'default') {
    ElMessage.warning('该导入方式暂未实现，目前仅支持开启了小程序导入调试！')
    return
  }
  importing.value = true
  uploadRef.value!.submit()
}

const handleUploadSuccess = (response: any) => {
  importing.value = false
  if (response.code === 200) {
    ElMessage.success(response.message || '导入成功')
    importDialogVisible.value = false
    listQuery.page = 1
    getList()
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

const handleUploadError = (err: any) => {
  importing.value = false
  ElMessage.error('上传出错，请检查网络或服务端日志')
}

// 表单相关
const dialogFormVisible = ref(false)
const dialogStatus = ref('create')
const textMap = { update: '编辑订单', create: '新建订单' }
const dataFormRef = ref<FormInstance>()
const currentId = ref<number>(0)

const temp = reactive<OrderModel>({
  customer_name: '',
  phone: '',
  address: '',
  item_desc: '',
  shipping_method: '',
  status: 'pending'
})

const rules = reactive({
  customer_name: [{ required: true, message: '必填项', trigger: 'blur' }],
  phone: [{ required: true, message: '必填项', trigger: 'blur' }],
  address: [{ required: true, message: '必填项', trigger: 'blur' }]
})

const resetTemp = () => {
  temp.customer_name = ''
  temp.phone = ''
  temp.address = ''
  temp.item_desc = ''
  temp.shipping_method = ''
  temp.status = 'pending'
}

const handleCreate = () => {
  resetTemp()
  dialogStatus.value = 'create'
  dialogFormVisible.value = true
  // 确保 DOM 准备好后再清空校验状态
  setTimeout(() => {
    dataFormRef.value?.clearValidate()
  }, 0)
}

const createData = () => {
  dataFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await createOrder(temp)
        ElMessage.success('订单创建成功')
        dialogFormVisible.value = false
        getList()
      } catch (err) {
        // error handling inside request interceptor
      }
    }
  })
}

const handleUpdate = (row: OrderData) => {
  currentId.value = row.id
  Object.assign(temp, {
    customer_name: row.customer_name,
    phone: row.phone,
    address: row.address,
    item_desc: row.item_desc,
    shipping_method: row.shipping_method,
    status: row.status
  })
  dialogStatus.value = 'update'
  dialogFormVisible.value = true
  setTimeout(() => {
    dataFormRef.value?.clearValidate()
  }, 0)
}

const updateData = () => {
  dataFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await updateOrder(currentId.value, temp)
        ElMessage.success('订单更新成功')
        dialogFormVisible.value = false
        getList()
      } catch (err) { }
    }
  })
}

const handleDelete = async (row: OrderData, id: number) => {
  try {
    await deleteOrder(id)
    ElMessage.success('删除成功')
    getList()
  } catch (err) { }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 20px;
}
</style>
