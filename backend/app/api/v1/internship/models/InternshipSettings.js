const mongoose = require('mongoose');

const { Schema } = mongoose;

function computeDefaultCycleLabel(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  return `${year}-${year + 1}`;
}

// Singleton collection: exactly one document tracks the admin-controlled
// "current" application cycle. Applications stamp this value at creation
// time so archiving/advancing the cycle can bulk-select "everything in the
// outgoing cycle" without depending on wall-clock date math.
const InternshipSettingsSchema = new Schema(
  {
    currentApplicationCycle: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const InternshipSettings = mongoose.model('InternshipSettings', InternshipSettingsSchema);

// Fixed _id so concurrent upserts race on Mongo's unique _id index instead of
// on an unconstrained {} filter, which could otherwise create duplicate
// singleton documents (and make "current cycle" reads/writes nondeterministic).
const SETTINGS_ID = new mongoose.Types.ObjectId('000000000000000000000001');

async function getCurrentCycle() {
  const settings = await InternshipSettings.findOneAndUpdate(
    { _id: SETTINGS_ID },
    { $setOnInsert: { currentApplicationCycle: computeDefaultCycleLabel() } },
    { new: true, upsert: true },
  );
  return settings.currentApplicationCycle;
}

async function setCurrentCycle(newCycle) {
  const settings = await InternshipSettings.findOneAndUpdate(
    { _id: SETTINGS_ID },
    { $set: { currentApplicationCycle: newCycle } },
    { new: true, upsert: true },
  );
  return settings.currentApplicationCycle;
}

module.exports = {
  InternshipSettings,
  computeDefaultCycleLabel,
  getCurrentCycle,
  setCurrentCycle,
};
