const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../src/.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../src/app');

const getTestMongoUri = () => {
    const uri = process.env.MONGO_TEST_URI || process.env.MONGO_URI;

    if (!uri) {
        throw new Error('MONGO_URI is not configured. Set it in src/.env before running tests.');
    }

    const url = new URL(uri);
    const currentDb = url.pathname.replace(/^\/+/, '') || 'backend';
    url.pathname = `/${currentDb}_test`;

    return url.toString();
};

const connectTestDatabase = async () => {
    await mongoose.connect(getTestMongoUri(), {
        serverSelectionTimeoutMS: 3000
    });
};

const clearTestDatabase = async () => {
    const collections = Object.values(mongoose.connection.collections);

    for (const collection of collections) {
        await collection.deleteMany({});
    }
};

const disconnectTestDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
};

const startTestServer = async () => {
    const server = await new Promise((resolve) => {
        const instance = app.listen(0, () => resolve(instance));
    });

    const { port } = server.address();

    return {
        server,
        baseUrl: `http://127.0.0.1:${port}`
    };
};

const stopTestServer = async (server) => {
    if (!server) return;

    await new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
};

const apiRequest = async (baseUrl, method, path, body, token) => {
    const headers = {};

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
    });

    let data = null;

    try {
        data = await response.json();
    } catch (_) {
        data = null;
    }

    return {
        status: response.status,
        data
    };
};

const createUser = async ({
    name,
    email,
    password = 'password123',
    role = 'user',
    isActive = true
}) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const User = require('../src/models/User');

    return User.create({
        name,
        email,
        password: hashedPassword,
        role,
        isActive
    });
};

const login = async (baseUrl, email, password = 'password123') => {
    const response = await apiRequest(
        baseUrl,
        'POST',
        '/api/auth/login',
        { email, password }
    );

    if (response.status !== 200) {
        throw new Error(
            `Login failed for ${email}: ${JSON.stringify(response.data)}`
        );
    }

    return response.data.token;
};

module.exports = {
    apiRequest,
    clearTestDatabase,
    connectTestDatabase,
    createUser,
    disconnectTestDatabase,
    login,
    startTestServer,
    stopTestServer
};
