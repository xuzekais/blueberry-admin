const express = require('express');
const router = express.Router();
const multer = require('multer');
const orderController = require('../controllers/orderController');

// 配置文件上传存在内存中处理
const upload = multer({ storage: multer.memoryStorage() });

// Excel 导入路由必须在 /:id 的路由之前避免匹配冲突
router.post('/upload', upload.single('file'), orderController.uploadExcel);

// 导出路由
router.get('/export/download', orderController.exportOrders);

// 订单路由定义
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
