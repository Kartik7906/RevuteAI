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
    const leaderboard = await UserProgress.aggregate([
      {
        $addFields: {
          topicsCompleted: {
            $sum: {
              $map: {
                input: "$modules",
                as: "module",
                in: {
                  $sum: {
                    $map: {
                      input: "$$module.subItems",
                      as: "subItem",
                      in: {
                        $size: {
                          $filter: {
                            input: "$$subItem.topics",
                            as: "topic",
                            cond: { $eq: ["$$topic.completed", true] }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $sort: { overallScore: -1, topicsCompleted: -1 }
      }
    ]);

    // Assign rank based on sorted order
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/fetchUser/moduleReports/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      return res.status(404).json({ message: "User not found" });
    }
    // Iterate through modules, subItems and topics to collect completed topics
    let completedTopics = [];
    userProgress.modules.forEach(module => {
      module.subItems.forEach(subItem => {
        subItem.topics.forEach(topic => {
          if (topic.completed) {
            completedTopics.push({
              topicName: topic.topicName,
              // Generate an ID based on module and topic info (adjust as needed)
              topicId: `${module.moduleId}-${subItem.subItemName}-${topic.topicName}`
            });
          }
        });
      });
    });
    res.json(completedTopics);
  } catch (error) {
    console.error("Error fetching module reports:", error);
    res.status(500).json({ message: "Server error" });
  }
});





module.exports = router;