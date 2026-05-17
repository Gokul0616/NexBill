CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS subscription;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS payment;

-- Identity Service Schema
CREATE TABLE IF NOT EXISTS identity.customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    gst_number VARCHAR(50),
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS identity.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    business_type VARCHAR(255),
    country VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'admin',
    is_activated BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50) DEFAULT 'pending', -- pending, restricted, verified
    charges_enabled BOOLEAN DEFAULT FALSE,
    payouts_enabled BOOLEAN DEFAULT FALSE,
    currently_due JSONB DEFAULT '[]'::jsonb,
    verification_comments TEXT,
    is_blocked BOOLEAN DEFAULT FALSE,
    payments_blocked BOOLEAN DEFAULT FALSE,
    custom_banner_message VARCHAR(255) DEFAULT NULL,
    legal_name VARCHAR(255),
    website_url VARCHAR(255),
    tax_id VARCHAR(100),
    bank_account_last4 VARCHAR(4),
    business_address_line1 VARCHAR(255),
    business_address_line2 VARCHAR(255),
    business_address_city VARCHAR(100),
    business_address_state VARCHAR(100),
    business_address_postal VARCHAR(20),
    rep_address_line1 VARCHAR(255),
    rep_address_city VARCHAR(100),
    rep_address_state VARCHAR(100),
    rep_address_postal VARCHAR(20),
    industry VARCHAR(100),
    support_phone VARCHAR(50),
    support_email VARCHAR(255),
    ssn_last_4 VARCHAR(4),
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
    rep_aadhaar VARCHAR(4),
    rep_is_director BOOLEAN DEFAULT FALSE,
    rep_is_owner BOOLEAN DEFAULT FALSE,
    rep_is_executive BOOLEAN DEFAULT FALSE,
    rep_ownership INTEGER,
    account_name VARCHAR(255),
    account_type VARCHAR(50),
    ifsc VARCHAR(20),
    beneficial_owners JSONB,
    rep_name VARCHAR(255),
    rep_dob VARCHAR(50),
    accept_international BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Service Schema
CREATE TABLE IF NOT EXISTS subscription.plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(50) DEFAULT 'monthly',
    features TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscription.subscriptions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL, -- Foreign key to identity.customers (enforced at app level)
    plan_id INTEGER REFERENCES subscription.plans(id),
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE NOT NULL,
    next_billing_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing Service Schema
CREATE TABLE IF NOT EXISTS billing.invoices (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL, -- Foreign key to subscription.subscriptions
    customer_id INTEGER NOT NULL,     -- Foreign key to identity.customers
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    due_date DATE NOT NULL,
    invoice_date DATE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Service Schema
CREATE TABLE IF NOT EXISTS payment.transactions (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL,
    razorpay_order_id VARCHAR(255) NOT NULL,
    razorpay_payment_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'created',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform Billing Schema (NexBill's revenue from its users)
CREATE SCHEMA IF NOT EXISTS platform_billing;

CREATE TABLE IF NOT EXISTS platform_billing.nexbill_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    platform_fee_percent DECIMAL(5, 2) DEFAULT 0.00,
    transaction_limit INTEGER,
    features JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_billing.workspace_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES identity.users(id),
    plan_id INTEGER REFERENCES platform_billing.nexbill_plans(id),
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_billing.usage_records (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER REFERENCES identity.users(id),
    total_volume DECIMAL(15, 2) NOT NULL,
    accrued_fees DECIMAL(10, 2) NOT NULL,
    month VARCHAR(7), -- YYYY-MM
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
