const { Pool } = require('pg');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

class Database {
    constructor() {
        this.mode = null;
        this.pool = null;
        this.mongoClient = null;
        this.db = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        // Try PostgreSQL first
        try {
            console.log('Connecting to PostgreSQL...');
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/billing',
                connectionTimeoutMillis: 5000,
            });
            // Test connection
            await this.pool.query('SELECT 1');
            console.log('Successfully connected to PostgreSQL');
            this.mode = 'postgres';
        } catch (err) {
            console.warn('PostgreSQL connection failed, switching to MongoDB:', err.message);
            try {
                const mongoUrl = process.env.MONGODB_URL;
                if (!mongoUrl) throw new Error('MONGODB_URL not found in environment');
                
                console.log('Connecting to MongoDB...');
                this.mongoClient = new MongoClient(mongoUrl);
                await this.mongoClient.connect();
                this.db = this.mongoClient.db('nexbill');
                console.log('Successfully connected to MongoDB (database: nexbill)');
                this.mode = 'mongo';
            } catch (mongoErr) {
                console.error('Failed to connect to both PostgreSQL and MongoDB');
                // Don't throw here, just leave mode as null and handle in query
            }
        }
        this.initialized = true;
    }

    async query(text, params = []) {
        if (!this.initialized) await this.init();

        if (this.mode === 'postgres') {
            return await this.pool.query(text, params);
        } else if (this.mode === 'mongo') {
            const rows = await this.translateAndExecute(text, params);
            return { rows, rowCount: rows.length };
        } else {
            throw new Error('Database not connected');
        }
    }

    async translateAndExecute(text, params) {
        // Clean up the query string
        text = text.trim().replace(/\s+/g, ' ');
        
        // Identify the collection
        const tableMatch = text.match(/FROM\s+([\w.]+)/i) || 
                          text.match(/INSERT\s+INTO\s+([\w.]+)/i) || 
                          text.match(/UPDATE\s+([\w.]+)/i);
        
        if (!tableMatch) throw new Error('Could not identify table in SQL query');
        
        const fullTableName = tableMatch[1];
        const tableName = fullTableName.split('.').pop(); // 'identity.customers' -> 'customers'
        const collection = this.db.collection(tableName);

        // Handle JOINS (specifically for subscription service)
        if (text.includes('JOIN')) {
            if (tableName === 'subscriptions' && text.includes('plans')) {
                const subs = await collection.find({}).sort({ created_at: -1 }).toArray();
                const plans = await this.db.collection('plans').find({}).toArray();
                const planMap = Object.fromEntries(plans.map(p => [p.id, p]));
                
                return subs.map(s => ({
                    ...s,
                    plan_name: planMap[s.plan_id]?.name || 'Unknown',
                    price: planMap[s.plan_id]?.price || 0
                }));
            }
            if (tableName === 'users' && text.includes('merchant_activations')) {
                let filter = {};
                const whereMatch = text.match(/WHERE\s+(.+?)(?:\s+ORDER|$)/i);
                if (whereMatch) {
                    const whereParts = whereMatch[1].split(' AND ');
                    whereParts.forEach(part => {
                        const eqMatch = part.match(/([\w.]+)\s*=\s*\$(\d+)/);
                        if (eqMatch) {
                            const field = eqMatch[1].split('.').pop();
                            let val = params[parseInt(eqMatch[2]) - 1];
                            if ((field === 'id' || field.endsWith('_id')) && !isNaN(val) && val !== null) {
                                val = Number(val);
                            }
                            filter[field] = val;
                        }
                    });
                }

                const users = await collection.find(filter).toArray();
                const activations = await this.db.collection('merchant_activations').find({}).toArray();
                const actMap = Object.fromEntries(activations.map(a => [a.user_id, a]));
                
                return users.map(u => {
                    const act = actMap[u.id];
                    let actData = {};
                    if (act) {
                        const { id: actId, user_id: actUserId, ...rest } = act;
                        actData = rest;
                    } else {
                        actData = {
                            verification_status: 'pending',
                            charges_enabled: false,
                            payouts_enabled: false,
                            currently_due: [],
                            verification_comments: ''
                        };
                    }
                    return {
                        ...u,
                        ...actData
                    };
                });
            }
        }

        // Handle SELECT
        if (text.toUpperCase().startsWith('SELECT')) {
            let filter = {};
            
            // Extract WHERE clause
            const whereMatch = text.match(/WHERE\s+(.+?)(?:\s+ORDER|$)/i);
            if (whereMatch) {
                const whereParts = whereMatch[1].split(/\s+AND\s+/i);
                whereParts.forEach(part => {
                    const eqMatch = part.match(/(\w+)\s*=\s*\$(\d+)/);
                    const neMatch = part.match(/(\w+)\s*!=\s*\$(\d+)/) || part.match(/(\w+)\s*<>\s*\$(\d+)/);
                    if (eqMatch) {
                        const field = eqMatch[1];
                        let val = params[parseInt(eqMatch[2]) - 1];
                        // Auto-cast numeric IDs if possible
                        if ((field === 'id' || field.endsWith('_id')) && !isNaN(val) && val !== null) {
                            val = Number(val);
                        }
                        filter[field] = val;
                    } else if (neMatch) {
                        const field = neMatch[1];
                        let val = params[parseInt(neMatch[2]) - 1];
                        if ((field === 'id' || field.endsWith('_id')) && !isNaN(val) && val !== null) {
                            val = Number(val);
                        }
                        filter[field] = { $ne: val };
                    }
                });
            }

            let sort = {};
            const orderMatch = text.match(/ORDER\s+BY\s+([\w.]+)\s+(ASC|DESC)/i);
            if (orderMatch) {
                const field = orderMatch[1].split('.').pop();
                sort[field] = orderMatch[2].toUpperCase() === 'DESC' ? -1 : 1;
            }

            return await collection.find(filter).sort(sort).toArray();
        }

        // Handle INSERT
        if (text.toUpperCase().startsWith('INSERT')) {
            const fieldsMatch = text.match(/\((.+?)\)/);
            const valuesMatch = text.match(/VALUES\s+([\s\S]+?)(?:RETURNING|$)/i);
            
            if (!fieldsMatch || !valuesMatch) throw new Error('Could not parse INSERT query');
            
            const fields = fieldsMatch[1].split(',').map(f => f.trim());
            const valuesStr = valuesMatch[1].trim();
            
            // Split multiple values: (v1, v2), (v3, v4)
            // This is a bit naive but works for the seed script
            const valueBlocks = valuesStr.split(/\)\s*,\s*\(/).map(v => v.replace(/^\(/, '').replace(/\)$/, ''));
            
            const docs = [];
            for (const block of valueBlocks) {
                const doc = {};
                // Simple split by comma, but need to be careful with strings containing commas
                // For this project, we don't have commas in strings in the seed script
                const vals = block.split(',').map(v => v.trim());
                
                fields.forEach((f, i) => {
                    let val = vals[i];
                    if (val === 'NULL' || val === 'null') {
                        val = null;
                    } else if (val.startsWith('$')) {
                        val = params[parseInt(val.substring(1)) - 1];
                    } else if (val.startsWith("'") && val.endsWith("'")) {
                        val = val.substring(1, val.length - 1);
                    } else if (!isNaN(val)) {
                        val = Number(val);
                    }
                    doc[f] = val;
                });
                
                const { randomUUID } = require('crypto');
                doc.id = randomUUID();
                doc.created_at = new Date();
                docs.push(doc);
            }
            
            if (docs.length === 1) {
                await collection.insertOne(docs[0]);
            } else {
                await collection.insertMany(docs);
            }
            return docs;
        }

        // Handle UPDATE
        if (text.toUpperCase().startsWith('UPDATE')) {
            const setMatch = text.match(/SET\s+(.+?)\s+WHERE/i);
            const whereMatch = text.match(/WHERE\s+(.+)$/i);
            
            if (!setMatch || !whereMatch) throw new Error('Could not parse UPDATE query');

            const updateFields = {};
            setMatch[1].split(',').forEach(s => {
                const [k, v] = s.split('=').map(x => x.trim());
                if (v.startsWith('$')) {
                    updateFields[k] = params[parseInt(v.substring(1)) - 1];
                } else {
                    updateFields[k] = v.replace(/'/g, '');
                }
            });

            let filter = {};
            const whereParts = whereMatch[1].split(/\s+AND\s+/i);
            whereParts.forEach(part => {
                const eqMatch = part.match(/(\w+)\s*=\s*\$(\d+)/);
                const neMatch = part.match(/(\w+)\s*!=\s*\$(\d+)/) || part.match(/(\w+)\s*<>\s*\$(\d+)/);
                if (eqMatch) {
                    const field = eqMatch[1];
                    let val = params[parseInt(eqMatch[2]) - 1];
                    if ((field === 'id' || field.endsWith('_id')) && !isNaN(val) && val !== null) {
                        val = Number(val);
                    }
                    filter[field] = val;
                } else if (neMatch) {
                    const field = neMatch[1];
                    let val = params[parseInt(neMatch[2]) - 1];
                    if ((field === 'id' || field.endsWith('_id')) && !isNaN(val) && val !== null) {
                        val = Number(val);
                    }
                    filter[field] = { $ne: val };
                }
            });

            await collection.updateOne(filter, { $set: updateFields });
            return await collection.find(filter).toArray();
        }

        throw new Error('Unsupported SQL query for MongoDB fallback');
    }
}

module.exports = new Database();
