const { Router } = require('express');
const paymentController = require('../controllers/payment.controller');

const router = Router();

router.post('/create-order', paymentController.createOrder);
router.post('/webhook', paymentController.webhook);

module.exports = router;
