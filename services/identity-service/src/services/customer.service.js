const db = require('@nexbill/db');

class CustomerService {
    async getAllCustomers() {
        const { rows } = await db.query('SELECT * FROM identity.customers ORDER BY created_at DESC');
        return rows.map(row => {
            if (row.metadata) {
                try {
                    const parsed = JSON.parse(row.metadata);
                    return { ...row, ...parsed };
                } catch (e) {
                    console.error('Failed to parse customer metadata:', e);
                }
            }
            return row;
        });
    }

    async getCustomerById(id) {
        const { rows } = await db.query('SELECT * FROM identity.customers WHERE id = $1', [id]);
        if (rows.length === 0) return null;
        
        const row = rows[0];
        if (row.metadata) {
            try {
                const parsed = JSON.parse(row.metadata);
                return { ...row, ...parsed };
            } catch (e) {
                console.error('Failed to parse customer metadata:', e);
            }
        }
        return row;
    }

    async createCustomer(data) {
        const { name, email, phone, gst_number, ...metadata } = data;
        
        // --- Core validation ---
        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Please enter a valid email address');
        }
        
        // --- Dynamic metadata validation ---
        for (const [key, value] of Object.entries(metadata)) {
            if (value !== undefined && value !== null && value.toString().trim() !== '') {
                const normalizedKey = key.toLowerCase();
                const strValue = value.toString().trim();
                
                // 1. Email check
                if (normalizedKey.includes('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
                    throw new Error(`Invalid email address format for "${key}"`);
                }
                
                // 2. Website URL check
                if ((normalizedKey.includes('website') || normalizedKey.includes('url') || normalizedKey.includes('site')) && 
                    !/^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/.test(strValue)) {
                    throw new Error(`Invalid website URL format for "${key}" (e.g. www.example.com)`);
                }
                
                // 3. Number check
                if ((normalizedKey.includes('number') || normalizedKey.includes('count') || normalizedKey.includes('qty')) && isNaN(Number(strValue))) {
                    throw new Error(`"${key}" must be a valid number`);
                }
            }
        }

        const metadataStr = JSON.stringify(metadata);
        
        // Ensure metadata column exists before inserting (transparent migration)
        try {
            await db.query('ALTER TABLE identity.customers ADD COLUMN IF NOT EXISTS metadata TEXT');
        } catch (err) {
            // Ignore error if table alteration fails or is unsupported (like in Mongo mode)
        }

        const { rows } = await db.query(
            'INSERT INTO identity.customers (name, email, phone, gst_number, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, phone || null, gst_number || null, metadataStr]
        );
        
        const createdRow = rows[0];
        if (createdRow && createdRow.metadata) {
            try {
                const parsed = JSON.parse(createdRow.metadata);
                return { ...createdRow, ...parsed };
            } catch (e) {}
        }
        return createdRow;
    }
}

module.exports = new CustomerService();
