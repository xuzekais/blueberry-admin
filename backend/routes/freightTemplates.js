const express = require('express');
const router = express.Router();
const freightTemplateController = require('../controllers/freightTemplateController');

// 运费模版
router.get('/', freightTemplateController.getAllFreightTemplates);
router.get('/:id', freightTemplateController.getFreightTemplateById);
router.post('/', freightTemplateController.createFreightTemplate);
router.put('/:id', freightTemplateController.updateFreightTemplate);
router.delete('/:id', freightTemplateController.deleteFreightTemplate);

module.exports = router;