const mongoose = require('mongoose');
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
    officer1RatingField: 'firstChoiceOfficer1Rating',
    officer2RatingField: 'firstChoiceOfficer2Rating',
    notesField: 'firstChoiceNotes',
  },
  {
    label: 'second choice',
    committeeField: 'secondChoiceCommittee',
    responsesField: 'secondChoiceResponses',
    statusField: 'secondChoiceStatus',
    officer1RatingField: 'secondChoiceOfficer1Rating',
    officer2RatingField: 'secondChoiceOfficer2Rating',
    notesField: 'secondChoiceNotes',
  },
  {
    label: 'third choice',
    committeeField: 'thirdChoiceCommittee',
    responsesField: 'thirdChoiceResponses',
    statusField: 'thirdChoiceStatus',
    officer1RatingField: 'thirdChoiceOfficer1Rating',
    officer2RatingField: 'thirdChoiceOfficer2Rating',
    notesField: 'thirdChoiceNotes',
  },
];

function getChoiceForReviewField(reviewField) {
  return CHOICE_FIELDS.find((choice) => (
    choice.officer1RatingField === reviewField
    || choice.officer2RatingField === reviewField
    || choice.notesField === reviewField
  ));
}

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

// Strip response arrays for any committee choice the officer doesn't manage,
// so answers written for other committees never reach an officer's browser
// (not just hidden in the UI — removed from the API response itself).
function scrubResponsesForOfficer(application, ownedCommitteeIds) {
  const plain = typeof application.toObject === 'function' ? application.toObject() : { ...application };
  const ownedIds = new Set(ownedCommitteeIds.map((id) => id.toString()));

  CHOICE_FIELDS.forEach((choice) => {
    const committeeId = plain[choice.committeeField];
    const isOwned = committeeId && ownedIds.has(committeeId.toString());
    if (!isOwned) {
      plain[choice.responsesField] = [];
      plain[choice.officer1RatingField] = null;
      plain[choice.officer2RatingField] = null;
      plain[choice.notesField] = '';
    }
  });

  return plain;
}

async function getOfficerCommitteeIds(user) {
  const allCommittees = await Committee.find({}).select('name displayName');
  return allCommittees
    .filter((committee) => officerCanManageCommittee(user, committee))
    .map((committee) => committee.id);
}

