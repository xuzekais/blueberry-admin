const express = require('express');
const router = express.Router();
const costTemplateController = require('../controllers/costTemplateController');

// 成本模版
router.get('/', costTemplateController.getAllCostTemplates);
router.get('/:id', costTemplateController.getCostTemplateById);
router.post('/', costTemplateController.createCostTemplate);
router.put('/:id', costTemplateController.updateCostTemplate);
router.delete('/:id', costTemplateController.deleteCostTemplate);

module.exports = router;