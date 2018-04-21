const express = require('express');
const router = express.Router();

router.use('/timeseries', require('./timeseries').router);

module.exports = { router };