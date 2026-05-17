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

    async getDashboardStats() {
        const { rows: stats } = await db.query(`
            SELECT 
                SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_mrr,
                COUNT(CASE WHEN status = 'unpaid' THEN 1 END) as pending_invoices
            FROM billing.invoices
        `);

        const { rows: recentInvoices } = await db.query('SELECT * FROM billing.invoices ORDER BY created_at DESC LIMIT 5');
        
        // Enrich with customer names
        const enrichedInvoices = await Promise.all(recentInvoices.map(async (i) => {
            try {
                const custRes = await axios.get(`${IDENTITY_SERVICE_URL}/api/customers/${i.customer_id}`);
                return { ...i, customer_name: custRes.data.name, customer_email: custRes.data.email };
            } catch(e) {
                return { ...i, customer_name: 'Unknown', customer_email: 'unknown@example.com' };
            }
        }));

        let totalMrr = 0;
        let pendingInvoicesCount = 0;

        if (stats && stats.length > 0) {
            // Check if it is the PostgreSQL aggregated result or the raw Mongo array
            if ('total_mrr' in stats[0] || 'pending_invoices' in stats[0]) {
                // PostgreSQL aggregate result
                totalMrr = Number(stats[0].total_mrr || 0);
                pendingInvoicesCount = Number(stats[0].pending_invoices || 0);
            } else {
                // MongoDB raw array of invoice documents
                stats.forEach(inv => {
                    if (inv.status === 'paid') {
                        totalMrr += Number(inv.amount || 0);
                    } else if (inv.status === 'unpaid') {
                        pendingInvoicesCount += 1;
                    }
                });
            }
        }

        return {
            totalMRR: totalMrr,
            pendingInvoices: pendingInvoicesCount,
            recentPayments: enrichedInvoices
        };
    }
}

module.exports = new BillingService();
