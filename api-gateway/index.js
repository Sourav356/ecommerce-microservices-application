require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(morgan('dev'));
// 🔥 Removed app.use(express.json()); because body parsers consume the stream before it reaches the proxy, which breaks POST requests!

// Health
app.get('/health', (req, res) => {
    res.json({ status: 'API Gateway is healthy' });
});

// Services
const USER = process.env.USER_SERVICE_URL || 'http://user-service:4001';
const PRODUCT = process.env.PRODUCT_SERVICE_URL || 'http://product-service:4003';
const CART = process.env.CART_SERVICE_URL || 'http://cart-service:4004';
const INVENTORY = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:4005';
const ORDER = process.env.ORDER_SERVICE_URL || 'http://order-service:4006';
const PAYMENT = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:4007';
const NOTIFICATION = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4008';
const REVIEW = process.env.REVIEW_SERVICE_URL || 'http://review-service:4002';

const getProxy = (target) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: (path, req) => req.originalUrl // preserve the original URL including /api
    });
};

// Route mapping
app.use('/api/users', getProxy(USER));
app.use('/api/auth', getProxy(USER)); // optional if any old code uses /auth
app.use('/api/products', getProxy(PRODUCT));
app.use('/api/cart', getProxy(CART));
app.use('/api/inventory', getProxy(INVENTORY));
app.use('/api/orders', getProxy(ORDER));
app.use('/api/payments', getProxy(PAYMENT));
app.use('/api/notifications', getProxy(NOTIFICATION));
app.use('/api/reviews', getProxy(REVIEW));

// Start
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
});