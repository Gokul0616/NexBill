const { Router } = require('express');
const planController = require('../controllers/plan.controller');

const router = Router();

router.get('/', planController.getAllPlans);
router.post('/', planController.createPlan);

module.exports = router;
