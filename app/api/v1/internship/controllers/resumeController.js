const { InternshipApplication } = require('../models/InternshipApplication');
const { ResumeFile } = require('../models/ResumeFile');
const {
  CHOICE_FIELDS,
  getOfficerCommitteeIds,
  UPDATE_APPLICATION_RESPONSE_EXCLUDED_FIELDS,
} = require('./applicationController');

// A PDF's header must appear within its first 1024 bytes. The browser-supplied mimetype is
// just a claim, so check the bytes too.
const PDF_HEADER_SEARCH_BYTES = 1024;

function looksLikePdf(buffer) {
  return buffer.subarray(0, PDF_HEADER_SEARCH_BYTES).includes('%PDF-');
}

function isAdminUser(user) {
  return typeof user.isAdmin === 'function' && user.isAdmin();
}

function isOfficerUser(user) {
  return typeof user.isOfficer === 'function' && user.isOfficer();
}

// Same rule as getApplicationById: admins see everything, officers only applications that
// chose one of their committees. Applicants can always see their own.
async function canViewResume(user, application) {
  if (application.userId === user.uuid || isAdminUser(user)) return true;
  if (!isOfficerUser(user)) return false;

  const ownedIds = new Set((await getOfficerCommitteeIds(user)).map((id) => id.toString()));
  return CHOICE_FIELDS.some((choice) => {
    const committeeId = application[choice.committeeField];
    return committeeId && ownedIds.has(committeeId.toString());
  });
}

// Content-Disposition with an ASCII fallback plus the RFC 5987 UTF-8 form, so names with
// quotes or non-ASCII characters can't break out of the header.
function contentDisposition(originalName) {
  const name = (originalName || 'resume.pdf').trim() || 'resume.pdf';
  const ascii = name.replace(/[^\w.\- ]/g, '_');
  // encodeURIComponent leaves ' ( ) * alone, but RFC 5987 doesn't allow them (and ' is the
  // ext-value delimiter), so escape those too.
  const encoded = encodeURIComponent(name)
    .replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `inline; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

// PUT /applications/:id/resume: upload or replace the applicant's resume PDF.
async function uploadResume(req, res) {
  try {
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.userId !== req.user.uuid) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this application',
      });
    }

    if (application.submissionStatus === 'submitted') {
      return res.status(403).json({
        success: false,
        message: 'You cannot update a submitted application',
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file was uploaded.' });
    }

    if (!looksLikePdf(req.file.buffer)) {
      return res.status(400).json({ success: false, message: 'Resume must be a PDF.' });
    }

    const now = new Date();
    const originalName = req.file.originalname || 'resume.pdf';

    await ResumeFile.findOneAndUpdate(
      { applicationId: application._id },
      {
        applicationId: application._id,
        userId: application.userId,
        data: req.file.buffer,
        mimetype: 'application/pdf',
        size: req.file.size,
        originalName,
      },
      {
        upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true,
      },
    );

    const updatedApp = await InternshipApplication.findByIdAndUpdate(
      application._id,
      {
        resume: { originalName, size: req.file.size, uploadedAt: now },
        lastModifiedAt: now,
      },
      { new: true, runValidators: true },
    ).select(UPDATE_APPLICATION_RESPONSE_EXCLUDED_FIELDS);

    return res.status(200).json({
      success: true,
      data: updatedApp,
      message: 'Resume uploaded successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message,
    });
  }
}

// GET /applications/:id/resume: stream the resume PDF to someone allowed to see the application.
async function getResume(req, res) {
  try {
    const application = await InternshipApplication.findById(req.params.id)
      .select('userId firstChoiceCommittee secondChoiceCommittee thirdChoiceCommittee');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (!(await canViewResume(req.user, application))) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this resume',
      });
    }

    const file = await ResumeFile.findOne({ applicationId: application._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'No resume uploaded' });
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': String(file.data.length),
      'Content-Disposition': contentDisposition(file.originalName),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.status(200).send(file.data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching resume',
      error: error.message,
    });
  }
}

module.exports = {
  uploadResume,
  getResume,
  looksLikePdf,
  contentDisposition,
};
