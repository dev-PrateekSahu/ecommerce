const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sellerOrderRoutes = require('./routes/sellerOrderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerApplicationRoutes = require('./routes/sellerApplicationRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller/orders', sellerOrderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller-applications', sellerApplicationRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running'
    });
});

app.use(errorMiddleware);

module.exports = app;
