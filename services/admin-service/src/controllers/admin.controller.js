const adminService = require('../services/admin.service');
const safeId = (val) => isNaN(Number(val)) ? val : Number(val);

class AdminController {
    async getMerchants(req, res, next) {
        try {
            const merchants = await adminService.getAllMerchants();
            res.json({ success: true, merchants });
        } catch (err) {
            next(err);
        }
    }

    async verifyMerchant(req, res, next) {
        const { userId, verificationStatus, chargesEnabled, payoutsEnabled, currentlyDue, comments, isBlocked, paymentsBlocked, customBannerMessage } = req.body;
        
        if (!userId || !verificationStatus) {
            return res.status(400).json({ success: false, error: 'userId and verificationStatus are required' });
        }

        try {
            const result = await adminService.verifyMerchant(
                safeId(userId), 
                verificationStatus, 
                chargesEnabled, 
                payoutsEnabled, 
                currentlyDue, 
                comments,
                isBlocked,
                paymentsBlocked,
                customBannerMessage
            );
            res.json({ success: true, message: 'Merchant verification status updated successfully', ...result });
        } catch (err) {
            next(err);
        }
    }

    async getMerchantBanners(req, res, next) {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId is required' });
        }
        try {
            const banners = await adminService.getMerchantBanners(safeId(userId));
            res.json({ success: true, banners });
        } catch (err) {
            next(err);
        }
    }

    async updateMerchantBanner(req, res, next) {
        const { userId, bannerKey } = req.params;
        if (!userId || !bannerKey) {
            return res.status(400).json({ success: false, error: 'userId and bannerKey are required' });
        }
        try {
            const result = await adminService.updateMerchantBanner(safeId(userId), bannerKey, req.body);
            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    }

    async createMerchantBanner(req, res, next) {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId is required' });
        }
        try {
            const result = await adminService.createMerchantBanner(safeId(userId), req.body);
            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AdminController();
