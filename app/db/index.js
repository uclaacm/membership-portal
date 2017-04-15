let User = require('./schema/user');

User.sync();

module.exports = { User }; 
