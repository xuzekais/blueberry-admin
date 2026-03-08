const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../controllers/importController');

// 使用内存存储，将文件数据读取到内存 buffer 中传递给 xlsx
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/import/orders
router.post('/orders', upload.single('file'), importController.uploadOrders);

module.exports = router;
