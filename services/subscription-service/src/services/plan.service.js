const db = require('@nexbill/db');

class PlanService {
    async getAllPlans() {
        const { rows } = await db.query('SELECT * FROM subscription.plans ORDER BY price ASC');
        return rows;
    }
    async createPlan(data) {
        const { name, price, billing_cycle, features } = data;
        const { rows } = await db.query(
            'INSERT INTO subscription.plans (name, price, billing_cycle, features) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, price, billing_cycle, features]
        );
        return rows[0];
    }
}

module.exports = new PlanService();
