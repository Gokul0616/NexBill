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
}

module.exports = new AuthController();
