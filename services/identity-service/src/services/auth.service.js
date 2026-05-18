const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('@nexbill/db');
const safeId = (val) => isNaN(Number(val)) ? val : Number(val);
const config = require('../config');

class AuthService {
    async registerUser(data) {
        const { email, password, name, company, business_type, country, phone } = data;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try {
            const { rows } = await db.query(
                'INSERT INTO identity.users (email, password_hash, name, company, business_type, country, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, role, name',
                [email, hashedPassword, name, company, business_type, country, phone]
            );
            
            const user = rows[0];
            const token = this.generateToken(user);
            return { user, token };
        } catch (err) {
            if (err.code === '23505' && err.constraint === 'users_email_key') {
                const error = new Error('Email is already registered. Please sign in instead.');
                error.status = 400;
                throw error;
            }
            throw err;
        }
    }

    async loginUser(email, password) {
        const { rows } = await db.query('SELECT * FROM identity.users WHERE email = $1', [email]);
        if (rows.length === 0) {
            const error = new Error('User not found');
            error.status = 401;
            throw error;
        }

        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            const error = new Error('Invalid password');
            error.status = 401;
            throw error;
        }

        const token = this.generateToken(user);
        return { token, role: user.role };
    }

    generateToken(user) {
        return jwt.sign(
            {
                userId: user.id,
                role: user.role,
                name: user.name,
                email: user.email
            },
            config.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    async updateOnboarding(userId, data) {
        const { 
            legal_name, website_url, tax_id, bank_account, industry, support_phone, support_email, ssn_last_4,
            business_address_line1, business_address_line2, business_address_city, business_address_state, business_address_postal,
            rep_address_line1, rep_address_city, rep_address_state, rep_address_postal,
            business_entity_type, doing_business_as, product_description, statement_descriptor,
            business_pan, gstin, reg_number, iec, tc_url, refund_url,
            rep_title, rep_pan, rep_aadhaar, rep_is_director, rep_is_owner, rep_is_executive, rep_ownership,
            account_name, account_type, ifsc, beneficial_owners,
            full_name, dob, accept_international,
            pan_doc_url, business_proof_url
        } = data;
        
        const activeBankAccount = bank_account || data.account_number;
        const last4 = activeBankAccount ? activeBankAccount.slice(-4) : null;
        
        // 1. Ensure activation record exists
        const { rows: actRows } = await db.query('SELECT id FROM identity.merchant_activations WHERE user_id = $1', [safeId(userId)]);
        if (actRows.length === 0) {
            await db.query('INSERT INTO identity.merchant_activations (user_id) VALUES ($1)', [safeId(userId)]);
        }

        // 2. Update the separate merchant_activations table
        await db.query(
            `UPDATE identity.merchant_activations 
             SET legal_name = $1, website_url = $2, tax_id = $3, bank_account_last4 = $4, 
                 industry = $5, support_phone = $6, support_email = $7, ssn_last_4 = $8,
                 business_address_line1 = $9, business_address_line2 = $10, business_address_city = $11, business_address_state = $12, business_address_postal = $13,
                 rep_address_line1 = $14, rep_address_city = $15, rep_address_state = $16, rep_address_postal = $17,
                 business_entity_type = $18, doing_business_as = $19, product_description = $20, statement_descriptor = $21,
                 business_pan = $22, gstin = $23, reg_number = $24, iec = $25, tc_url = $26, refund_url = $27,
                 rep_title = $28, rep_pan = $29, rep_aadhaar = $30, rep_is_director = $31, rep_is_owner = $32, rep_is_executive = $33, rep_ownership = $34,
                 account_name = $35, account_type = $36, ifsc = $37, beneficial_owners = $38,
                 rep_name = $39, rep_dob = $40, accept_international = $41,
                 pan_doc_url = $42, business_proof_url = $43,
                 verification_status = 'under_review'
             WHERE user_id = $44`,
            [
                legal_name, website_url, tax_id, last4, 
                industry, support_phone, support_email, ssn_last_4,
                business_address_line1, business_address_line2, business_address_city, business_address_state, business_address_postal,
                rep_address_line1, rep_address_city, rep_address_state, rep_address_postal,
                business_entity_type, doing_business_as, product_description, statement_descriptor,
                business_pan, gstin, reg_number, iec, tc_url, refund_url,
                rep_title, rep_pan, rep_aadhaar, rep_is_director, rep_is_owner, rep_is_executive, rep_ownership,
                account_name, account_type, ifsc, JSON.stringify(beneficial_owners),
                full_name, dob, accept_international === true || accept_international === 'true' ? 'true' : 'false',
                pan_doc_url, business_proof_url,
                safeId(userId)
            ]
        );
        
        // 3. Return the merged user and activation payload
        const { rows: mergedRows } = await db.query(
            'SELECT u.*, a.verification_status, a.charges_enabled, a.payouts_enabled, a.currently_due, a.verification_comments, ' +
            'a.legal_name, a.website_url, a.tax_id, a.bank_account_last4, a.industry, a.support_phone, a.support_email, ' +
            'a.ssn_last_4, a.business_address_line1, a.business_address_line2, a.business_address_city, a.business_address_state, a.business_address_postal, ' +
            'a.rep_address_line1, a.rep_address_city, a.rep_address_state, a.rep_address_postal, a.business_entity_type, a.doing_business_as, ' +
            'a.product_description, a.statement_descriptor, a.business_pan, a.gstin, a.reg_number, a.iec, a.tc_url, a.refund_url, ' +
            'a.rep_title, a.rep_pan, a.rep_aadhaar, a.rep_is_director, a.rep_is_owner, a.rep_is_executive, a.rep_ownership, ' +
            'a.account_name, a.account_type, a.ifsc, a.beneficial_owners, a.rep_name, a.rep_dob, a.accept_international, ' +
            'a.pan_doc_url, a.business_proof_url ' +
            'FROM identity.users u LEFT JOIN identity.merchant_activations a ON u.id = a.user_id ' +
            'WHERE u.id = $1',
            [safeId(userId)]
        );
        // Reset dismissed status for review banners when they resubmit
        await db.query(
            "UPDATE identity.merchant_banners SET is_dismissed = false WHERE user_id = $1 AND banner_key IN ('live-verification-review', 'live-verification-action')",
            [safeId(userId)]
        );

        return mergedRows[0];
    }

    async getVerificationStatus(userId) {
        await this.ensureMerchantBanners(userId);

        const { rows } = await db.query(
            'SELECT u.id, u.is_blocked, u.payments_blocked, u.custom_banner_message, ' +
            'a.verification_status, a.charges_enabled, a.payouts_enabled, a.currently_due, a.verification_comments ' +
            'FROM identity.users u LEFT JOIN identity.merchant_activations a ON u.id = a.user_id ' +
            'WHERE u.id = $1',
            [safeId(userId)]
        );

        const status = rows[0] || null;
        if (status) {
            const { rows: bannerRows } = await db.query(
                'SELECT banner_key, message, type, cta_label, cta_link, is_dismissed, is_enabled, updated_at FROM identity.merchant_banners WHERE user_id = $1',
                [safeId(userId)]
            );
            status.banners = bannerRows;
        }
        return status;
    }

    async ensureMerchantBanners(userId) {
        const { rows } = await db.query('SELECT id FROM identity.merchant_banners WHERE user_id = $1', [safeId(userId)]);
        if (rows.length === 0) {
            const defaultBanners = [
                {
                    key: 'account-suspended',
                    message: 'Account Suspended: Your account has been temporarily restricted by NexBill operators. Read-only mode is active; all write operations are disabled.',
                    type: 'critical',
                    cta_label: null,
                    cta_link: null
                },
                {
                    key: 'custom-admin-announcement',
                    message: 'Maintenance Notice: NexBill systems will undergo scheduled upgrades.',
                    type: 'info',
                    cta_label: null,
                    cta_link: null
                },
                {
                    key: 'live-verification-review',
                    message: 'KYC Verification in Progress. We are reviewing your documents. Live features will be enabled upon approval.',
                    type: 'info',
                    cta_label: 'View status',
                    cta_link: '/activate'
                },
                {
                    key: 'live-verification-action',
                    message: 'Action Required: Verification Paused. Please correct your uploaded legal documents.',
                    type: 'critical',
                    cta_label: 'Resolve requirements',
                    cta_link: '/activate'
                },
                {
                    key: 'test-mode',
                    message: 'Your account is currently in test mode. Live payments are disabled.',
                    type: 'warning',
                    cta_label: 'Activate account',
                    cta_link: '/activate'
                },
                {
                    key: 'verified-success',
                    message: 'Congratulations! Your NexBill account is fully activated and verified. You are now live!',
                    type: 'success',
                    cta_label: 'View dashboard',
                    cta_link: '/'
                },
                {
                    key: 'live-activation-required',
                    message: 'Live Mode requires account activation. Complete your setup to accept payments.',
                    type: 'warning',
                    cta_label: 'Complete setup',
                    cta_link: '/activate'
                }
            ];

            for (const b of defaultBanners) {
                await db.query(
                    'INSERT INTO identity.merchant_banners (user_id, banner_key, message, type, cta_label, cta_link, is_enabled, is_dismissed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING',
                    [safeId(userId), b.key, b.message, b.type, b.cta_label, b.cta_link, false, false]
                );
            }
        }
    }

    async dismissBanner(userId, bannerKey) {
        await db.query(
            'UPDATE identity.merchant_banners SET is_dismissed = true, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND banner_key = $2',
            [safeId(userId), bannerKey]
        );
        return { success: true };
    }
}

module.exports = new AuthService();
