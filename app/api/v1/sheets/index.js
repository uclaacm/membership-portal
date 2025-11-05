const express = require('express');
const error = require("../../../error");

const getEventGenerator = () => import('../../../../event-generator-sheets.mjs');

const router = express.Router();

/* Path: POST /api/v1/sheets/events */
router.post('/event', async (req, res, next) => {
    if (!req.user || !req.user.isAdmin()) {
        return next(new error.Forbidden());
    }

    try {
        const { default: getAllEvents } = await getEventGenerator();
        
        console.log('Starting event synchronization from Google Sheets...');

        const events = await getAllEvents(); 
        
        res.json({ 
            error: null,
            success: true, 
            count: events.length, 
            message: 'Events synchronized successfully.' 
        });
    } catch (err) {
        console.error('Event Sync failed:', err);
        // Use your existing error handler
        next(new error.Internal('Failed to sync events from external source.'));
    }
});

module.exports = { router };