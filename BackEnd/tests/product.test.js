const test = require('node:test');
const assert = require('node:assert/strict');

const User = require('../src/models/User');
const Product = require('../src/models/Product');

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
let seller;
let sellerToken;
let userToken;

test.before(async () => {
    await connectTestDatabase();
    ({ server, baseUrl } = await startTestServer());
});

test.beforeEach(async () => {
    await clearTestDatabase();

    seller = await createUser({
        name: 'Seller',
        email: 'seller@example.com',
        role: 'seller'
    });

    await createUser({
        name: 'User',
        email: 'user@example.com'
    });

    sellerToken = await login(baseUrl, 'seller@example.com');
    userToken = await login(baseUrl, 'user@example.com');
});

test.after(async () => {
    await stopTestServer(server);
    await disconnectTestDatabase();
});

test('seller can create a product', async () => {
    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/products',
        {
            name: 'Keyboard',
            description: 'Mechanical keyboard',
            price: 500,
            stock: 20
        },
        sellerToken
    );

    assert.equal(response.status, 201);
    assert.equal(response.data.success, true);
    assert.equal(response.data.product.seller, seller._id.toString());
});

test('rejects invalid product data', async () => {
    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/products',
        {
            name: 'A',
            description: 'Short',
            price: -10,
            stock: -5
        },
        sellerToken
    );

    assert.equal(response.status, 400);
});

test('seller can partially update a product', async () => {
    const product = await Product.create({
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 500,
        stock: 20,
        seller: seller._id
    });

    const response = await apiRequest(
        baseUrl,
        'PATCH',
        `/api/products/${product._id}`,
        { price: 700 },
        sellerToken
    );

    assert.equal(response.status, 200);
    assert.equal(response.data.product.price, 700);
    assert.equal(response.data.product.name, 'Keyboard');
    assert.equal(response.data.product.stock, 20);
});

test('rejects an empty product patch', async () => {
    const product = await Product.create({
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 500,
        stock: 20,
        seller: seller._id
    });

    const response = await apiRequest(
        baseUrl,
        'PATCH',
        `/api/products/${product._id}`,
        {},
        sellerToken
    );

    assert.equal(response.status, 400);
});

test('normal user cannot update seller product', async () => {
    const product = await Product.create({
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 500,
        stock: 20,
        seller: seller._id
    });

    const response = await apiRequest(
        baseUrl,
        'PATCH',
        `/api/products/${product._id}`,
        { price: 700 },
        userToken
    );

    assert.equal(response.status, 403);
});
