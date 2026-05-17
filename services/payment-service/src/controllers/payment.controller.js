const db = require('@nexbill/db');
const paymentService = require('../services/payment.service');

class PaymentController {
    async createOrder(req, res, next) {
        try {
            if (!req.body.invoice_id || !req.body.amount) {
                return res.status(400).json({ error: 'invoice_id and amount are required' });
            }

            // Identify user from header
            const userHeader = req.headers['x-user-payload'];
            if (userHeader) {
                try {
                    const decoded = JSON.parse(userHeader);
                    const userId = decoded.userId;

                    // Query the database to check if the user is blocked or payments are blocked
                    const { rows } = await db.query(
                        'SELECT is_blocked, payments_blocked FROM identity.users WHERE id = $1',
                        [userId]
                    );

                    if (rows && rows.length > 0) {
                        const user = rows[0];
                        // If they are fully blocked, prevent all payment order creations
                        if (user.is_blocked === true || user.is_blocked === 'true') {
                            return res.status(403).json({ error: 'Forbidden: Your account is suspended. All payments are disabled.' });
                        }

                        // If payments are blocked, block only live payments (allow test mode)
                        const isLive = req.body.mode !== 'test';
                        if (isLive && (user.payments_blocked === true || user.payments_blocked === 'true')) {
                            return res.status(403).json({ 
                                error: 'Forbidden: Live payment processing has been temporarily restricted by NexBill operators. Test payments are still active.' 
                            });
                        }
                    }
                } catch (e) {
                    console.error('Failed to evaluate payment permissions:', e.message);
                }
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
