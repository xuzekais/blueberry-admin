const fs = require('fs');
const path = 'src/views/order/index.vue';
let content = fs.readFileSync(path, 'utf8');

const regexPicker = /<el-date-picker\s+v-model="exportDateRange"\s+type="daterange"\s+range-separator="至"\s+start-placeholder="开始日期"\s+end-placeholder="结束日期"\s+value-format="YYYY-MM-DD"\s+\/>/m;

const newPicker = `<el-date-picker
            v-model="exportDateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />`;

content = content.replace(regexPicker, newPicker);

const regexHandleExport = /const handleExport = \(\) => \{\s*exportDateRange\.value = \[\]\s*exportDialogVisible\.value = true\s*\}/m;

const newHandleExport = `const handleExport = () => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

  const startDate = new Date(yesterday.getTime() + 16 * 60 * 60 * 1000) // 昨天 16:00:00
  const endDate = new Date(today.getTime() + 12 * 60 * 60 * 1000) // 今天 12:00:00

  const format = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return \`\${d.getFullYear()}-\${pad(d.getMonth() + 1)}-\${pad(d.getDate())} \${pad(d.getHours())}:\${pad(d.getMinutes())}:\${pad(d.getSeconds())}\`
  }

  exportDateRange.value = [format(startDate), format(endDate)]
  exportDialogVisible.value = true
}`;

content = content.replace(regexHandleExport, newHandleExport);

const regexSubmitExport = /const url = `\/api\/orders\/export\/download\?startDate=\$\{startDate\}&endDate=\$\{endDate\}`/m;
const newSubmitExport = "const url = `/api/orders/export/download?startTime=${startDate}&endTime=${endDate}`"; // changing to startTime and endTime to match backend params

content = content.replace(regexSubmitExport, newSubmitExport);

fs.writeFileSync(path, content);
console.log('Frontend date update done');
