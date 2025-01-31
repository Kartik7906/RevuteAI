const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");

const router = express.Router();
const { Schema } = mongoose;

// ----- Mongoose Schema -----
const ReportSchema = new Schema({
  userId: { type: String, required: true },
  screenshot: {
    data: Buffer,
    contentType: String
  },
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model("Report", ReportSchema);

// ----- Multer Setup -----
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ----- Body Parser -----
router.use(bodyParser.json({ limit: "100mb" }));
router.use(bodyParser.urlencoded({ extended: true }));

// ====== POST: Save Screenshot ======
router.post("/save-screenshot", upload.single("screenshot"), async (req, res) => {
  try {
    const { userId } = req.body;

    // Check for userId in request body
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if file (screenshot) was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Screenshot file is missing" });
    }

    // Create a new report document
    const newReport = new Report({
      userId: userId,
      screenshot: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    // Save to MongoDB
    await newReport.save();

    return res.status(200).json({
      message: "Screenshot saved successfully",
      reportId: newReport._id
    });
  } catch (error) {
    console.error("Error saving screenshot:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while saving the screenshot" });
  }
});


// ====== GET: Fetch All Reports by userId ======
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const reports = await Report.find({ userId }).sort({ createdAt: -1 });

    // If you want an empty array instead of a 404, remove this check.
    if (!reports.length) {
      return res.status(404).json({ error: "No reports found for this user" });
    }

    /**
     * Your ListedReport code does:
     *   const data = await response.json();
     *   setReports(data.reports);
     *
     * So we must return { reports: [...] }.
     * Also, your code references report.reportData.title — but you have no
     * 'reportData' in your schema. We'll add placeholder data so it won't break.
     */
    const transformed = reports.map((r) => ({
      _id: r._id,
      userId: r.userId,
      createdAt: r.createdAt,
      // Placeholder "reportData" so you can call report.reportData.title
      reportData: { title: "Placeholder Title" },
      // If you ever store real transcript data, add it here
      transcript: "No transcript (placeholder)",
    }));

    return res.status(200).json({ reports: transformed });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching reports" });
  }
});

// Example route code in reportroute.js
router.get("/:userId/:reportId", async (req, res) => {
  try {
    const { userId, reportId } = req.params;
    const report = await Report.findOne({ _id: reportId, userId });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Important: Set the content type to the actual MIME type of the image
    // e.g., "image/png" or "image/jpeg"
    res.set("Content-Type", report.screenshot.contentType);

    // Send the binary data (Buffer) for the image
    return res.send(report.screenshot.data);
  } catch (error) {
    console.error("Error fetching the report:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the report" });
  }
});


module.exports = router;
