<template>
  <div class="enum-container">
    <div class="header-actions">
      <h2>枚举管理</h2>
      <el-button type="primary" @click="handleAdd">新增枚举</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="category" label="分类" width="180">
        <template #default="scope">
          <el-tag v-if="scope.row.category === 'fruit_size'" type="success">果径大小</el-tag>
          <el-tag v-else-if="scope.row.category === 'pack_spec'" type="warning">包装规格</el-tag>
          <el-tag v-else>{{ scope.row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="label" label="展示文本" width="150" />
      <el-table-column prop="value" label="枚举值" width="150" />
      <el-table-column prop="sort_order" label="排序" width="80" align="center" />
      <el-table-column prop="is_active" label="状态" width="100" align="center">
        <template #default="scope">
          <el-switch
            v-model="scope.row.is_active"
            :active-value="1"
            :inactive-value="0"
            @change="(val) => handleStatusChange(scope.row, val)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="150" align="center">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗表单 -->
    <el-dialog :title="dialogType === 'add' ? '新增枚举' : '编辑枚举'" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择或输入枚举分类" allow-create filterable style="width: 100%">
            <el-option label="果径大小 (fruit_size)" value="fruit_size" />
            <el-option label="包装规格 (pack_spec)" value="pack_spec" />
          </el-select>
        </el-form-item>
        <el-form-item label="展示文本" prop="label">
          <el-input v-model="form.label" placeholder="如: 15+" />
        </el-form-item>
        <el-form-item label="枚举值" prop="value">
          <el-input v-model="form.value" placeholder="后台实际存储的值" />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="is_active">
          <el-switch v-model="form.is_active" :active-value="1" :inactive-value="0" />
        </el-form-item>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getEnums, createEnum, updateEnum, deleteEnum, type EnumItem } from '../../api/enum'

const tableData = ref<EnumItem[]>([])
const loading = ref(false)

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = ref<EnumItem>({
  category: '',
  label: '',
  value: '',
  sort_order: 0,
  is_active: 1
})

const rules: FormRules = {
  category: [{ required: true, message: '请选择或输入分类', trigger: 'change' }],
  label: [{ required: true, message: '请输入展示文本', trigger: 'blur' }],
  value: [{ required: true, message: '请输入枚举值', trigger: 'blur' }]
}

// 获取列表数据
const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await getEnums()
    if (res.code === 200) {
      tableData.value = res.data
    } else {
      ElMessage.error(res.message || '获取枚举列表失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '网络错误')
  } finally {
    loading.value = false
  }
}

// 快速更改状态
const handleStatusChange = async (row: EnumItem, val: string | number | boolean) => {
  try {
    const res: any = await updateEnum(row.id!, { is_active: val as number })
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
    } else {
      row.is_active = val === 1 ? 0 : 1 // 还原状态
      ElMessage.error(res.message || '更新失败')
    }
  } catch (err) {
    row.is_active = val === 1 ? 0 : 1
    ElMessage.error('更新失败')
  }
}

// 新增相关
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    category: '',
    label: '',
    value: '',
    sort_order: 0,
    is_active: 1
  }
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 编辑相关
const handleEdit = (row: EnumItem) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        let res: any
        if (dialogType.value === 'add') {
          res = await createEnum(form.value)
        } else {
          res = await updateEnum(form.value.id!, form.value)
        }
        
        if (res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
          dialogVisible.value = false
          fetchList()
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || error.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 删除相关
const handleDelete = (row: EnumItem) => {
  ElMessageBox.confirm(`确认删除该项 [${row.label}] 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteEnum(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '删除出错')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.enum-container {
  padding: 20px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
