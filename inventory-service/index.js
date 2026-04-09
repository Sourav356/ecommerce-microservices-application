require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4005;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Inventory Service is healthy' });
});

app.listen(PORT, () => {
    console.log(`Inventory Service running on port ${PORT}`);
});
