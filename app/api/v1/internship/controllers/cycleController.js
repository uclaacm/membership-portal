const { InternshipApplication } = require('../models/InternshipApplication');
const {
  computeDefaultCycleLabel,
  getCurrentCycle,
  setCurrentCycle,
} = require('../models/InternshipSettings');
const error = require('../../../../error');

// Bumps a "YYYY-YYYY+1" cycle label forward by one year. Falls back to a
// fresh calendar-based label if the current cycle isn't in that shape (e.g.
// an admin previously set a custom label).
function suggestNextCycle(currentCycle) {
  const match = /^(\d{4})-(\d{4})$/.exec(currentCycle);
  if (!match) {
    return computeDefaultCycleLabel();
  }
  const startYear = Number(match[1]);
  return `${startYear + 1}-${startYear + 2}`;
}

async function getCycleInfo(req, res, next) {
  try {
    const currentCycle = await getCurrentCycle();
    const pastCycles = await InternshipApplication.distinct('applicationCycle', {
      applicationCycle: { $ne: currentCycle },
    });

    return res.json({
      error: null,
      currentCycle,
      suggestedNextCycle: suggestNextCycle(currentCycle),
      pastCycles: pastCycles.sort(),
    });
  } catch (e) {
    return next(e);
  }
}

// Archives every committee's current-cycle applications and advances the
// stored "current" cycle. Committee documents are never touched by this —
// they persist unchanged; they just have no current-cycle applications
// after this runs.
async function advanceCycle(req, res, next) {
  try {
    const previousCycle = await getCurrentCycle();
    const newCycle = (req.body && req.body.newCycle) || suggestNextCycle(previousCycle);

    if (typeof newCycle !== 'string' || !newCycle.trim()) {
      throw new error.BadRequest('newCycle must be a non-empty string.');
    }
    if (newCycle === previousCycle) {
      throw new error.BadRequest('newCycle must be different from the current cycle.');
    }

    const result = await InternshipApplication.updateMany(
      { applicationCycle: previousCycle, deletedAt: null, archivedAt: null },
      { $set: { archivedAt: new Date(), archivedBy: req.user.uuid } },
    );
    const archivedCount = (result && (
      result.modifiedCount !== undefined ? result.modifiedCount : result.nModified
    )) || 0;

    await setCurrentCycle(newCycle);

    return res.json({
      error: null, previousCycle, newCycle, archivedCount,
    });
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  getCycleInfo,
  advanceCycle,
};
