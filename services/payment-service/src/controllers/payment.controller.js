const paymentService = require('../services/payment.service');

class PaymentController {
    async createOrder(req, res, next) {
        try {
            if (!req.body.invoice_id || !req.body.amount) {
                return res.status(400).json({ error: 'invoice_id and amount are required' });
            }
            const result = await paymentService.createOrder(req.body);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    }

    async webhook(req, res, next) {
        try {
            const signature = req.headers['x-razorpay-signature'];
            const isValid = paymentService.verifySignature(req.body, signature);

            if (!isValid) {
                return res.status(400).json({ error: 'Invalid signature' });
            }

            const paymentId = req.body.payload.payment.entity.id;
            const orderId = req.body.payload.payment.entity.order_id;
            
            await paymentService.capturePayment(paymentId, orderId);
            console.log(`Payment captured for order ${orderId}`);
            
            res.status(200).json({ status: 'ok' });
        } catch (err) {
            console.error('Webhook error:', err);
            res.status(500).json({ error: 'DB Error' });
        }
    }
}

module.exports = new PaymentController();
