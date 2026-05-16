const db = require('@nexbill/db');
const razorpayInstance = require('../config/razorpay');
const crypto = require('crypto');

class PaymentService {
    async createOrder(data) {
        const { invoice_id, amount } = data;
        
        const options = {
            amount: parseInt(amount) * 100, // Razorpay takes amount in paise
            currency: "INR",
            receipt: `receipt_inv_${invoice_id}`
        };
        
        const order = await razorpayInstance.orders.create(options);

        const { rows } = await db.query(
            `INSERT INTO payment.transactions (invoice_id, razorpay_order_id, amount) VALUES ($1, $2, $3) RETURNING *`,
            [invoice_id, order.id, amount]
        );

        return { order, transaction: rows[0] };
    }

    verifySignature(body, signature) {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(body));
        const digest = shasum.digest('hex');
        
        return digest === signature;
    }

    async capturePayment(paymentId, orderId) {
        await db.query(
            `UPDATE payment.transactions SET status = 'captured', razorpay_payment_id = $1 WHERE razorpay_order_id = $2`,
            [paymentId, orderId]
        );
        return true;
    }
}

module.exports = new PaymentService();
