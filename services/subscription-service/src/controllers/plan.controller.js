const planService = require('../services/plan.service');

class PlanController {
    async getAllPlans(req, res, next) {
        try {
            const plans = await planService.getAllPlans();
            res.json(plans);
        } catch (err) {
            next(err);
        }
    }

    async createPlan(req, res, next) {
        try {
            const { name, price, billing_cycle } = req.body;
            if (!name || !price || !billing_cycle) {
                return res.status(400).json({ error: 'Name, price and billing_cycle are required' });
            }
            const plan = await planService.createPlan(req.body);
            res.status(201).json(plan);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new PlanController();
