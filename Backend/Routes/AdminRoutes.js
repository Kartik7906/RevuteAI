// this is AdminRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../Model/UserSchema");
const UserProgress = require("../Model/EducationSchema");

router.get("/fetchUsers", async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Server error fetching users." });
    }
});


router.get("/fetchUser/leaderboard", async (req, res) => {
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