const express = require('express');
const router = express.Router();
const enumController = require('../controllers/enumController');

// 枚举管理路由
// GET /api/enums - 获取所有枚举 (或查某个 category)
router.get('/', enumController.getEnums);

// GET /api/enums/:id - 获取指定 id 的枚举
router.get('/:id', enumController.getEnumById);

// POST /api/enums - 新建
router.post('/', enumController.createEnum);

// PUT /api/enums/:id - 修改
router.put('/:id', enumController.updateEnum);

// DELETE /api/enums/:id - 删除
router.delete('/:id', enumController.deleteEnum);

module.exports = router;
