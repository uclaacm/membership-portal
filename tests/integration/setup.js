// Loaded for integration runs only (see test:integration in package.json).
//
// The committee list lives in MongoDB (app/committees.js), and even the Postgres-backed routes
// validate committee names against it, so the app can't serve requests without a Mongo
// connection. index.js only connects when run as the real server, so do it here for each test
// file, and disconnect afterwards so Jest can exit instead of hanging on the open socket.
const mongoose = require('mongoose');
const { connectDB } = require('../../app/api/v1/internship/config/database');

beforeAll(() => connectDB());

afterAll(() => mongoose.disconnect());
