const db = require('@nexbill/db');
const axios = require('axios');

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:7124';
const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:7126';

class SubscriptionService {
    async getAllSubscriptions() {
        const { rows: subs } = await db.query(`
            SELECT s.*, p.name as plan_name, p.price
            FROM subscription.subscriptions s
            JOIN subscription.plans p ON s.plan_id = p.id
            ORDER BY s.created_at DESC
        `);
        
        // Fetch customer details via HTTP from Identity Service
        const subsWithCustomers = await Promise.all(subs.map(async (s) => {
            try {
                const custRes = await axios.get(`${IDENTITY_SERVICE_URL}/api/customers/${s.customer_id}`);
                return { ...s, customer_name: custRes.data.name };
            } catch(e) {
                return { ...s, customer_name: 'Unknown' };
            }
        }));

        return subsWithCustomers;
    }

    async getSubscriptionById(id) {
        const { rows } = await db.query(`
            SELECT s.*, p.name as plan_name, p.price
            FROM subscription.subscriptions s
            JOIN subscription.plans p ON s.plan_id = p.id
            WHERE s.id = $1
        `, [id]);
        
        if (rows.length === 0) return null;
        
        const sub = rows[0];
        try {
            const custRes = await axios.get(`${IDENTITY_SERVICE_URL}/api/customers/${sub.customer_id}`);
            sub.customer_name = custRes.data.name;
        } catch(e) {
            sub.customer_name = 'Unknown';
        }

        return sub;
    }

    async createSubscription(data) {
        const { customer_id, plan_id } = data;
        
        // 1. Get Plan details
        const { rows: planRows } = await db.query('SELECT * FROM subscription.plans WHERE id = $1', [plan_id]);
        if (planRows.length === 0) throw new Error('Plan not found');
        const plan = planRows[0];

        // 2. Calculate dates
        const startDate = new Date();
        const nextBillingDate = new Date();
        nextBillingDate.setDate(startDate.getDate() + 30);

        // 3. Create Subscription
        const { rows: subRows } = await db.query(
            `INSERT INTO subscription.subscriptions (customer_id, plan_id, status, start_date, next_billing_date)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [customer_id, plan_id, 'active', startDate, nextBillingDate]
        );
        const subscription = subRows[0];

        // 4. Auto-trigger first Invoice in Billing Service
        try {
            await axios.post(`${BILLING_SERVICE_URL}/api/invoices`, {
                subscription_id: subscription.id,
                customer_id: customer_id,
                amount: plan.price,
                status: 'unpaid'
            });
            console.log(`Auto-generated invoice for subscription ${subscription.id}`);
        } catch (err) {
            console.error('Failed to auto-generate invoice:', err.message);
            // We don't fail the subscription creation if invoice fails, but we log it
        }

        return subscription;
    }

    async cancelSubscription(id) {
        const { rows } = await db.query(
            `UPDATE subscription.subscriptions SET status = 'cancelled' WHERE id = $1 RETURNING *`,
            [id]
        );
        return rows.length > 0 ? rows[0] : null;
    }
}

module.exports = new SubscriptionService();
