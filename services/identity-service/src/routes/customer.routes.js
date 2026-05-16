const { Router } = require('express');
const customerController = require('../controllers/customer.controller');

const router = Router();

router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
router.post('/', customerController.create);

module.exports = router;
