const { Router } = require('express');
const billingController = require('../controllers/billing.controller');

const router = Router();

router.get('/', billingController.getAllInvoices);
router.post('/', billingController.createInvoice);

module.exports = router;
