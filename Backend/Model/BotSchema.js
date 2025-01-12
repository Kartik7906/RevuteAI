const mongoose = require("mongoose");

const botSchema = new mongoose.Schema({
  userId: String,
  sessionId: String,
  emotionData: String,
  transcribedText: String,
  videoPath: String,
  wpm: Number,
  sentimentData: String,
  time: Date,
  grammar: Number,
  negotiation: Number,
  confidence: Number,
  recommendation: String,
  audioPath: String,
  accuracy: Number,
  fluency: Number,
  completeness: Number,
});

const Bot = mongoose.model("Bot", botSchema);
