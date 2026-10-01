const mongoose = require('mongoose');

const { Schema } = mongoose;

// A picked deadline date ("YYYY-MM-DD") means the end of that day, Pacific time
function toEndOfDayPacific(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const utc = new Date(`${value}T23:59:59.999Z`);
  const asUTC = new Date(utc.toLocaleString('en-US', { timeZone: 'UTC' }));
  const asPacific = new Date(utc.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  return new Date(utc.getTime() + (asUTC - asPacific));
}

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
      set: toEndOfDayPacific,
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

CommitteeSchema.index({ isActive: 1 });

const Committee = mongoose.model('Committee', CommitteeSchema);
module.exports = { Committee };
