require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
    res.json({ status: 'API Gateway is healthy' });
});

// Proxy routes mapped to downstream microservices
// Note: changeOrigin handles host header rewrite for virtual hosted sites
const getProxy = (target) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: (path, req) => req.originalUrl
    });
};

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4003';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:4004';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:4005';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:4006';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:4007';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4008';
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://localhost:4009';

app.use('/api/users', getProxy(USER_SERVICE_URL));
app.use('/api/products', getProxy(PRODUCT_SERVICE_URL));
app.use('/api/cart', getProxy(CART_SERVICE_URL));
app.use('/api/inventory', getProxy(INVENTORY_SERVICE_URL));
app.use('/api/orders', getProxy(ORDER_SERVICE_URL));
app.use('/api/payments', getProxy(PAYMENT_SERVICE_URL));
app.use('/api/notifications', getProxy(NOTIFICATION_SERVICE_URL));
app.use('/api/reviews', getProxy(REVIEW_SERVICE_URL));

app.listen(PORT, () => {
    console.log(`API Gateway proxy running centrally on port ${PORT}`);
});
