const mongoose = require('mongoose');
const { MIN_GRADUATION_YEAR } = require('../config/constants');

const { Schema } = mongoose;

const InternshipApplicationSchema = new Schema(
  {
    userId: {
      type: String,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      required: [true, 'University is required'],
      trim: true,
    },
    major: {
      type: String,
      required: [true, 'Major is required'],
      trim: true,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: [MIN_GRADUATION_YEAR, `Graduation year must be ${MIN_GRADUATION_YEAR} or later`],
    },
    committee: {
      type: String,
      required: [true, 'Committee is required'],
      trim: true,
      index: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    responses: [{
      questionKey: {
        type: String,
        required: true,
        trim: true,
      },
      question: {
        type: String,
        required: true,
        trim: true,
      },
      answer: {
        type: String,
        required: true,
        trim: true,
      },
    }],
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'accepted', 'rejected'],
      default: 'pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes
InternshipApplicationSchema.index({ userId: 1 });
InternshipApplicationSchema.index({ committee: 1 });
InternshipApplicationSchema.index({ status: 1 });
InternshipApplicationSchema.index({ appliedAt: -1 });
InternshipApplicationSchema.index({ userId: 1, committee: 1 });
// Compound index for user+committee queries

const InternshipApplication = mongoose.model(
  'InternshipApplication',
  InternshipApplicationSchema,
);

module.exports = { InternshipApplication };
