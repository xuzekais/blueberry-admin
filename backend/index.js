const express = require('express');
const cors = require('cors');
require('dotenv').config();

const orderRoutes = require('./routes/orders');
const enumsRoutes = require('./routes/enums');
const categoriesRoutes = require('./routes/categories');
const costTemplatesRoutes = require('./routes/costTemplates');
const freightTemplatesRoutes = require('./routes/freightTemplates');
const importRoutes = require('./routes/import');

const app = express();
const PORT = process.env.PORT || 3100;

// Middleware
app.use(cors());
// 解析 JSON 和 URL encoded 格式请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', msg: '蓝莓订单管理系统 API 正常运行' });
});

// 挂载订单路由
app.use('/api/orders', orderRoutes);
app.use('/api/enums', enumsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cost-templates', costTemplatesRoutes);
app.use('/api/freight-templates', freightTemplatesRoutes);
app.use('/api/import', importRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
