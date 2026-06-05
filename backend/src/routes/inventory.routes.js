const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

router.get('/', inventoryController.getAllItems);
router.post('/', inventoryController.createItem);
router.patch('/:id', inventoryController.updateItem);

module.exports = router;
