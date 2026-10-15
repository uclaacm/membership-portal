require('dotenv').config();

// app/config throws at load time without a session secret, and its file fallback
// (app/config/SESSION_SECRET) is gitignored, so CI and fresh clones have neither.
// Tests only need some value; a real SESSION_SECRET in the environment still wins.
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret';
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
