// IMPORT COMMITTEE SCHEMA for committee choices

const mongoose = require('mongoose');
const { MIN_GRADUATION_YEAR } = require('../config/constants');

const { Schema } = mongoose;

// design doc https://www.notion.so/Demo-design-doc-2a91b79eef7280539239e6bddd279459
const InternshipApplicationSchema = new Schema(
  {
    userId: {
      type: String, // UUID from PostgreSQL
      required: true,
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
      // Must use @g.ucla.edu email
      match: [/^\S+@g.ucla.edu$/, 'Please provide a valid UCLA-affiliated email address'],
    },
    // Phone numbers not currently being asked for, but will keep for future addition
    phone: {
      type: String,
      trim: true,
    },
    // We don't need a University property?
    // university: {
    //   type: String,
    //   required: [true, 'University is required'],
    //   trim: true,
    // },
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

    // Committee Choices (ranked preference)
    firstChoice: {
      type: Schema.Types.ObjectId,
      ref: 'Committee',
      required: true,
    },
    // optional
    secondChoice: {
      type: Schema.Types.ObjectId,
      ref: 'Committee',
    },
    // optional
    thirdChoice: {
      type: Schema.Types.ObjectId,
      ref: 'Committee',
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

    // Status from each of the committee choices
    /*
    Key:
      Pending: Application submitted, but not looked at.
      Reviewing: Deciding yes/no to an interview.
      Interviewing: Set to interview/interviewing/has interviewed, but no final decision.
      Accepted: Committee says yes, but DOES NOT MEAN ACCEPTANCE EMAIL AUTO SENT OUT
      Rejected: Not offered position.
    */
    firstChoiceStatus: {
      type: String,
      enum: ['pending', 'reviewing', 'interviewing', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    secondChoiceStatus: {
      type: String,
      enum: ['pending', 'reviewing', 'interviewing', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    thirdChoiceStatus: {
      type: String,
      enum: ['pending', 'reviewing', 'interviewing', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
    lastModifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Duplicate committee choice validator
InternshipApplicationSchema.pre('save', function (next) {
  // Ensure no duplicate committees
  const committees = [this.firstChoice, this.secondChoice, this.thirdChoice].filter(Boolean);
  const uniqueCommittees = new Set(committees.map((c) => c.toString()));

  if (committees.length !== uniqueCommittees.size) {
    return next(new Error('Cannot select the same committee multiple times'));
  }

  this.lastModifiedAt = Date.now();
  next();
  // Linter wants a return, but not needed because we call next()
});

// Create indices
InternshipApplicationSchema.index({ userId: 1 });
InternshipApplicationSchema.index({ firstChoice: 1 });
InternshipApplicationSchema.index({ firstChoiceStatus: 1 });
InternshipApplicationSchema.index({ appliedAt: -1 });
InternshipApplicationSchema.index({ userId: 1, firstChoice: 1 });
// Compound index for user+committee queries

const InternshipApplication = mongoose.model(
  'InternshipApplication',
  InternshipApplicationSchema,
);

module.exports = { InternshipApplication };
