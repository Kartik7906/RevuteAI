const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const router = express.Router();
const { Schema } = mongoose;

const ReportSchema = new Schema({
  userId: { type: String, required: true },
  reportData: { type: Object, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", ReportSchema);

router.use(bodyParser.json({ limit: "100mb" })); 

router.post("/saveReport", async (req, res) => {
  const { userId, reportData } = req.body; 

  if (!userId || !reportData) {
    return res.status(400).json({ error: "User ID and report data are required." });
  }

  try {
    const report = new Report({
      userId,
      reportData, // Directly store JSON data
    });

    await report.save();
    res.status(200).json({ message: "Report saved successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save the report." });
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const reports = await Report.find({ userId }); 
    res.status(200).json({ reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});


module.exports = router;
