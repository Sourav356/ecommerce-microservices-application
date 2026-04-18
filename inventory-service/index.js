require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4005;

app.use(cors());
app.use(express.json());

const db = require('./db');

app.get('/health', (req, res) => {
    res.json({ status: 'Inventory Service is healthy' });
});

// Get all stock (for UI storefront)
app.get('/api/inventory', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT product_id, quantity FROM inventory_schema.stock');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get stock for a product
app.get('/api/inventory/:productId', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT quantity FROM inventory_schema.stock WHERE product_id = $1', [req.params.productId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Product not found in inventory' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Set or Add stock (called by Admin Panel)
app.post('/api/inventory/stock', async (req, res) => {
    const { product_id, quantity } = req.body;
    try {
        // Upsert logic for PostgreSQL
        const { rows } = await db.query(`
            INSERT INTO inventory_schema.stock (product_id, quantity) 
            VALUES ($1, $2)
            ON CONFLICT (product_id) 
            DO UPDATE SET quantity = inventory_schema.stock.quantity + EXCLUDED.quantity, last_updated = CURRENT_TIMESTAMP
            RETURNING *
        `, [product_id, quantity]);
        res.json({ message: 'Stock added successfully', stock: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reduce stock (called by Order Service during checkout)
app.post('/api/inventory/reduce', async (req, res) => {
    const { product_id, quantity } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE inventory_schema.stock SET quantity = quantity - $1 WHERE product_id = $2 AND quantity >= $1 RETURNING *',
            [quantity, product_id]
        );
        if (rows.length === 0) return res.status(400).json({ error: 'Insufficient stock or product missing' });
        res.json({ message: 'Stock updated', stock: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Inventory Service running on port ${PORT}`);
});
