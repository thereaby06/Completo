const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

router.get('/', invoiceController.getAllInvoices);
router.post('/', invoiceController.createInvoice);

module.exports = router;
