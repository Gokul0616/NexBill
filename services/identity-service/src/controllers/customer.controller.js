const customerService = require('../services/customer.service');

class CustomerController {
    async getAll(req, res, next) {
        try {
            const customers = await customerService.getAllCustomers();
            res.json(customers);
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const customer = await customerService.getCustomerById(req.params.id);
            if (!customer) {
                return res.status(404).json({ error: 'Not found' });
            }
            res.json(customer);
        } catch (err) {
            next(err);
        }
    }

    async create(req, res, next) {
        try {
            const customer = await customerService.createCustomer(req.body);
            res.status(201).json(customer);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CustomerController();