// Create a new internship application
async function createApplication(req, res) {
  try {
    const applicationCycle = await getCurrentApplicationCycle();

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
      search,
      archived,
      committeeId,
      status,
      choiceRank,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query object with validated parameters
    const query = {};
    // Committee-scope (officer auto-scope, or an explicit committeeId
    // filter) and free-text search each need their own $or clause; collect
    // them here and combine via $and so neither clobbers the other.
    const andConditions = [];

    // Officer scoping logic
    const isOfficer = typeof req.user.isOfficer === 'function' && req.user.isOfficer();
    const isAdmin = typeof req.user.isAdmin === 'function' && req.user.isAdmin();
    const includeDrafts = isAdmin && req.query.includeDrafts === 'true';

    let officerCommitteeIds = null;
    let committeeCondition = null;

    if (isOfficer && !isAdmin) {
      const officerCommittees = getOfficerCommittees(req.user);
      if (!officerCommittees.length) {
        return res.json({ success: true, data: [], pagination: { total: 0 } });
      }

      // Fetch committee ObjectIds matching officer's committee names (case-insensitive).
      // Comparing lowercased names directly against Committee.name would silently match
      // nothing, since committee names are stored in display casing (e.g. "ICPC").
      officerCommitteeIds = await getOfficerCommitteeIds(req.user);
      committeeCondition = { $in: officerCommitteeIds };
    } else if (committeeId && typeof committeeId === 'string') {
      // "This application chose committee X in any of its 3 choice slots" —
      // distinct from the strict per-slot firstChoiceCommittee/etc. filters
      // below, which match one specific slot. Since the 3 slots can never
      // repeat the same committee, an equality filter on all 3 at once would
      // never match anything; this is the correct "any slot" filter.
      committeeCondition = committeeId;
    }

    // "This application's committee-matching slot (see committeeCondition
    // above) also has status X" — status must be paired with committee
    // scope PER SLOT, not as an independent "any slot has status X" clause.
    // Otherwise "committee A, status reviewing" could wrongly match an
    // application where committee A's own slot is "accepted" but some other,
    // unrelated slot happens to be "reviewing".
    const hasStatusFilter = status && typeof status === 'string';
    // choiceRank ("1"|"2"|"3") restricts matching to one specific slot
    // instead of "any slot" — used by the officer dashboard's choice-rank
    // filter, since an officer only cares about the single slot (if any)
    // that's their own committee.
    const choiceSlots = ['1', '2', '3'].includes(choiceRank)
      ? [CHOICE_FIELDS[Number(choiceRank) - 1]]
      : CHOICE_FIELDS;
    const hasChoiceRankFilter = choiceSlots.length < CHOICE_FIELDS.length;
    if (committeeCondition !== null || hasStatusFilter || hasChoiceRankFilter) {
      andConditions.push({
        $or: choiceSlots.map(({ committeeField, statusField }) => {
          const clause = {};
          if (committeeCondition !== null) clause[committeeField] = committeeCondition;
          if (hasStatusFilter) clause[statusField] = status;
          return clause;
        }),
      });
    }

    // Free-text search over applicant name/email
    if (search && typeof search === 'string') {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      andConditions.push({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
        ],
      });
    }

    if (andConditions.length === 1) {
      Object.assign(query, andConditions[0]);
    } else if (andConditions.length > 1) {
      query.$and = andConditions;
    }

    // Always exclude soft-deleted records
    query.deletedAt = null;

    // Archived applications (a past, closed cycle) are hidden from the
    // default view; ?archived=true switches to the read-only past-cycles
    // view showing only archived applications.
    query.archivedAt = archived === true || archived === 'true' ? { $ne: null } : null;

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

    const data = officerCommitteeIds
      ? applications.map((app) => scrubResponsesForOfficer(app, officerCommitteeIds))
      : applications;

    return res.status(200).json({
      success: true,
      data,
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

// Per-status counts across ALL of a committee's current, non-archived,
// submitted applications (not just one page) — "my status" is whichever
// slot's committee matches, mirroring the officer dashboard's
// enrichForCommittee logic. Powers the officer dashboard's stats pills,
// which need true totals independent of the current page/filters.
async function getApplicationStatusCounts(req, res) {
  try {
    const isOfficer = typeof req.user.isOfficer === 'function' && req.user.isOfficer();
    const isAdmin = typeof req.user.isAdmin === 'function' && req.user.isAdmin();

    let committeeIds;
    if (isOfficer && !isAdmin) {
      committeeIds = await getOfficerCommitteeIds(req.user);
    } else if (isAdmin && req.query.committeeId) {
      committeeIds = [req.query.committeeId];
    } else {
      return res.status(400).json({ success: false, message: 'committeeId is required for admin requests' });
    }

    if (!committeeIds.length) {
      return res.json({ success: true, counts: {} });
    }

    const invalidCommitteeId = committeeIds.find(
      (id) => typeof id === 'string' && !mongoose.isValidObjectId(id),
    );
    if (invalidCommitteeId) {
      return res.status(400).json({ success: false, message: 'committeeId must be a valid MongoDB ID' });
    }

    const committeeObjectIds = committeeIds.map(
      (id) => (typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id),
    );

    const results = await InternshipApplication.aggregate([
      {
        $match: {
          deletedAt: null,
          archivedAt: null,
          submissionStatus: 'submitted',
          $or: [
            { firstChoiceCommittee: { $in: committeeObjectIds } },
            { secondChoiceCommittee: { $in: committeeObjectIds } },
            { thirdChoiceCommittee: { $in: committeeObjectIds } },
          ],
        },
      },
      {
        $addFields: {
          myStatus: {
            $switch: {
              branches: [
                { case: { $in: ['$firstChoiceCommittee', committeeObjectIds] }, then: '$firstChoiceStatus' },
                { case: { $in: ['$secondChoiceCommittee', committeeObjectIds] }, then: '$secondChoiceStatus' },
                { case: { $in: ['$thirdChoiceCommittee', committeeObjectIds] }, then: '$thirdChoiceStatus' },
              ],
              default: null,
            },
          },
        },
      },
      { $match: { myStatus: { $ne: null } } },
      { $group: { _id: '$myStatus', count: { $sum: 1 } } },
    ]);

    const counts = {};
    results.forEach((row) => {
      counts[row._id] = row.count;
    });

    return res.json({ success: true, counts });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching application status counts',
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

    const isAdmin = typeof req.user.isAdmin === 'function' && req.user.isAdmin();
    const isOfficer = typeof req.user.isOfficer === 'function' && req.user.isOfficer();

    if (isOfficer && !isAdmin) {
      const officerCommitteeIds = await getOfficerCommitteeIds(req.user);
      const ownedIds = new Set(officerCommitteeIds.map((id) => id.toString()));
      const hasAccess = CHOICE_FIELDS.some((choice) => {
        const committeeId = application[choice.committeeField];
        return committeeId && ownedIds.has(committeeId.toString());
      });

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to view this application',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: scrubResponsesForOfficer(application, officerCommitteeIds),
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
    const applicationCycle = await getCurrentApplicationCycle();
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

    const data = (isOfficer && !isAdmin)
      ? scrubResponsesForOfficer(updatedApp, [committee.id])
      : updatedApp;

    return res.status(200).json({
      success: true,
      data,
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

// Update one officer-review field (either officer's yes/no rating, or the
// shared notes) for one committee choice on a submitted application.
async function updateApplicationReview(req, res) {
  try {
    const { reviewField, value } = req.body;
    const choice = getChoiceForReviewField(reviewField);

    if (!choice) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review field',
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
        message: 'Application review fields can only be set after submission',
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
        message: `You do not have permission to update ${choice.label} review details`,
      });
    }

    let normalizedValue;
    if (reviewField === choice.notesField) {
      normalizedValue = typeof value === 'string' ? value.trim() : '';
    } else {
      normalizedValue = value || null;
    }

    const lastModifiedAt = new Date();
    const updatedApp = await InternshipApplication.findByIdAndUpdate(
      req.params.id,
      {
        [reviewField]: normalizedValue,
        lastModifiedAt,
      },
      { new: true, runValidators: true },
    );

    const data = (isOfficer && !isAdmin)
      ? scrubResponsesForOfficer(updatedApp, [committee.id])
      : updatedApp;

    return res.status(200).json({
      success: true,
      data,
      message: 'Application review updated successfully',
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
      message: 'Error updating application review',
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
    const committeeById = new Map(committees.map((c) => [c.id.toString(), c]));

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
  getApplicationStatusCounts,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  updateApplicationReview,
  deleteApplication,
  getOwnApplication,
  submitApplication,
};
