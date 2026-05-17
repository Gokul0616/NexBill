const { Router } = require('express');
const adminController = require('../controllers/admin.controller');

const router = Router();

router.get('/merchants', adminController.getMerchants);
router.post('/verify', adminController.verifyMerchant);
router.get('/merchants/:userId/banners', adminController.getMerchantBanners);
router.post('/merchants/:userId/banners', adminController.createMerchantBanner);
router.put('/merchants/:userId/banners/:bannerKey', adminController.updateMerchantBanner);

module.exports = router;
