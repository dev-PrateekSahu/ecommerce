const test = require('node:test');
const assert = require('node:assert/strict');

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
let userToken;
let product;

test.before(async () => {
    await connectTestDatabase();
    ({ server, baseUrl } = await startTestServer());
});

test.beforeEach(async () => {
    await clearTestDatabase();

    const seller = await createUser({
        name: 'Seller',
        email: 'seller@example.com',
        role: 'seller'
    });

    await createUser({
        name: 'User',
        email: 'user@example.com'
    });

    userToken = await login(baseUrl, 'user@example.com');

    product = await Product.create({
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 500,
        stock: 20,
        seller: seller._id
    });
});

test.after(async () => {
    await stopTestServer(server);
    await disconnectTestDatabase();
});

test('adds a product to cart', async () => {
    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/cart',
        {
            productId: product._id.toString(),
            quantity: 2
        },
        userToken
    );

    assert.equal(response.status, 200);
    assert.equal(response.data.success, true);
});

test('rejects invalid product ID', async () => {
    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/cart',
        {
            productId: 'hello',
            quantity: 2
        },
        userToken
    );

    assert.equal(response.status, 400);
});

test('rejects zero quantity when adding to cart', async () => {
    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/cart',
        {
            productId: product._id.toString(),
            quantity: 0
        },
        userToken
    );

    assert.equal(response.status, 400);
});

test('rejects quantity above stock', async () => {
    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/cart',
        {
            productId: product._id.toString(),
            quantity: 21
        },
        userToken
    );

    assert.equal(response.status, 400);
});
