const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ecommerce',
  password: process.env.DB_PASSWORD || 'Sourav@26',
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', (client) => {
  client.query('SET search_path TO inventory_schema');
});

// Setup table if not exist
const initDb = async () => {
    try {
        await pool.query(`CREATE SCHEMA IF NOT EXISTS inventory_schema;`);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inventory_schema.stock (
                product_id INT PRIMARY KEY,
                quantity INT NOT NULL DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Seed data
        const { rows } = await pool.query(`SELECT COUNT(*) FROM inventory_schema.stock`);
        if (parseInt(rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO inventory_schema.stock (product_id, quantity) 
                VALUES (1, 50), (2, 100), (3, 20)
            `);
            console.log('Seeded dummy inventory data into inventory_schema');
        }
        console.log('Inventory DB Schema initialized');
    } catch (err) {
        console.error('DB Initialization error', err);
    }
};
initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
