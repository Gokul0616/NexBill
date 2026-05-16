const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('@nexbill/db');

class AuthService {
    async registerUser(data) {
        const { email, password, name, company, business_type, country, phone } = data;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try {
            const { rows } = await db.query(
                'INSERT INTO identity.users (email, password_hash, name, company, business_type, country, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, role, name',
                [email, hashedPassword, name, company, business_type, country, phone]
            );
            
            const user = rows[0];
            const token = this.generateToken(user);
            return { user, token };
        } catch (err) {
            if (err.code === '23505' && err.constraint === 'users_email_key') {
                const error = new Error('Email is already registered. Please sign in instead.');
                error.status = 400;
                throw error;
            }
            throw err;
        }
    }

    async loginUser(email, password) {
        const { rows } = await db.query('SELECT * FROM identity.users WHERE email = $1', [email]);
        if (rows.length === 0) {
            const error = new Error('User not found');
            error.status = 401;
            throw error;
        }

        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            const error = new Error('Invalid password');
            error.status = 401;
            throw error;
        }

        const token = this.generateToken(user);
        return { token, role: user.role };
    }

    generateToken(user) {
        return jwt.sign(
            {
                userId: user.id,
                role: user.role,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }
}

module.exports = new AuthService();
