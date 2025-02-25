const express = require("express");
const router = express.Router();
const UserProgress = require("../Model/EducationSchema"); 

router.get("/leaderboard", async (req, res) => {
  try {
    const users = await UserProgress.find()
      .sort({ overallScore: -1 }) 
      .select("username overallScore userId");

    res.json(users);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
