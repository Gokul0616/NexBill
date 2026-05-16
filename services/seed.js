const db = require('@nexbill/db');
const fs = require('fs');
const path = require('path');

async function seed() {
  await db.init();
  try {
    if (db.mode === 'postgres') {
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await db.query(schemaSql);
      console.log('Schemas created.');
      await db.query('TRUNCATE identity.customers, subscription.plans, subscription.subscriptions, billing.invoices RESTART IDENTITY CASCADE');
    } else {
      console.log('Clearing MongoDB collections...');
      await db.db.collection('customers').deleteMany({});
      await db.db.collection('plans').deleteMany({});
      await db.db.collection('subscriptions').deleteMany({});
      await db.db.collection('invoices').deleteMany({});
    }

    const customerRes = await db.query(`
      INSERT INTO identity.customers (name, email, phone, gst_number) VALUES 
      ('Iron Gym', 'admin@irongym.in', '+91 9876543210', '22AAAAA0000A1Z5'),
      ('Growth Hackers Agency', 'billing@growthhackers.co', '+91 8765432109', '29BBBBB1111B2Z6'),
      ('CodeCrafters SaaS', 'finance@codecrafters.io', '+91 7654321098', '27CCCCC2222C3Z7'),
      ('Elite Coaching Center', 'hello@elitecoaching.com', '+91 6543210987', NULL)
      RETURNING id;
    `);
    
    const planRes = await db.query(`
      INSERT INTO subscription.plans (name, price, billing_cycle, features) VALUES 
      ('Basic Plan', 999.00, 'monthly', 'Up to 100 users, Email Support, Basic Reporting'),
      ('Pro Plan', 2499.00, 'monthly', 'Unlimited users, 24/7 Phone Support, Advanced Analytics, Custom Domain'),
      ('Annual Enterprise', 24990.00, 'yearly', 'Everything in Pro, Dedicated Account Manager, Custom Integration')
      RETURNING id;
    `);

    // In Mongo, the multi-insert returns an array of documents
    const customers = customerRes.rows;
    const plans = planRes.rows;

    const subRes = await db.query(`
      INSERT INTO subscription.subscriptions (customer_id, plan_id, status, start_date, next_billing_date) VALUES 
      ($1, $4, 'active', '2026-05-01', '2026-06-01'),
      ($2, $5, 'active', '2026-05-10', '2026-06-10'),
      ($3, $6, 'active', '2026-01-15', '2027-01-15'),
      ($1, $5, 'past_due', '2026-04-05', '2026-05-05')
      RETURNING id;
    `, [customers[0].id, customers[1].id, customers[2].id, plans[0].id, plans[1].id, plans[2].id]);
    
    const subs = subRes.rows;

    await db.query(`
      INSERT INTO billing.invoices (subscription_id, customer_id, amount, status, due_date, invoice_date) VALUES 
      ($1, $5, 999.00, 'paid', '2026-05-01', '2026-05-01'),
      ($2, $6, 2499.00, 'pending', '2026-05-15', '2026-05-10'),
      ($3, $7, 24990.00, 'paid', '2026-01-20', '2026-01-15'),
      ($4, $5, 2499.00, 'overdue', '2026-05-05', '2026-05-05')
    `, [subs[0].id, subs[1].id, subs[2].id, subs[3].id, customers[0].id, customers[1].id, customers[2].id]);

    console.log('Database seeded successfully!');
  } catch(e) {
    console.error('Seeding error:', e);
  } finally {
    process.exit(0);
  }
}
seed();
