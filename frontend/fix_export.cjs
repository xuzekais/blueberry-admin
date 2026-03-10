const fs = require('fs');
let code = fs.readFileSync('src/views/order/index.vue', 'utf8');

const importIconLine = `import { Plus, Search } from '@element-plus/icons-vue'`;
const newImportIconLine = `import { Plus, Search, Download } from '@element-plus/icons-vue'`;
code = code.replace(importIconLine, newImportIconLine);

const btnStr = `<el-button type="success" :icon="Plus" @click="openImportDialog" style="margin-left: 10px;">导入订单</el-button>`;
const newBtnStr = `<el-button type="success" :icon="Plus" @click="openImportDialog" style="margin-left: 10px;">导入订单</el-button>
        <el-button type="warning" :icon="Download" @click="handleExport" style="margin-left: 10px;">导出订单</el-button>`;
code = code.replace(btnStr, newBtnStr);

const dialogStr = `<!-- 导入订单对话框 -->`;
const newDialogStr = `<!-- 导出订单对话框 -->
    <el-dialog title="导出订单" v-model="exportDialogVisible" width="400px">
      <el-form label-width="100px">
        <el-form-item label="订单时间范围">
          <el-date-picker
            v-model="exportDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
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

    <!-- 导入订单对话框 -->`;
code = code.replace(dialogStr, newDialogStr);

const scriptAddStr = `// 导入相关状态与方法
const importDialogVisible = ref(false)`;
const newScriptAddStr = `// 导出相关状态与方法
const exportDialogVisible = ref(false)
const exportDateRange = ref<[string, string] | []>([])
const exporting = ref(false)

const handleExport = () => {
  exportDateRange.value = []
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
    const url = \`/api/orders/export/download?startDate=\${startDate}&endDate=\${endDate}\`
    window.open(url, '_blank')
    exportDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

// 导入相关状态与方法
const importDialogVisible = ref(false)`;
code = code.replace(scriptAddStr, newScriptAddStr);

fs.writeFileSync('src/views/order/index.vue', code);
console.log('Update done');
