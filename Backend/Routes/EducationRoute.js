const express = require("express");
const router = express.Router();
const UserProgress = require("../Model/EducationSchema");

// Import modulesData from a file that exports your modules structure.
// (Ensure the module IDs, sub‑item names and topic names exactly match the frontend.)
const modulesData = require("../Model/modulesData");

// Helper function: Recalculate overall progress (percentage)
const recalcProgress = (userProgress) => {
  let totalTopics = 0;
  let completedTopics = 0;
  // Loop through the full modulesData (which is the source of truth for total topics)
  modulesData.forEach(mod => {
    mod.subItems.forEach(sub => {
      if (sub.topics) {
        totalTopics += sub.topics.length;
        // Find the corresponding module progress entry by moduleId
        const moduleProgress = userProgress.modules.find(m => m.moduleId === mod.id.toString());
        if (moduleProgress) {
          const subProgress = moduleProgress.subItems.find(s => s.subItemName === sub.name);
          if (subProgress) {
            sub.topics.forEach(topic => {
              const topicProgress = subProgress.topics.find(t => t.topicName === topic.name);
              if (topicProgress && topicProgress.completed) {
                completedTopics++;
              }
            });
          }
        }
      }
    });
  });
  return totalTopics > 0 ? Math.floor((completedTopics / totalTopics) * 100) : 0;
};

// GET user progress by userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const progress = await UserProgress.findOne({ userId });
    if (!progress) return res.json({ modules: [], progress: 0, overallScore: 0 });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching progress." });
  }
});

// POST endpoint to mark a topic as complete
router.post("/:userId/completeTopic", async (req, res) => {
  const { userId } = req.params;
  // Expecting moduleId, subItemName, topicName and (if needed) username in the body.
  let { moduleId, subItemName, topicName, username } = req.body;
  moduleId = moduleId.toString();

  try {
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      // If no progress exists yet, create a new document (username is required)
      userProgress = new UserProgress({ userId, username, modules: [] });
    }
    // Find or create the module progress entry
    let moduleProgress = userProgress.modules.find((m) => m.moduleId === moduleId);
    if (!moduleProgress) {
      moduleProgress = { moduleId, completed: false, score: null, subItems: [] };
      userProgress.modules.push(moduleProgress);
    }
    // Find or create the sub‑item progress entry
    let subItemProgress = moduleProgress.subItems.find((s) => s.subItemName === subItemName);
    if (!subItemProgress) {
      subItemProgress = { subItemName, completed: false, topics: [] };
      moduleProgress.subItems.push(subItemProgress);
    }
    // Find or create the topic progress entry
    let topicProgress = subItemProgress.topics.find((t) => t.topicName === topicName);
    if (!topicProgress) {
      topicProgress = { topicName, completed: false };
      subItemProgress.topics.push(topicProgress);
    }
    topicProgress.completed = true;
    // If all topics in the sub‑item are complete, mark the sub‑item complete
    const allCompleted = subItemProgress.topics.every((t) => t.completed);
    if (allCompleted) subItemProgress.completed = true;

    // Recalculate overall progress from the complete modulesData structure
    userProgress.progress = recalcProgress(userProgress);

    await userProgress.save();
    res.json({ message: "Topic marked as completed", userProgress });
  } catch (err) {
    res.status(500).json({ error: "Server error while updating topic completion." });
  }
});

// POST endpoint to submit a module quiz score
router.post("/:userId/submitScore", async (req, res) => {
  const { userId } = req.params;
  // Expecting moduleId, score, and username in the body.
  let { moduleId, score, username } = req.body;
  moduleId = moduleId.toString();

  try {
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = new UserProgress({ userId, username, modules: [] });
    }
    let moduleProgress = userProgress.modules.find((m) => m.moduleId === moduleId);
    if (!moduleProgress) {
      moduleProgress = { moduleId, completed: false, score: null, subItems: [] };
      userProgress.modules.push(moduleProgress);
    }
    if (moduleProgress.score !== null) {
      return res.status(400).json({ error: "Test already taken. No retakes allowed." });
    }
    moduleProgress.score = score;
    moduleProgress.completed = true;

    // For demonstration, overallScore is computed as the sum of module scores.
    const totalScore = userProgress.modules.reduce((acc, mod) => {
      return acc + (mod.score !== null ? mod.score : 0);
    }, 0);
    userProgress.overallScore = totalScore;

    // Also update the overall progress in case quiz completion affects progress.
    userProgress.progress = recalcProgress(userProgress);

    await userProgress.save();
    res.json({ message: "Score recorded successfully", userProgress });
  } catch (err) {
    res.status(500).json({ error: "Server error while submitting test score." });
  }
});

module.exports = router;
