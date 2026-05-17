const express = require('express');
const customerRoutes = require('./routes/customer.routes');
const authRoutes = require('./routes/auth.routes');
const identityMiddleware = require('./middlewares/identity.middleware');
const errorHandler = require('./middlewares/error.middleware');
const db = require('@nexbill/db');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../../.env' });

// Dynamic database migrations and admin injection
(async () => {
  try {
    await db.init();
    if (db.mode === 'postgres') {
      await db.query(`
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS payments_blocked BOOLEAN DEFAULT FALSE;
        ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS custom_banner_message VARCHAR(255) DEFAULT NULL;

        CREATE TABLE IF NOT EXISTS identity.merchant_activations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER UNIQUE REFERENCES identity.users(id) ON DELETE CASCADE,
            legal_name VARCHAR(255),
            website_url VARCHAR(255),
            tax_id VARCHAR(100),
            bank_account_last4 VARCHAR(4),
            industry VARCHAR(100),
            support_phone VARCHAR(50),
            support_email VARCHAR(255),
            ssn_last_4 VARCHAR(4),
            business_address_line1 VARCHAR(255),
            business_address_line2 VARCHAR(255),
            business_address_city VARCHAR(100),
            business_address_state VARCHAR(100),
            business_address_postal VARCHAR(20),
            rep_address_line1 VARCHAR(255),
            rep_address_city VARCHAR(100),
            rep_address_state VARCHAR(100),
            rep_address_postal VARCHAR(20),
            business_entity_type VARCHAR(100),
            doing_business_as VARCHAR(255),
            product_description TEXT,
            statement_descriptor VARCHAR(22),
            business_pan VARCHAR(20),
            gstin VARCHAR(20),
            reg_number VARCHAR(100),
            iec VARCHAR(20),
            tc_url VARCHAR(255),
            refund_url VARCHAR(255),
            rep_title VARCHAR(100),
            rep_pan VARCHAR(20),
            rep_aadhaar VARCHAR(20),
            rep_is_director BOOLEAN DEFAULT FALSE,
            rep_is_owner BOOLEAN DEFAULT FALSE,
            rep_is_executive BOOLEAN DEFAULT FALSE,
            rep_ownership INTEGER DEFAULT 0,
            account_name VARCHAR(255),
            account_type VARCHAR(50),
            ifsc VARCHAR(50),
            beneficial_owners TEXT,
            verification_status VARCHAR(50) DEFAULT 'pending',
            charges_enabled BOOLEAN DEFAULT FALSE,
            payouts_enabled BOOLEAN DEFAULT FALSE,
            currently_due JSONB DEFAULT '[]'::jsonb,
            verification_comments TEXT,
            rep_name VARCHAR(255),
            rep_dob VARCHAR(50),
            accept_international BOOLEAN DEFAULT FALSE,
            pan_doc_url VARCHAR(512),
            business_proof_url VARCHAR(512),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE identity.merchant_activations ADD COLUMN IF NOT EXISTS rep_name VARCHAR(255);
        ALTER TABLE identity.merchant_activations ADD COLUMN IF NOT EXISTS rep_dob VARCHAR(50);
        ALTER TABLE identity.merchant_activations ADD COLUMN IF NOT EXISTS accept_international BOOLEAN DEFAULT FALSE;
        ALTER TABLE identity.merchant_activations ADD COLUMN IF NOT EXISTS pan_doc_url VARCHAR(512);
        ALTER TABLE identity.merchant_activations ADD COLUMN IF NOT EXISTS business_proof_url VARCHAR(512);

        CREATE TABLE IF NOT EXISTS identity.merchant_banners (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES identity.users(id) ON DELETE CASCADE,
            banner_key VARCHAR(100),
            message TEXT,
            type VARCHAR(50) DEFAULT 'info',
            cta_label VARCHAR(100) DEFAULT NULL,
            cta_link VARCHAR(255) DEFAULT NULL,
            is_dismissed BOOLEAN DEFAULT FALSE,
            is_enabled BOOLEAN DEFAULT TRUE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_user_banner UNIQUE (user_id, banner_key)
        );
      `);
      console.log('Identity service auto-migrations executed successfully.');
    }

    // Check and inject default admin account for both PG and MongoDB fallback
    if (db.mode === 'postgres' || db.mode === 'mongo') {
      const adminEmail = 'admin@nexbill.com';
      const { rows } = await db.query('SELECT id FROM identity.users WHERE email = $1', [adminEmail]);
      if (!rows || rows.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.query(`
          INSERT INTO identity.users (
            email, password_hash, name, company, business_type, country, role, 
            is_activated, verification_status, charges_enabled, payouts_enabled
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          adminEmail, hashedPassword, 'Administrator', 'NexBill Inc.', 'corporation', 'IN', 'admin',
          true, 'verified', true, true
        ]);
        console.log('Default admin account (admin@nexbill.com) injected successfully.');
      }
    }
  } catch (err) {
    console.error('Identity auto-migrations/admin injection failed:', err.message);
  }
})();

const path = require('path');
const fs = require('fs');

const app = express();

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

app.use(express.json());
app.use(identityMiddleware);

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);

// Error Handling
app.use(errorHandler);

module.exports = app;
