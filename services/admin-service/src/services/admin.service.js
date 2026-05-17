const db = require('@nexbill/db');

class AdminService {
    async getAllMerchants() {
        const { rows } = await db.query(
            'SELECT u.*, a.verification_status, a.charges_enabled, a.payouts_enabled, a.currently_due, a.verification_comments, ' +
            'a.legal_name, a.website_url, a.tax_id, a.bank_account_last4, a.industry, a.support_phone, a.support_email, ' +
            'a.ssn_last_4, a.business_address_line1, a.business_address_line2, a.business_address_city, a.business_address_state, a.business_address_postal, ' +
            'a.rep_address_line1, a.rep_address_city, a.rep_address_state, a.rep_address_postal, a.business_entity_type, a.doing_business_as, ' +
            'a.product_description, a.statement_descriptor, a.business_pan, a.gstin, a.reg_number, a.iec, a.tc_url, a.refund_url, ' +
            'a.rep_title, a.rep_pan, a.rep_aadhaar, a.rep_is_director, a.rep_is_owner, a.rep_is_executive, a.rep_ownership, ' +
            'a.account_name, a.account_type, a.ifsc, a.beneficial_owners, a.rep_name, a.rep_dob, a.accept_international, a.pan_doc_url, a.business_proof_url ' +
            'FROM identity.users u LEFT JOIN identity.merchant_activations a ON u.id = a.user_id ' +
            'ORDER BY u.id DESC'
        );
        return rows.filter(user => user.email !== 'admin@nexbill.com');
    }

    async verifyMerchant(userId, verificationStatus, chargesEnabled, payoutsEnabled, currentlyDue, comments, isBlocked = false, paymentsBlocked = false, customBannerMessage = null) {
        const currentlyDueStr = Array.isArray(currentlyDue) ? JSON.stringify(currentlyDue) : '[]';
        
        // 1. Ensure activation record exists
        const { rows: actRows } = await db.query('SELECT id FROM identity.merchant_activations WHERE user_id = $1', [Number(userId)]);
        if (actRows.length === 0) {
            await db.query('INSERT INTO identity.merchant_activations (user_id) VALUES ($1)', [Number(userId)]);
        }

        // 2. Update user flags & custom banners
        await db.query(
            'UPDATE identity.users SET is_blocked = $1, payments_blocked = $2, custom_banner_message = $3 WHERE id = $4',
            [
                isBlocked === true || isBlocked === 'true' ? 'true' : 'false',
                paymentsBlocked === true || paymentsBlocked === 'true' ? 'true' : 'false',
                customBannerMessage || null,
                Number(userId)
            ]
        );

        // 3. Update KYC verification details
        await db.query(
            'UPDATE identity.merchant_activations SET verification_status = $1, charges_enabled = $2, payouts_enabled = $3, currently_due = $4, verification_comments = $5 WHERE user_id = $6',
            [
                verificationStatus, 
                chargesEnabled === true || chargesEnabled === 'true' ? 'true' : 'false', 
                payoutsEnabled === true || payoutsEnabled === 'true' ? 'true' : 'false', 
                currentlyDueStr, 
                comments || '', 
                Number(userId)
            ]
        );
        return { success: true };
    }

    async getMerchantBanners(userId) {
        const { rows: existingRows } = await db.query(
            'SELECT banner_key FROM identity.merchant_banners WHERE user_id = $1',
            [Number(userId)]
        );
        if (existingRows.length === 0) {
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
                    'INSERT INTO identity.merchant_banners (user_id, banner_key, message, type, cta_label, cta_link) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
                    [Number(userId), b.key, b.message, b.type, b.cta_label, b.cta_link]
                );
            }
        }

        const { rows } = await db.query(
            'SELECT banner_key, message, type, cta_label, cta_link, is_dismissed, is_enabled FROM identity.merchant_banners WHERE user_id = $1 ORDER BY id ASC',
            [Number(userId)]
        );
        return rows;
    }

    async updateMerchantBanner(userId, bannerKey, { message, type, cta_label, cta_link, is_enabled, is_dismissed }) {
        await db.query(
            'UPDATE identity.merchant_banners SET message = $1, type = $2, cta_label = $3, cta_link = $4, is_enabled = $5, is_dismissed = $6, updated_at = CURRENT_TIMESTAMP WHERE user_id = $7 AND banner_key = $8',
            [message, type, cta_label, cta_link, is_enabled === true || is_enabled === 'true', is_dismissed === true || is_dismissed === 'true', Number(userId), bannerKey]
        );
        return { success: true };
    }

    async createMerchantBanner(userId, { bannerKey, message, type, cta_label, cta_link, is_enabled, is_dismissed }) {
        await db.query(
            'INSERT INTO identity.merchant_banners (user_id, banner_key, message, type, cta_label, cta_link, is_enabled, is_dismissed) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ' +
            'ON CONFLICT (user_id, banner_key) ' +
            'DO UPDATE SET message = EXCLUDED.message, type = EXCLUDED.type, cta_label = EXCLUDED.cta_label, cta_link = EXCLUDED.cta_link, is_enabled = EXCLUDED.is_enabled, is_dismissed = EXCLUDED.is_dismissed, updated_at = CURRENT_TIMESTAMP',
            [
                Number(userId), 
                bannerKey, 
                message, 
                type || 'info', 
                cta_label || null, 
                cta_link || null, 
                is_enabled !== false, 
                is_dismissed === true
            ]
        );
        return { success: true };
    }
}

module.exports = new AdminService();
