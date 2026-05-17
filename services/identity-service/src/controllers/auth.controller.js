const authService = require('../services/auth.service');

class AuthController {
    async register(req, res, next) {
        try {
            const result = await authService.registerUser(req.body);
            res.status(201).json(result);
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ error: err.message });
            } else {
                next(err);
            }
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.loginUser(email, password);
            res.json(result);
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ error: err.message });
            } else {
                next(err);
            }
        }
    }

    async updateOnboarding(req, res, next) {
        try {
            const result = await authService.updateOnboarding(req.user.userId, req.body);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async getVerificationStatus(req, res, next) {
        try {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const result = await authService.getVerificationStatus(req.user.userId);
            if (!result) {
                return res.status(401).json({ error: 'Unauthorized: User record not found' });
            }
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async dismissBanner(req, res, next) {
        try {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { bannerKey } = req.body;
            if (!bannerKey) {
                return res.status(400).json({ error: 'Missing bannerKey' });
            }
            const result = await authService.dismissBanner(req.user.userId, bannerKey);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
