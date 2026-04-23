const { Committee } = require('../models/Committee');

async function getAllCommittees(req, res, next) {
  try {
    const includeInactive = req.query.includeInactive === 'true' && req.user && req.user.isAdmin();
    const filter = includeInactive ? {} : { isActive: true };

    const committees = await Committee.find(filter).select('-__v').sort({ displayName: 1 });

    res.json({ error: null, committees });
  } catch (error) {
    next(error);
  }
}

async function getCommitteeById(req, res, next) {
  try {
    const committee = await Committee.findById(req.params.id);
    if (!committee) {
      return res.status(404).json({ error: 'Committee not found' });
    }

    return res.json({ error: null, committee });
  } catch (error) {
    return next(error);
  }
}

async function createCommittees(req, res, next) {
  try {
    const committee = new Committee(req.body);
    await committee.save();
    res.status(201).json({ error: null, committee });
  } catch (error) {
    next(error);
  }
}

async function updateCommittee(req, res, next) {
  try {
    const committee = await Committee.findById(req.params.id);
    if (!committee) return res.status(404).json({ error: 'Committee not found' });

    const isOfficer = req.user && typeof req.user.isOfficer === 'function' && req.user.isOfficer();
    const isAdmin = req.user && typeof req.user.isAdmin === 'function' && req.user.isAdmin();

    if (isOfficer && !isAdmin) {
      // Officers may only update customQuestions for their own committee
      const officerCommittees = (req.user.getDataValue && req.user.getDataValue('committees')) || req.user.committees || [];
      if (!officerCommittees.map((c) => c.toLowerCase()).includes(committee.name.toLowerCase())) {
        return res.status(403).json({ error: 'You can only edit your own committee' });
      }
      // Whitelist: only customQuestions allowed for officers
      if (!('customQuestions' in req.body)) {
        return res.status(400).json({ error: 'customQuestions is required' });
      }
      const { customQuestions } = req.body;
      const updated = await Committee.findByIdAndUpdate(
        req.params.id,
        { customQuestions },
        { new: true, runValidators: true },
      );
      return res.json({ error: null, updatedCommittee: updated });
    }

    // Admin: full update
    const updated = await Committee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    return res.json({ error: null, updatedCommittee: updated });
  } catch (error) {
    return next(error);
  }
}

async function deleteCommittee(req, res, next) {
  try {
    const committee = await Committee.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!committee) {
      return res.status(404).json({ error: 'Committee not found' });
    }
    return res.json({ error: null, message: 'Committee deactivated' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllCommittees,
  getCommitteeById,
  createCommittees,
  updateCommittee,
  deleteCommittee,
};
