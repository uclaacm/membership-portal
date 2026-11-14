const multer = require('multer');

// Held in memory and written to Mongo as a single document, so the cap has to stay well under
// Mongo's 16 MB document limit. 5 MB is far more than any one-page resume needs.
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_FIELD = 'resume';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 1 },
  // Browsers send filenames as raw UTF-8; busboy's latin1 default turns "Résumé.pdf" into mojibake.
  defParamCharset: 'utf8',
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      const err = new Error('Resume must be a PDF.');
      err.code = 'INVALID_RESUME_TYPE';
      cb(err);
      return;
    }
    cb(null, true);
  },
}).single(RESUME_FIELD);

// Runs multer and turns its errors into the internship API's { success, message } shape.
// Without this, an oversized file surfaces as an opaque 500.
function resumeUpload(req, res, next) {
  upload(req, res, (err) => {
    if (!err) return next();

    let message = 'Could not read the uploaded resume.';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `Resume is too large. The limit is ${MAX_RESUME_BYTES / (1024 * 1024)} MB.`;
    } else if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Upload exactly one file in the "${RESUME_FIELD}" field.`;
    } else if (err.code === 'INVALID_RESUME_TYPE') {
      ({ message } = err);
    }

    return res.status(400).json({ success: false, message });
  });
}

module.exports = { resumeUpload, MAX_RESUME_BYTES, RESUME_FIELD };
