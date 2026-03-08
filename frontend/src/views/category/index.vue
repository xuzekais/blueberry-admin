<template>
  <div class="category-container">
    <div class="header-actions">
      <h2>分类管理</h2>
      <el-button type="primary" @click="handleAdd">新增分类</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="分类名称" width="150" />
      <el-table-column prop="code" label="分类编码" width="150" />
      <el-table-column prop="description" label="描述" min-width="200" />
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
      <el-table-column label="操作" width="150" align="center">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗表单 -->
    <el-dialog :title="dialogType === 'add' ? '新增分类' : '编辑分类'" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="如: 商品分类" />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="form.code" placeholder="如: goods_category (须唯一)" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description" placeholder="分类相关描述" />
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
import { getCategories, createCategory, updateCategory, deleteCategory, type CategoryItem } from '../../api/category'

const tableData = ref<CategoryItem[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = ref<CategoryItem>({
  name: '',
  code: '',
  description: '',
  sort_order: 0,
  is_active: 1
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入分类编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '编码只能包含字母、数字和下划线', trigger: 'blur'}
  ]
}

const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await getCategories()
    if (res.code === 200) {
      tableData.value = res.data
    } else {
      ElMessage.error(res.message || '获取分类列表失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '网络错误')
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (row: CategoryItem, val: string | number | boolean) => {
  try {
    const res: any = await updateCategory(row.id!, { is_active: val as number })
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
    } else {
      row.is_active = val === 1 ? 0 : 1
      ElMessage.error(res.message || '更新失败')
    }
  } catch (err) {
    row.is_active = val === 1 ? 0 : 1
    ElMessage.error('更新失败')
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    code: '',
    description: '',
    sort_order: 0,
    is_active: 1
  }
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

const handleEdit = (row: CategoryItem) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        let res: any
        if (dialogType.value === 'add') {
          res = await createCategory(form.value)
        } else {
          res = await updateCategory(form.value.id!, form.value)
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

const handleDelete = (row: CategoryItem) => {
  ElMessageBox.confirm(`确认删除该分类 [${row.name}] 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await deleteCategory(row.id!)
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
.category-container {
  padding: 20px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>