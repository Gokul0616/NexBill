const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/billing',
});

async function seed() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('Schemas created.');

    await pool.query('TRUNCATE identity.customers, subscription.plans, subscription.subscriptions, billing.invoices RESTART IDENTITY CASCADE');

    const customerRes = await pool.query(`
      INSERT INTO identity.customers (name, email, phone, gst_number) VALUES 
      ('Iron Gym', 'admin@irongym.in', '+91 9876543210', '22AAAAA0000A1Z5'),
      ('Growth Hackers Agency', 'billing@growthhackers.co', '+91 8765432109', '29BBBBB1111B2Z6'),
      ('CodeCrafters SaaS', 'finance@codecrafters.io', '+91 7654321098', '27CCCCC2222C3Z7'),
      ('Elite Coaching Center', 'hello@elitecoaching.com', '+91 6543210987', NULL)
      RETURNING id;
    `);
    
    const planRes = await pool.query(`
      INSERT INTO subscription.plans (name, price, billing_cycle, features) VALUES 
      ('Basic Plan', 999.00, 'monthly', 'Up to 100 users, Email Support, Basic Reporting'),
      ('Pro Plan', 2499.00, 'monthly', 'Unlimited users, 24/7 Phone Support, Advanced Analytics, Custom Domain'),
      ('Annual Enterprise', 24990.00, 'yearly', 'Everything in Pro, Dedicated Account Manager, Custom Integration')
      RETURNING id;
    `);

    const subRes = await pool.query(`
      INSERT INTO subscription.subscriptions (customer_id, plan_id, status, start_date, next_billing_date) VALUES 
      ($1, $4, 'active', '2026-05-01', '2026-06-01'),
      ($2, $5, 'active', '2026-05-10', '2026-06-10'),
      ($3, $6, 'active', '2026-01-15', '2027-01-15'),
      ($1, $5, 'past_due', '2026-04-05', '2026-05-05')
      RETURNING id;
    `, [customerRes.rows[0].id, customerRes.rows[1].id, customerRes.rows[2].id, planRes.rows[0].id, planRes.rows[1].id, planRes.rows[2].id]);
    const subs = subRes.rows;

    await pool.query(`
      INSERT INTO billing.invoices (subscription_id, customer_id, amount, status, due_date, invoice_date) VALUES 
      ($1, $5, 999.00, 'paid', '2026-05-01', '2026-05-01'),
      ($2, $6, 2499.00, 'pending', '2026-05-15', '2026-05-10'),
      ($3, $7, 24990.00, 'paid', '2026-01-20', '2026-01-15'),
      ($4, $5, 2499.00, 'overdue', '2026-05-05', '2026-05-05')
    `, [subs[0].id, subs[1].id, subs[2].id, subs[3].id, customerRes.rows[0].id, customerRes.rows[1].id, customerRes.rows[2].id]);

    console.log('Database seeded with schemas successfully!');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
seed();
