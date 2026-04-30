const {
  InternshipApplication,
  getCurrentApplicationCycle,
} = require('../models/InternshipApplication');
const { Committee } = require('../models/Committee');
const {
  buildDeadlineViolationMessage,
  findCommitteesPastDeadline,
  getCommitteeLabel,
} = require('../utils/deadlineValidation');

const CHOICE_FIELDS = [
  {
    label: 'first choice',
    committeeField: 'firstChoiceCommittee',
    responsesField: 'firstChoiceResponses',
    statusField: 'firstChoiceStatus',
  },
  {
    label: 'second choice',
    committeeField: 'secondChoiceCommittee',
    responsesField: 'secondChoiceResponses',
    statusField: 'secondChoiceStatus',
  },
  {
    label: 'third choice',
    committeeField: 'thirdChoiceCommittee',
    responsesField: 'thirdChoiceResponses',
    statusField: 'thirdChoiceStatus',
  },
];

function getOfficerCommittees(user) {
  if (!user) {
    return [];
  }
  if (user.getDataValue) {
    return user.getDataValue('committees') || [];
  }
  return user.committees || [];
}

function normalizeCommitteeName(name) {
  return typeof name === 'string' ? name.trim().toLowerCase() : '';
}

function officerCanManageCommittee(user, committee) {
  const officerCommittees = getOfficerCommittees(user)
    .map(normalizeCommitteeName)
    .filter(Boolean);
  const committeeNames = [
    committee && committee.name,
    committee && committee.displayName,
  ].map(normalizeCommitteeName).filter(Boolean);

  return committeeNames.some((name) => officerCommittees.includes(name));
}

function buildMissingFieldsMessage(missingFields) {
  return `Missing required fields: ${missingFields.join(', ')}`;
}

// Create a new internship application
async function createApplication(req, res) {
  try {
    const applicationCycle = getCurrentApplicationCycle();

    const existingApplication = await InternshipApplication.findOne({
      userId: req.user.uuid,
      applicationCycle,
      deletedAt: null,
    });

    if (existingApplication) {
      res.status(409).json({
        success: false,
        message: `You have already submitted an application for cycle ${applicationCycle}`,
      });
      return;
    }

    const committeeChoiceFields = [
      'firstChoiceCommittee',
      'secondChoiceCommittee',
      'thirdChoiceCommittee',
    ];
    const committeeIds = committeeChoiceFields
      .map((field) => req.body[field])
      .filter(Boolean);

    if (committeeIds.length > 0) {
      const committees = await Committee.find({ _id: { $in: committeeIds } })
        .select('isActive applicationDeadline displayName name');

      const committeeById = new Map(
        committees.map((committee) => [committee.id, committee]),
      );
      const now = new Date();

      const invalidChoice = committeeIds.find((committeeId) => {
        const committee = committeeById.get(committeeId.toString());
        return !committee;
      });

      if (invalidChoice) {
        res.status(400).json({
          success: false,
          message: `Invalid committee selection: ${invalidChoice}`,
        });
        return;
      }

      const inactiveCommittee = committeeIds
        .map((committeeId) => committeeById.get(committeeId.toString()))
        .find((committee) => committee.isActive !== true);

      if (inactiveCommittee) {
        res.status(400).json({
          success: false,
          message: `Committee ${inactiveCommittee.displayName || inactiveCommittee.name} is not accepting applications`,
        });
        return;
      }

      const pastDeadlineCommittee = committeeIds
        .map((committeeId) => committeeById.get(committeeId.toString()))
        .find(
          (committee) => committee.applicationDeadline
            && new Date(committee.applicationDeadline) <= now,
        );

      if (pastDeadlineCommittee) {
        res.status(400).json({
          success: false,
          message: `Committee ${pastDeadlineCommittee.displayName || pastDeadlineCommittee.name} is past its application deadline`,
        });
        return;
      }
    }

    // Autopopulate user info from authenticated user
    const applicationData = {
      ...req.body,
      userId: req.user.uuid,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      applicationCycle,
      submissionStatus: 'draft',
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

    // Officer scoping logic
    const isOfficer = typeof req.user.isOfficer === 'function' && req.user.isOfficer();
    const isAdmin = typeof req.user.isAdmin === 'function' && req.user.isAdmin();
    const includeDrafts = isAdmin && req.query.includeDrafts === 'true';

    if (isOfficer && !isAdmin) {
      const officerCommittees = req.user.getDataValue ? (req.user.getDataValue('committees') || []) : (req.user.committees || []);
      if (!officerCommittees.length) {
        return res.json({ success: true, data: [], pagination: { total: 0 } });
      }

      // Fetch committee ObjectIds matching officer's committee names (case-insensitive)
      const committees = await Committee.find({
        name: { $in: officerCommittees.map((c) => c.toLowerCase()) },
      });
      const committeeIds = committees.map((c) => c.id);

      // Scope query: application must have at least one choice in officer's committees
      query.$or = [
        { firstChoiceCommittee: { $in: committeeIds } },
        { secondChoiceCommittee: { $in: committeeIds } },
        { thirdChoiceCommittee: { $in: committeeIds } },
      ];
    }

    // Always exclude soft-deleted records
    query.deletedAt = null;

    // Officers should not see drafts; admins can opt in
    if (!includeDrafts) {
      query.submissionStatus = 'submitted';
    }
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

    return res.status(200).json({
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
    return res.status(500).json({
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
    const applicationCycle = getCurrentApplicationCycle();
    const application = await InternshipApplication.findOne({
      userId: req.user.uuid,
      applicationCycle,
      deletedAt: null,
    });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    // Always include submissionStatus in the response
    return res.status(200).json({
      success: true,
      data: application,
      submissionStatus: application.submissionStatus,
    });
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

    // Fetch the application to check ownership and status
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const isAdmin = typeof req.user.isAdmin === 'function' && req.user.isAdmin();
    const isOfficer = typeof req.user.isOfficer === 'function' && req.user.isOfficer();
    const isApplicant = application.userId === req.user.uuid;

    // If applicant and already submitted, forbid update
    if (
      application.submissionStatus === 'submitted'
      && isApplicant
      && !isOfficer
      && !isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot update a submitted application',
      });
    }

    // Build update object with only allowed fields
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Officers/admins can update status fields on submitted apps
    // (already included in allowedFields)
    updateData.lastModifiedAt = Date.now();

    const updatedApp = await InternshipApplication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      data: updatedApp,
      message: 'Application updated successfully',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message,
    });
  }
}

// Delete an internship application
async function deleteApplication(req, res) {
  try {
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const isAdmin = typeof req.user.isAdmin === 'function' && req.user.isAdmin();
    const isOwner = application.userId === req.user.uuid;

    // Only the owner can delete a draft; only admins can delete submitted applications
    if (application.submissionStatus === 'submitted' && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can delete submitted applications' });
    }
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await application.updateOne({ deletedAt: new Date(), deletedBy: req.user.uuid });
    return res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message,
    });
  }
}

