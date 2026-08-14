const test = require('node:test');
const assert = require('node:assert/strict');

const {
    apiRequest,
    clearTestDatabase,
    connectTestDatabase,
    disconnectTestDatabase,
    startTestServer,
    stopTestServer
} = require('./testUtils');

let server;
let baseUrl;

test.before(async () => {
    await connectTestDatabase();
    ({ server, baseUrl } = await startTestServer());
});

test.beforeEach(async () => {
    await clearTestDatabase();
});

test.after(async () => {
    await stopTestServer(server);
    await disconnectTestDatabase();
});

test('health endpoint works', async () => {
    const response = await apiRequest(baseUrl, 'GET', '/api/health');

    assert.equal(response.status, 200);
    assert.equal(response.data.success, true);
});

test('registers a user', async () => {
    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/auth/register',
        {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        }
    );

    assert.equal(response.status, 201);
    assert.equal(response.data.success, true);
});

test('rejects duplicate email', async () => {
    const body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
    };

    await apiRequest(baseUrl, 'POST', '/api/auth/register', body);
    const response = await apiRequest(baseUrl, 'POST', '/api/auth/register', body);

    assert.equal(response.status, 409);
    assert.equal(response.data.success, false);
});

test('rejects invalid registration data', async () => {
    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/auth/register',
        {
            name: 'A',
            email: 'invalid-email',
            password: '123'
        }
    );

    assert.equal(response.status, 400);
    assert.equal(response.data.success, false);
});

test('logs in with valid credentials', async () => {
    await apiRequest(
        baseUrl,
        'POST',
        '/api/auth/register',
        {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        }
    );

    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/auth/login',
        {
            email: 'test@example.com',
            password: 'password123'
        }
    );

    assert.equal(response.status, 200);
    assert.equal(response.data.success, true);
    assert.ok(response.data.token);
});

test('rejects incorrect credentials', async () => {
    await apiRequest(
        baseUrl,
        'POST',
        '/api/auth/register',
        {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        }
    );

    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/auth/login',
        {
            email: 'test@example.com',
            password: 'wrongpassword'
        }
    );

    assert.equal(response.status, 401);
    assert.equal(response.data.success, false);
});

test('protects /me', async () => {
    const response = await apiRequest(baseUrl, 'GET', '/api/auth/me');

    assert.equal(response.status, 401);
    assert.equal(response.data.success, false);
});
