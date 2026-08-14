const test = require('node:test');
const assert = require('node:assert/strict');

const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');
const Order = require('../src/models/Order');

const {
    apiRequest,
    clearTestDatabase,
    connectTestDatabase,
    createUser,
    disconnectTestDatabase,
    login,
    startTestServer,
    stopTestServer
} = require('./testUtils');

let server;
let baseUrl;
let user;
let seller;
let userToken;
let sellerToken;
let product;

test.before(async () => {
    await connectTestDatabase();
    ({ server, baseUrl } = await startTestServer());
});

test.beforeEach(async () => {
    await clearTestDatabase();

    seller = await createUser({
        name: 'Seller',
        email: 'seller@example.com',
        role: 'seller',
        isActive: true
    });

    user = await createUser({
        name: 'User',
        email: 'user@example.com'
    });

    sellerToken = await login(baseUrl, 'seller@example.com');
    userToken = await login(baseUrl, 'user@example.com');

    product = await Product.create({
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 500,
        stock: 10,
        seller: seller._id
    });
});

test.after(async () => {
    await stopTestServer(server);
    await disconnectTestDatabase();
});

test('creates an order and decreases stock', async () => {
    await Cart.create({
        user: user._id,
        items: [{
            product: product._id,
            quantity: 2
        }]
    });

    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/orders',
        undefined,
        userToken
    );

    assert.equal(response.status, 200);
    assert.equal(response.data.success, true);

    const updatedProduct = await Product.findById(product._id);
    assert.equal(updatedProduct.stock, 8);

    const order = await Order.findOne({ user: user._id });
    assert.ok(order);
    assert.equal(order.status, 'confirmed');
});

test('does not allow checkout from a disabled seller', async () => {
    await User.findByIdAndUpdate(seller._id, { isActive: false });

    await Cart.create({
        user: user._id,
        items: [{
            product: product._id,
            quantity: 1
        }]
    });

    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/orders',
        undefined,
        userToken
    );

    assert.equal(response.status, 400);
    assert.equal(response.data.success, false);

    assert.equal(await Order.countDocuments(), 0);
});

test('rejects checkout when requested quantity exceeds stock', async () => {
    await Cart.create({
        user: user._id,
        items: [{
            product: product._id,
            quantity: 11
        }]
    });

    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/orders',
        undefined,
        userToken
    );

    assert.equal(response.status, 400);
    assert.equal(await Order.countDocuments(), 0);
});

test('allows confirmed to shipped', async () => {
    const order = await Order.create({
        user: user._id,
        seller: seller._id,
        items: [{
            product: product._id,
            quantity: 1,
            price: 500
        }],
        totalAmount: 500,
        status: 'confirmed'
    });

    const response = await apiRequest(
        baseUrl,
        'PATCH',
        `/api/seller/orders/${order._id}/status`,
        { status: 'shipped' },
        sellerToken
    );

    assert.equal(response.status, 200);

    const updated = await Order.findById(order._id);
    assert.equal(updated.status, 'shipped');
});

test('allows shipped to delivered', async () => {
    const order = await Order.create({
        user: user._id,
        seller: seller._id,
        items: [{
            product: product._id,
            quantity: 1,
            price: 500
        }],
        totalAmount: 500,
        status: 'shipped'
    });

    const response = await apiRequest(
        baseUrl,
        'PATCH',
        `/api/seller/orders/${order._id}/status`,
        { status: 'delivered' },
        sellerToken
    );

    assert.equal(response.status, 200);

    const updated = await Order.findById(order._id);
    assert.equal(updated.status, 'delivered');
});

test('rejects confirmed directly to delivered', async () => {
    const order = await Order.create({
        user: user._id,
        seller: seller._id,
        items: [{
            product: product._id,
            quantity: 1,
            price: 500
        }],
        totalAmount: 500,
        status: 'confirmed'
    });

    const response = await apiRequest(
        baseUrl,
        'PATCH',
        `/api/seller/orders/${order._id}/status`,
        { status: 'delivered' },
        sellerToken
    );

    assert.equal(response.status, 400);
});

test('rejects invalid order status before controller logic', async () => {
    const order = await Order.create({
        user: user._id,
        seller: seller._id,
        items: [{
            product: product._id,
            quantity: 1,
            price: 500
        }],
        totalAmount: 500,
        status: 'confirmed'
    });

    const response = await apiRequest(
        baseUrl,
        'PATCH',
        `/api/seller/orders/${order._id}/status`,
        { status: 'random-status' },
        sellerToken
    );

    assert.equal(response.status, 400);
});
