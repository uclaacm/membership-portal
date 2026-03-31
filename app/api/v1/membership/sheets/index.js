const express = require('express');

const error = require('../../../../error');
const syncEventsFromSheets = require('../../../../../scripts/sheets-event-writer');
const { Event } = require('../../../../db');

const router = express.Router();

/* Path: POST /api/v1/sheets/event */
router.post('/event', async (req, res, next) => {
  // User must be admin to sync events.
  if (!req.user || !req.user.isAdmin()) {
    return next(new error.Forbidden());
  }

  try {
    // Sync events from Google Sheets to database.
    const results = await syncEventsFromSheets(Event);

    // Treat as success if any events were synced, even with some errors.
    const totalSynced = results.created + results.updated;
    const hasErrors = results.errors.length > 0;
    const isSuccess = totalSynced > 0 || !hasErrors;

    let message;
    if (totalSynced === 0 && hasErrors) {
      message = `Failed to sync events. ${results.errors.length} error(s) occurred.`;
    } else if (hasErrors) {
      message = `Synced ${totalSynced} event(s) with ${results.errors.length} error(s): ${results.errors.join('; ')}`;
    } else {
      message = `Successfully synced ${totalSynced} event(s) (${results.created} created, ${results.updated} updated).`;
    }

    return res.json({
      error: null,
      success: isSuccess,
      created: results.created,
      updated: results.updated,
      skipped: results.skipped,
      total: totalSynced,
      warnings: hasErrors ? results.errors : [],
      message,
    });
  } catch (err) {
    return next(new error.Internal(`Failed to sync events from Google Sheets: ${err.message}`));
  }
});

module.exports = { router };
