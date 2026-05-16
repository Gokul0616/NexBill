const db = require('@nexbill/db');
const axios = require('axios');

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:7124';

class BillingService {
    async getAllInvoices() {
        const { rows: invoices } = await db.query('SELECT * FROM billing.invoices ORDER BY created_at DESC');
        
        // Fetch customer details via HTTP from Identity Service
        const invoicesWithCustomers = await Promise.all(invoices.map(async (i) => {
            try {
                const custRes = await axios.get(`${IDENTITY_SERVICE_URL}/api/customers/${i.customer_id}`);
                return { ...i, customer_name: custRes.data.name };
            } catch(e) {
                return { ...i, customer_name: 'Unknown' };
            }
        }));

        return invoicesWithCustomers;
    }

    async createInvoice(data) {
        const { subscription_id, customer_id, amount, status = 'unpaid' } = data;
        const { rows } = await db.query(
            'INSERT INTO billing.invoices (subscription_id, customer_id, amount, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [subscription_id || null, customer_id, amount, status]
        );
        return rows[0];
    }
}

module.exports = new BillingService();
