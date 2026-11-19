const mongoose = require('mongoose');

const { Schema } = mongoose;

// The PDF bytes for an application's resume. Kept out of InternshipApplication so that listing
// applications never drags megabytes of file data along with it; the application only carries
// the `resume` metadata the UI needs to show what was uploaded.
const ResumeFileSchema = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'InternshipApplication',
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const ResumeFile = mongoose.model('ResumeFile', ResumeFileSchema);

module.exports = { ResumeFile };
