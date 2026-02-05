const mongoose = require('mongoose');
const { MIN_GRADUATION_YEAR } = require('../config/constants');

const { Schema } = mongoose;

const InternshipApplicationSchema = new Schema(
  {
    // User information
    userId: {
      type: String,
      required: true,
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
      match: [/^\S+@(ucla\.edu|g\.ucla\.edu)$/, 'Please provide a valid UCLA email address (ending with @ucla.edu or @g.ucla.edu)'],
    },
    phone: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      required: [true, 'University is required'],
      default: 'UCLA',
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
    resumeUrl: {
      type: String,
      trim: true,
    },
    coverLetter: {
      type: String,
      trim: true,
    },

    // Committee choices and responses
    firstChoiceCommittee: {
      type: mongoose.Types.ObjectId,
      ref: 'Committee',
      required: [true, 'You must apply to at least one committee'],
    },
    secondChoiceCommittee: {
      type: mongoose.Types.ObjectId,
      ref: 'Committee',
    },
    thirdChoiceCommittee: {
      type: mongoose.Types.ObjectId,
      ref: 'Committee',
    },
    firstChoiceResponses: [{
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
    secondChoiceResponses: [{
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
    thirdChoiceResponses: [{
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
    firstChoiceStatus: {
      type: String,
      enum: ['pending', 'reviewing', 'interview_scheduled', 'accepted', 'rejected'],
      default: 'pending',
    },
    secondChoiceStatus: {
      type: String,
      enum: ['pending', 'reviewing', 'interview_scheduled', 'accepted', 'rejected'],
      default: 'pending',
    },
    thirdChoiceStatus: {
      type: String,
      enum: ['pending', 'reviewing', 'interview_scheduled', 'accepted', 'rejected'],
      default: 'pending',
    },

    // Metadata
    submittedAt: {
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

// Pre-save hook to ensure unique committee choices
InternshipApplicationSchema.pre('save', function (next) {
  const choices = [
    this.firstChoiceCommittee,
    this.secondChoiceCommittee,
    this.thirdChoiceCommittee,
  ].filter(Boolean);

  const committees = choices.map((id) => id.toString());

  const originalCount = committees.length;
  const uniqueCount = new Set(committees).size;

  if (originalCount !== uniqueCount) {
    return next(new Error('You cannot select the same committee twice'));
  }

  return next();
});

// Create indexes
InternshipApplicationSchema.index({ userId: 1 });
InternshipApplicationSchema.index({ firstChoiceCommittee: 1 });
InternshipApplicationSchema.index({ secondChoiceCommittee: 1 });
InternshipApplicationSchema.index({ thirdChoiceCommittee: 1 });
InternshipApplicationSchema.index({ submittedAt: -1 });

// Compound index queries
InternshipApplicationSchema.index({ userId: 1, submittedAt: -1 });
InternshipApplicationSchema.index({ firstChoiceCommittee: 1, firstChoiceStatus: 1 });
InternshipApplicationSchema.index({ secondChoiceCommittee: 1, secondChoiceStatus: 1 });
InternshipApplicationSchema.index({ thirdChoiceCommittee: 1, thirdChoiceStatus: 1 });

const InternshipApplication = mongoose.model(
  'InternshipApplication',
  InternshipApplicationSchema,
);

module.exports = { InternshipApplication };
