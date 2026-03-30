const {
  InternshipApplication,
  getCurrentApplicationCycle,
} = require('../models/InternshipApplication');

// Create a new internship application
async function createApplication(req, res) {
  try {
    const applicationCycle = getCurrentApplicationCycle();

    const existingApplication = await InternshipApplication.findOne({
      userId: req.user.uuid,
      applicationCycle,
    });

    if (existingApplication) {
      res.status(409).json({
        success: false,
        message: `You have already submitted an application for cycle ${applicationCycle}`,
      });
      return;
    }

    // Autopopulate user info from authenticated user
    const applicationData = {
      ...req.body,
      userId: req.user.uuid,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      applicationCycle,
    };

    const application = new InternshipApplication(applicationData);
    await application.save();

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this cycle',
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error creating application',
        error: error.message,
      });
    }
  }
}

// Get all internship applications
async function getAllApplications(req, res) {
  try {
    const {
      firstChoiceStatus,
      secondChoiceStatus,
      thirdChoiceStatus,
      firstChoiceCommittee,
      secondChoiceCommittee,
      thirdChoiceCommittee,
      applicationCycle,
      userId,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query object with validated parameters
    const query = {};
    // Status filters are already validated by express-validator
    if (firstChoiceStatus && typeof firstChoiceStatus === 'string') {
      query.firstChoiceStatus = firstChoiceStatus;
    }
    if (secondChoiceStatus && typeof secondChoiceStatus === 'string') {
      query.secondChoiceStatus = secondChoiceStatus;
    }
    if (thirdChoiceStatus && typeof thirdChoiceStatus === 'string') {
      query.thirdChoiceStatus = thirdChoiceStatus;
    }
    // Filter by committee choices
    if (firstChoiceCommittee && typeof firstChoiceCommittee === 'string') {
      query.firstChoiceCommittee = firstChoiceCommittee;
    }
    if (secondChoiceCommittee && typeof secondChoiceCommittee === 'string') {
      query.secondChoiceCommittee = secondChoiceCommittee;
    }
    if (thirdChoiceCommittee && typeof thirdChoiceCommittee === 'string') {
      query.thirdChoiceCommittee = thirdChoiceCommittee;
    }
    // Filter by application cycle
    if (applicationCycle && typeof applicationCycle === 'string') {
      query.applicationCycle = applicationCycle;
    }
    // Filter by userId (for member portal integration)
    if (userId && typeof userId === 'string') {
      query.userId = userId;
    }

    // Page and limit are already validated by express-validator to be positive integers
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const applications = await InternshipApplication.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await InternshipApplication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message,
    });
  }
}

// Get a single internship application by ID
async function getApplicationById(req, res) {
  try {
    const application = await InternshipApplication.findById(req.params.id);

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message,
    });
  }
}

// Get the authenticated user's own application
async function getOwnApplication(req, res) {
  try {
    const userId = req.user.uuid;
    const application = await InternshipApplication.findOne({ userId });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching application', error: error.message });
  }
}

// Update an internship application
async function updateApplication(req, res) {
  try {
    // Extract and validate allowed fields from req.body
    const allowedFields = [
      'userId',
      'firstName',
      'lastName',
      'email',
      'phone',
      'university',
      'major',
      'graduationYear',
      'firstChoiceCommittee',
      'secondChoiceCommittee',
      'thirdChoiceCommittee',
      'resumeUrl',
      'coverLetter',
      'firstChoiceResponses',
      'secondChoiceResponses',
      'thirdChoiceResponses',
      'firstChoiceStatus',
      'secondChoiceStatus',
      'thirdChoiceStatus',
    ];

    // Build update object with only allowed fields
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }); const application = await InternshipApplication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: application,
      message: 'Application updated successfully',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error updating application',
        error: error.message,
      });
    }
  }
}

// Delete an internship application
async function deleteApplication(req, res) {
  try {
    const application = await InternshipApplication.findByIdAndDelete(req.params.id);

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message,
    });
  }
}

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getOwnApplication,
};
