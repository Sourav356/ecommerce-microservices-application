const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ecommerce',
  password: process.env.DB_PASSWORD || 'Sourav@26',
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', (client) => {
  client.query('SET search_path TO review_schema');
});

// Setup table if not exist
const initDb = async () => {
    try {
        await pool.query(`CREATE SCHEMA IF NOT EXISTS review_schema;`);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS review_schema.reviews (
                id SERIAL PRIMARY KEY,
                product_id INT NOT NULL,
                user_id INT NOT NULL,
                rating INT CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed data
        const { rows } = await pool.query(`SELECT COUNT(*) FROM review_schema.reviews`);
        if (parseInt(rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO review_schema.reviews (product_id, user_id, rating, comment) 
                VALUES 
                (1, 1, 5, 'Incredible sound quality!'), 
                (2, 2, 4, 'Very clicky and responsive.'), 
                (1, 2, 5, 'Best headphones I have ever bought.')
            `);
            console.log('Seeded dummy review data into review_schema');
        }
        console.log('Review DB Schema initialized');
    } catch (err) {
        console.error('DB Initialization error', err);
    }
};
initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
