const db = require('@nexbill/db');

class CustomerService {
    async getAllCustomers() {
        const { rows } = await db.query('SELECT * FROM identity.customers ORDER BY created_at DESC');
        return rows;
    }

    async getCustomerById(id) {
        const { rows } = await db.query('SELECT * FROM identity.customers WHERE id = $1', [id]);
        return rows.length ? rows[0] : null;
    }

    async createCustomer(data) {
        const { name, email, phone, gst_number } = data;
        const { rows } = await db.query(
            'INSERT INTO identity.customers (name, email, phone, gst_number) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, phone, gst_number]
        );
        return rows[0];
    }
}

module.exports = new CustomerService();