// Update review status for one committee choice on a submitted application.
async function updateApplicationStatus(req, res) {
  try {
    const { statusField, status } = req.body;
    const choice = CHOICE_FIELDS.find((item) => item.statusField === statusField);

    if (!choice) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status field',
      });
    }

    const application = await InternshipApplication.findById(req.params.id);
    if (!application || application.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.submissionStatus !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Application status can only be updated after submission',
      });
    }

    const committeeId = application[choice.committeeField];
    if (!committeeId) {
      return res.status(400).json({
        success: false,
        message: `Application does not include a ${choice.label} committee`,
      });
    }

    const committee = await Committee.findById(committeeId)
      .select('name displayName');
    if (!committee) {
      return res.status(400).json({
        success: false,
        message: `${choice.label} committee no longer exists`,
      });
    }

    const isAdmin = typeof req.user.isAdmin === 'function' && req.user.isAdmin();
    const isOfficer = typeof req.user.isOfficer === 'function' && req.user.isOfficer();

    if (!isAdmin && (!isOfficer || !officerCanManageCommittee(req.user, committee))) {
      return res.status(403).json({
        success: false,
        message: `You do not have permission to update ${choice.label} status`,
      });
    }

    const lastModifiedAt = new Date();
    const updatedApp = await InternshipApplication.findByIdAndUpdate(
      req.params.id,
      {
        [statusField]: status,
        lastModifiedAt,
      },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      data: updatedApp,
      message: 'Application status updated successfully',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message,
    });
  }
}

// Submit a draft application after validating ownership, state, committees,
// deadlines, and completeness of required question answers.
async function submitApplication(req, res) {
  try {
    const application = await InternshipApplication.findById(req.params.id);

    if (!application || application.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.userId !== req.user.uuid) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to submit this application',
      });
    }

    if (application.submissionStatus !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been submitted',
      });
    }

    const selectedChoices = CHOICE_FIELDS
      .map((choice) => ({ ...choice, committeeId: application[choice.committeeField] }))
      .filter((choice) => choice.committeeId);

    if (selectedChoices.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Application must include at least one committee selection',
      });
    }

    const committeeIds = selectedChoices.map((c) => c.committeeId);
    const committees = await Committee.find({ _id: { $in: committeeIds } })
      .select('isActive applicationDeadline customQuestions displayName name');
    const committeeById = new Map(committees.map((c) => [c._id.toString(), c]));

    const expiredCommittees = findCommitteesPastDeadline(committees);
    if (expiredCommittees.length > 0) {
      return res.status(400).json({
        success: false,
        message: buildDeadlineViolationMessage(expiredCommittees),
      });
    }

    for (let i = 0; i < selectedChoices.length; i++) {
      const { label, committeeId, responsesField } = selectedChoices[i];
      const committee = committeeById.get(committeeId.toString());

      if (!committee) {
        return res.status(400).json({
          success: false,
          message: `${label} committee no longer exists`,
        });
      }

      if (!committee.isActive) {
        return res.status(400).json({
          success: false,
          message: `${label} committee is no longer accepting applications`,
        });
      }

      const requiredQuestions = committee.customQuestions.filter((q) => q.required);
      const responses = application[responsesField] || [];
      const answersByKey = new Map(
        responses.map((r) => [r.questionKey, (r.answer || '').trim()]),
      );

      const missing = requiredQuestions.filter((q) => !answersByKey.get(q.questionKey));

      if (missing.length > 0) {
        const missingNames = missing
          .map((q) => `${getCommitteeLabel(committee)}: ${q.questionText}`);
        return res.status(400).json({
          success: false,
          message: buildMissingFieldsMessage(missingNames),
          missingFields: missingNames,
        });
      }
    }

    const submittedAt = new Date();
    const updatedApp = await InternshipApplication.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.uuid,
        submissionStatus: 'draft',
        deletedAt: null,
      },
      {
        submissionStatus: 'submitted',
        submittedAt,
        lastModifiedAt: submittedAt,
      },
      { new: true, runValidators: true },
    );

    if (!updatedApp) {
      return res.status(400).json({
        success: false,
        message: 'Application has already been submitted',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedApp,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message,
    });
  }
}

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  getOwnApplication,
  submitApplication,
};
