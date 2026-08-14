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
let user;
let userToken;
let adminToken;

test.before(async () => {
    await connectTestDatabase();
    ({ server, baseUrl } = await startTestServer());
});

test.beforeEach(async () => {
    await clearTestDatabase();

    user = await createUser({
        name: 'Applicant',
        email: 'user@example.com'
    });

    await createUser({
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin'
    });

    userToken = await login(baseUrl, 'user@example.com');
    adminToken = await login(baseUrl, 'admin@example.com');
});

test.after(async () => {
    await stopTestServer(server);
    await disconnectTestDatabase();
});

test('user can apply to become a seller', async () => {
    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/seller-applications',
        undefined,
        userToken
    );

    assert.equal(response.status, 201);
    assert.equal(response.data.success, true);

    const application = await SellerApplication.findOne({
        user: user._id
    });

    assert.ok(application);
    assert.equal(application.status, 'pending');
});

test('user cannot apply twice', async () => {
    await SellerApplication.create({
        user: user._id
    });

    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/seller-applications',
        undefined,
        userToken
    );

    assert.equal(response.status, 400);
});

test('admin can approve seller application', async () => {
    const application = await SellerApplication.create({
        user: user._id
    });

    const response = await apiRequest(
        baseUrl,
        'PATCH',
        `/api/admin/seller-applications/${application._id}/approve`,
        undefined,
        adminToken
    );

    assert.equal(response.status, 200);

    const updatedUser = await User.findById(user._id);
    const updatedApplication = await SellerApplication.findById(application._id);

    assert.equal(updatedUser.role, 'seller');
    assert.equal(updatedUser.isActive, true);
    assert.equal(updatedApplication.status, 'approved');
});

test('admin can reject seller application', async () => {
    const application = await SellerApplication.create({
        user: user._id
    });

    const response = await apiRequest(
        baseUrl,
        'PATCH',
        `/api/admin/seller-applications/${application._id}/reject`,
        undefined,
        adminToken
    );

    assert.equal(response.status, 200);

    const updatedUser = await User.findById(user._id);
    const updatedApplication = await SellerApplication.findById(application._id);

    assert.equal(updatedUser.role, 'user');
    assert.equal(updatedApplication.status, 'rejected');
});
