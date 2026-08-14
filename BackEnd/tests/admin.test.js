const test = require('node:test');
const assert = require('node:assert/strict');

const User = require('../src/models/User');
const SellerApplication = require('../src/models/sellerApplication');

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
let admin;
let normalUser;
let seller;
let adminToken;
let userToken;

test.before(async () => {
    await connectTestDatabase();
    ({ server, baseUrl } = await startTestServer());
});

test.beforeEach(async () => {
    await clearTestDatabase();

    admin = await createUser({
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin'
    });

    normalUser = await createUser({
        name: 'User',
        email: 'user@example.com'
    });

    seller = await createUser({
        name: 'Seller',
        email: 'seller@example.com',
        role: 'seller'
    });

    adminToken = await login(baseUrl, 'admin@example.com');
    userToken = await login(baseUrl, 'user@example.com');
});

test.after(async () => {
    await stopTestServer(server);
    await disconnectTestDatabase();
});

test('admin can access users', async () => {
    const response = await apiRequest(
        baseUrl,
        'GET',
        '/api/admin/users',
        undefined,
        adminToken
    );

    assert.equal(response.status, 200);
    assert.equal(response.data.success, true);
});

test('normal user cannot access admin endpoints', async () => {
    const response = await apiRequest(
        baseUrl,
        'GET',
        '/api/admin/users',
        undefined,
        userToken
    );

    assert.equal(response.status, 403);
});

test('admin can disable a seller', async () => {
    const response = await apiRequest(
        baseUrl,
        'PATCH',
        `/api/admin/sellers/${seller._id}/status`,
        { isActive: false },
        adminToken
    );

    assert.equal(response.status, 200);

    const updatedSeller = await User.findById(seller._id);
    assert.equal(updatedSeller.isActive, false);
});

test('seller status endpoint validates isActive', async () => {
    const response = await apiRequest(
        baseUrl,
        'PATCH',
        `/api/admin/sellers/${seller._id}/status`,
        { isActive: 'false' },
        adminToken
    );

    assert.equal(response.status, 400);
});

test('admin can view seller applications', async () => {
    await SellerApplication.create({
        user: normalUser._id
    });

    const response = await apiRequest(
        baseUrl,
        'GET',
        '/api/admin/seller-applications',
        undefined,
        adminToken
    );

    assert.equal(response.status, 200);
    assert.equal(response.data.success, true);
    assert.equal(response.data.sellerApplications.length, 1);
});
