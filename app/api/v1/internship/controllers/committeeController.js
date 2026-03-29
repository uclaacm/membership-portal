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
    const updatedCommittee = await Committee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!updatedCommittee) {
      return res.status(404).json({ error: 'Committee not found' });
    }
    return res.json({ error: null, updatedCommittee });
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
