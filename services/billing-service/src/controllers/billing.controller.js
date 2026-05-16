const billingService = require('../services/billing.service');

class BillingController {
    async getAllInvoices(req, res, next) {
        try {
            const invoices = await billingService.getAllInvoices();
            res.json(invoices);
        } catch (err) {
            next(err);
        }
    }

    async createInvoice(req, res, next) {
        try {
            const { customer_id, amount } = req.body;
            if (!customer_id || !amount) {
                return res.status(400).json({ error: 'customer_id and amount are required' });
            }
            const invoice = await billingService.createInvoice(req.body);
            res.status(201).json(invoice);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new BillingController();
