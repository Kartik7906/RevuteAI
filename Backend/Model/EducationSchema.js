// EducationSchema.js
const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  topicName: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const subItemSchema = new mongoose.Schema({
  subItemName: { type: String, required: true },
  completed: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  lastAttemptDate: { type: Date },
  score: { type: Number, default: null },
  topics: [topicSchema]
});

const moduleSchema = new mongoose.Schema({
  moduleId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  subItems: [subItemSchema]
});

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  overallScore: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  modules: [moduleSchema]
});

module.exports = mongoose.model("UserProgress", userProgressSchema);
