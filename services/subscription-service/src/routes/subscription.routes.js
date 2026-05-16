const { Router } = require('express');
const subscriptionController = require('../controllers/subscription.controller');

const router = Router();

router.get('/', subscriptionController.getAll);
router.get('/:id', subscriptionController.getById);
router.post('/', subscriptionController.create);
router.delete('/:id', subscriptionController.cancel);

module.exports = router;
