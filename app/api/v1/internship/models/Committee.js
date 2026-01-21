const mongoose = require('mongoose');

const { Schema } = mongoose;

const CustomQuestionSchema = new Schema({
  questionKey: { type: String, required: true },
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['short_text', 'long_text', 'multiple_choice'],
    required: true,
  },
  required: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  choices: { type: [String] },
}, { _id: false });

const CommitteeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    subcommittees: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    internLimit: {
      type: Number,
      required: false,
    },
    applicationDeadline: {
      type: Date,
      required: false,
    },
    customQuestions: {
      type: [CustomQuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

CommitteeSchema.index({ name: 1 });
CommitteeSchema.index({ isActive: 1 });

const Committee = mongoose.model('Committee', CommitteeSchema);
module.exports = Committee;
