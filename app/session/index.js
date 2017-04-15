const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const config = require('../config');

let opts = {
    resave: true,
    secret: config.session.secret,
    cookie: { secure: 'auto' },
    saveUninitialized: true
};

if (config.session.uri)
    opts.store = new RedisStore({ url: config.session.uri });

module.exports = session(opts);