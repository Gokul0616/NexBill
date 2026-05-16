const subscriptionService = require('../services/subscription.service');

class SubscriptionController {
    async getAll(req, res, next) {
        try {
            const subscriptions = await subscriptionService.getAllSubscriptions();
            res.json(subscriptions);
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const subscription = await subscriptionService.getSubscriptionById(req.params.id);
            if (!subscription) {
                return res.status(404).json({ error: 'Subscription not found' });
            }
            res.json(subscription);
        } catch (err) {
            next(err);
        }
    }

    async create(req, res, next) {
        try {
            if (!req.body.customer_id || !req.body.plan_id) {
                return res.status(400).json({ error: 'customer_id and plan_id are required' });
            }
            const subscription = await subscriptionService.createSubscription(req.body);
            res.status(201).json(subscription);
        } catch (err) {
            next(err);
        }
    }

    async cancel(req, res, next) {
        try {
            const subscription = await subscriptionService.cancelSubscription(req.params.id);
            if (!subscription) {
                return res.status(404).json({ error: 'Subscription not found' });
            }
            res.json(subscription);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new SubscriptionController();
