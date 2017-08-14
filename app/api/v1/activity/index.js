const express = require('express');
const error = require('../../../error');
const { Activity } = require('../../../db');
const router = express.Router();

router.get('/', (req, res, next) => {
  Activity.getPublicStream(req.user.uuid).then(activity => {
    res.json({ error: null, activity: activity.map(a => a.getPublic()) });
  }).catch(next);
});

module.exports = { router };