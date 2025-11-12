import mongoose, { Document, Schema } from 'mongoose';
import { MIN_GRADUATION_YEAR } from '../config/constants';

// Interface for individual question responses
export interface IQuestionResponse {
  questionKey: string;
  question: string;
  answer: string;
}

export interface IInternshipApplication extends Document {
  // User identification (to key with existing member portal)
  userId?: string; // UUID from member portal
  
  // Basic information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  university: string;
  major: string;
  graduationYear: number;
  
  // Application details
  committee: string; // Committee applying to
  resumeUrl?: string;
  coverLetter?: string;
  
  // Application responses to prompts
  responses: IQuestionResponse[];
  
  // Status tracking
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  appliedAt: Date;
  updatedAt: Date;
}

const InternshipApplicationSchema = new Schema<IInternshipApplication>(
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
  }
);

// Create indexes
InternshipApplicationSchema.index({ userId: 1 });
InternshipApplicationSchema.index({ committee: 1 });
InternshipApplicationSchema.index({ status: 1 });
InternshipApplicationSchema.index({ appliedAt: -1 });
InternshipApplicationSchema.index({ userId: 1, committee: 1 }); // Compound index for user+committee queries

export const InternshipApplication = mongoose.model<IInternshipApplication>(
  'InternshipApplication',
  InternshipApplicationSchema
);
