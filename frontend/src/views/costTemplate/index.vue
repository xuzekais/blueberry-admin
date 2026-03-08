<template>
  <div class="cost-template-container">
    <div class="header-actions">
      <h2>成本模版管理</h2>
      <el-button type="primary" @click="handleAdd">新增成本模版</el-button>
    </div>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column type="expand">
        <template #default="props">
          <div style="padding: 15px;">
            <h4>包含的果径成本明细：</h4>
            <el-table :data="props.row.items" border style="width: 50%" size="small">
              <el-table-column label="果径大小" prop="size_type" align="center" />
              <el-table-column label="成本价格(元/斤)" prop="cost_price" align="center" />
            </el-table>
            <div v-if="!props.row.items || props.row.items.length === 0" style="margin-top: 10px; color: #999;">
              暂无明细数据
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="模版名称" min-width="150" />
      <el-table-column prop="effective_time" label="生效时间" width="160" align="center">
        <template #default="{ row }">
          {{ row.effective_time ? new Date(row.effective_time).toLocaleString() : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="remarks" label="备注" min-width="200" />
      <el-table-column prop="is_active" label="当前生效" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.is_active === 1 ? 'success' : 'info'">
            {{ scope.row.is_active === 1 ? '生效中' : '未生效' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button size="small" type="success" v-if="scope.row.is_active === 0" @click="handleSetActive(scope.row)">设为生效</el-button>
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗 -->
    <el-dialog :title="dialogType === 'add' ? '新增成本模版' : '编辑成本模版'" v-model="dialogVisible" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模版名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：2024春季成本" />
        </el-form-item>
        <el-form-item label="生效时间" prop="effective_time">
          <el-date-picker
            v-model="form.effective_time"
            type="datetime"
            placeholder="选择该模版的生效时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="是否生效">
          <el-switch v-model="form.is_active" :active-value="1" :inactive-value="0" />
          <span style="margin-left: 10px; font-size: 12px; color: #E6A23C;">提示：开启将自动使其他模版失效</span>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input type="textarea" v-model="form.remarks" />
        </el-form-item>
        
        <el-divider>果径成本明细配置</el-divider>
        <div v-for="(item, index) in form.items" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
          <el-select v-model="item.size_type" placeholder="选择果径" style="width: 150px" filterable allow-create>
             <!-- 预设一些，也可以根据前面的枚举接口动态获取，这里先写死常用或允许新建 -->
            <el-option label="次果" value="次果" />
            <el-option label="红果" value="红果" />
            <el-option label="12+" value="12+" />
            <el-option label="15+" value="15+" />
            <el-option label="18+" value="18+" />
            <el-option label="20+" value="20+" />
            <el-option label="22+" value="22+" />
          </el-select>
          <el-input-number v-model="item.cost_price" :precision="2" :step="0.1" :min="0" placeholder="成本价" style="width: 130px" />
          <span>元/斤</span>
          <el-button type="danger" icon="Delete" circle size="small" @click="removeItem(index)" />
        </div>
        <el-button type="dashed" style="width: 100%" @click="addItem">+ 添加果径成本</el-button>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getCostTemplates, createCostTemplate, updateCostTemplate, deleteCostTemplate, type CostTemplate } from '../../api/costTemplate'

const tableData = ref<CostTemplate[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = ref<CostTemplate>({
  name: '',
  is_active: 0,
  remarks: '',
  items: []
})

const rules = {
  name: [{ required: true, message: '请输入模版名称', trigger: 'blur' }]
}

const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await getCostTemplates()
    if (res.code === 200) tableData.value = res.data
  } finally {
    loading.value = false
  }
}

const handleSetActive = async (row: CostTemplate) => {
  try {
    await updateCostTemplate(row.id!, { ...row, is_active: 1 })
    ElMessage.success('设置成功，已生效！')
    fetchList()
  } catch (err) {}
}

const addItem = () => {
  form.value.items!.push({ size_type: '', cost_price: 0 })
}

const removeItem = (index: number) => {
  form.value.items!.splice(index, 1)
}

const handleAdd = () => {
  dialogType.value = 'add'
  form.value = { name: '', is_active: 0, remarks: '', items: [], effective_time: '' }
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

const handleEdit = (row: CostTemplate) => {
  dialogType.value = 'edit'
  form.value = JSON.parse(JSON.stringify(row)) // 深拷贝解层级
  if (!form.value.items) form.value.items = []
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if(form.value.items!.some(i => !i.size_type)) {
         return ElMessage.warning('存在果径大小未填写的明细项')
      }
      submitLoading.value = true
      try {
        if (dialogType.value === 'add') {
          await createCostTemplate(form.value)
        } else {
          await updateCostTemplate(form.value.id!, form.value)
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        fetchList()
      } catch (err: any) { }
      finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = (row: CostTemplate) => {
  ElMessageBox.confirm('确定要删除吗？', '警告', { type: 'warning' }).then(async () => {
    const res: any = await deleteCostTemplate(row.id!)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchList()
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.cost-template-container {
  padding: 20px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>