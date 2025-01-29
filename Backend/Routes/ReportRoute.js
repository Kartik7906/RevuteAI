const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const router = express.Router();
const { Schema } = mongoose;

const ReportSchema = new Schema({
  userId: { type: String, required: true },
  reportData: { type: Object, required: true }, 
  transcript: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", ReportSchema);

router.use(bodyParser.json({ limit: "100mb" })); 

// restapi to save report
router.post("/saveReport", async (req, res) => {
  const { userId, reportData, transcript } = req.body; 

  if (!userId || !reportData || !transcript) {
    return res.status(400).json({ error: "User ID and report data are required." });
  }

  try {
    const report = new Report({
      userId,
      reportData,
      transcript,
    });

    await report.save();
    res.status(200).json({ message: "Report saved successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save the report." });
  }
});


// restapi to fetch reports
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

// restapi to fetch specific report
router.get("/:userId/:reportId", async (req, res) => {
  try {
      const { userId, reportId } = req.params;

      if (!reportId.match(/^[0-9a-fA-F]{24}$/)) {
          return res.status(400).json({ error: "Invalid report ID format" });
      }

      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
          return res.status(400).json({ error: "Invalid user ID format" });
      }

      const report = await Report.findOne({ _id: reportId, userId });

      if (!report) {
          return res.status(404).json({ error: "Report not found for this user" });
      }

      res.status(200).json(report);
  } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
