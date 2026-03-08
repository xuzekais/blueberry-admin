<template>
  <div class="app-container">
    <div class="header-container">
      <el-button type="primary" @click="handleAdd">新增运费模版</el-button>
    </div>

    <!-- 列表数据 -->
    <el-table :data="tableData" border style="width: 100%; margin-top: 20px" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="模版名称" />
      
      <el-table-column prop="effective_time" label="生效时间" width="160">
        <template #default="{ row }">
          {{ row.effective_time ? new Date(row.effective_time).toLocaleString() : '-' }}
        </template>
      </el-table-column>

      <el-table-column label="计费规则数量" width="120">
        <template #default="{ row }">
          {{ row.freight_rules ? row.freight_rules.length : 0 }} 条组合规则
        </template>
      </el-table-column>

      <el-table-column prop="is_default" label="默认模版" width="120">
        <template #default="{ row }">
          <el-switch
            v-model="row.is_default"
            :active-value="1"
            :inactive-value="0"
            @change="handleDefaultChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="{ row }">
          {{ row.created_at || row.create_time || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗表单 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="1300px" top="5vh">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="模版名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入运费模版名称" style="width: 300px" />
        </el-form-item>
        
        <el-form-item label="生效时间" prop="effective_time">
          <el-date-picker
            v-model="form.effective_time"
            type="datetime"
            placeholder="选择该模版的生效时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 300px"
          />
        </el-form-item>
        
        <el-form-item label="是否默认" prop="is_default">
          <el-switch v-model="form.is_default" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <div style="margin: 20px 0; border-top: 1px solid #ebeef5; padding-top: 20px;">
          <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; font-size: 16px;">物流组合计费规则组 (匹配相同规则的商品重量会自动合并计算)</span>
            <el-button type="success" size="small" @click="addRule">添加组合规则</el-button>
          </div>
          
          <el-table :data="form.freight_rules" border size="small" style="width: 100%;">
            <el-table-column label="适用地区 (可多选)" width="200">
              <template #default="scope">
                <el-select v-model="scope.row.regions" multiple placeholder="选择地区" allow-create filterable style="width: 100%">
                  <el-option label="默认其他地区" value="默认" />
                  <el-option label="广东省内" value="广东省内" />
                  <el-option label="广东省外" value="广东省外" />
                  <el-option label="偏远地区" value="偏远地区" />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="适用果径 (可多选)" width="250">
              <template #default="scope">
                <el-select v-model="scope.row.sizes" multiple placeholder="选择果径" style="width: 100%">
                  <el-option
                    v-for="item in sizeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                  <el-option label="全部(不限果径)" value="全部" />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="满X kg包邮" width="130">
              <template #default="scope">
                <el-input-number v-model="scope.row.free_weight" :min="0" :precision="2" :step="0.5" size="small" style="width:100px" />
                <div style="font-size: 12px; color: #999;">(0=不包邮)</div>
              </template>
            </el-table-column>

            <el-table-column label="阶梯运费 (未达包邮门槛时收取)">
              <template #default="scope">
                <div style="display:flex; flex-wrap:wrap; gap: 5px; align-items: center;">
                  首重<el-input-number v-model="scope.row.first_weight" :min="0" :precision="2" :step="0.5" :controls="false" size="small" style="width:90px" />kg
                  收￥<el-input-number v-model="scope.row.first_price" :min="0" :precision="2" :step="1" :controls="false" size="small" style="width:90px" />
                  <span style="color:#e4e7ed">|</span>
                  续重<el-input-number v-model="scope.row.extra_weight" :min="0" :precision="2" :step="0.5" :controls="false" size="small" style="width:90px" />kg
                  加￥<el-input-number v-model="scope.row.extra_price" :min="0" :precision="2" :step="1" :controls="false" size="small" style="width:90px" />
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="80" fixed="right">
              <template #default="scope">
                <el-button type="danger" size="small" @click="removeRule(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm(formRef)">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getFreightTemplates, createFreightTemplate, updateFreightTemplate, deleteFreightTemplate } from '../../api/freightTemplate'
import { getEnums } from '../../api/enum'
import type { FreightTemplate, FreightRule } from '../../api/freightTemplate'

const loading = ref(false)
const tableData = ref<FreightTemplate[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const sizeOptions = ref<any[]>([])

const form = ref<FreightTemplate>({
  name: '',
  is_default: 0,
  freight_rules: []
})

const rules = ref<FormRules>({
  name: [{ required: true, message: '请输入模版名称', trigger: 'blur' }]
})

const fetchSizes = async () => {
  try {
    const res: any = await getEnums({ category: 'fruit_size' })
    if (res.code === 200) {
      sizeOptions.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch sizes', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await getFreightTemplates()
    if (res.code === 200) {
      tableData.value = res.data.map((item: any) => ({
        ...item,
        freight_rules: typeof item.freight_rules === 'string' ? JSON.parse(item.freight_rules) : (item.freight_rules || [])
      }))
    } else {
      ElMessage.error(res.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const getEmptyRule = (): FreightRule => ({
  regions: [],
  sizes: [],
  is_free: false,
  free_weight: 0,
  first_weight: 1,
  first_price: 10,
  extra_weight: 1,
  extra_price: 5
})

const addRule = () => {
  form.value.freight_rules.push(getEmptyRule());
}

const removeRule = (index: number) => {
  form.value.freight_rules.splice(index, 1);
}

const handleAdd = () => {
  dialogTitle.value = '新增运费模版'
  form.value = {
    name: '',
    is_default: 0,
    effective_time: '',
    freight_rules: [getEmptyRule()]
  }
  dialogVisible.value = true
}

const handleEdit = (row: FreightTemplate) => {
  dialogTitle.value = '编辑运费模版'
  const tempForm = JSON.parse(JSON.stringify(row))
  if (!tempForm.freight_rules) {
    tempForm.freight_rules = []
  } else {
    // 兼容缺失旧字段的脏数据，确保 Vue v-model 双向绑定不卡死
    tempForm.freight_rules = tempForm.freight_rules.map((rule: any) => ({
      regions: rule.regions || [],
      sizes: rule.sizes || [],
      is_free: rule.is_free || false,
      free_weight: rule.free_weight !== undefined ? rule.free_weight : 0,
      first_weight: rule.first_weight !== undefined ? rule.first_weight : 1,
      first_price: rule.first_price !== undefined ? rule.first_price : 10,
      extra_weight: rule.extra_weight !== undefined ? rule.extra_weight : 1,
      extra_price: rule.extra_price !== undefined ? rule.extra_price : 5
    }))
  }
  form.value = tempForm
  dialogVisible.value = true
}

const handleDelete = (row: FreightTemplate) => {
  ElMessageBox.confirm('确认删除该运费模版吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteFreightTemplate(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleDefaultChange = async (row: FreightTemplate) => {
  try {
    const res: any = await updateFreightTemplate(row.id!, row)
    if (res.code === 200) {
      ElMessage.success('状态修改成功')
      fetchData()
    } else {
      row.is_default = row.is_default === 1 ? 0 : 1
      ElMessage.error(res.message || '状态修改失败')
    }
  } catch (error) {
    row.is_default = row.is_default === 1 ? 0 : 1
    ElMessage.error('状态修改失败')
  }
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = { ...form.value }
        let res: any
        
        if (submitData.id) {
          res = await updateFreightTemplate(submitData.id, submitData)
        } else {
          res = await createFreightTemplate(submitData)
        }
        
        if (res.code === 200) {
          ElMessage.success(submitData.id ? '修改成功' : '新增成功')
          dialogVisible.value = false
          fetchData()
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
  })
}

onMounted(() => {
  fetchSizes()
  fetchData()
})
</script>

<style scoped>
.header-container {
  margin-bottom: 20px;
}
:deep(.el-input-number.is-without-controls .el-input__inner) {
  text-align: left;
  padding-left: 10px;
  padding-right: 10px;
}
</style>