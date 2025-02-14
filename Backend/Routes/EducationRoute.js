// EducationRoute.js
const express = require("express");
const router = express.Router();
const UserProgress = require("../Model/EducationSchema");
const modulesData = require("../Model/modulesData");

// Utility function to recalc overall progress in % based on completed topics vs total topics
const recalcProgress = (userProgress) => {
  let totalTopics = 0;
  let completedTopics = 0;

  // We assume modulesData is the static definition of all modules/subItems/topics
  modulesData.forEach((mod) => {
    mod.subItems.forEach((sub) => {
      if (sub.topics) {
        totalTopics += sub.topics.length;
        const moduleProgress = userProgress.modules.find(
          (m) => m.moduleId === mod.id.toString()
        );
        if (moduleProgress) {
          const subProgress = moduleProgress.subItems.find(
            (s) => s.subItemName === sub.name
          );
          if (subProgress) {
            sub.topics.forEach((topic) => {
              const topicProgress = subProgress.topics.find(
                (t) => t.topicName === topic.name
              );
              if (topicProgress && topicProgress.completed) {
                completedTopics++;
              }
            });
          }
        }
      }
    });
  });

  return totalTopics > 0
    ? Math.floor((completedTopics / totalTopics) * 100)
    : 0;
};

// Get the user's entire progress document
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const progress = await UserProgress.findOne({ userId });
    if (!progress) {
      return res.json({ modules: [], progress: 0, overallScore: 0 });
    }
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching progress." });
  }
});

// Mark a topic as completed
router.post("/:userId/completeTopic", async (req, res) => {
  const { userId } = req.params;
  let { moduleId, subItemName, topicName, username } = req.body;
  moduleId = moduleId.toString();

  try {
    let userProgress = await UserProgress.findOne({ userId });
    // If user progress doc doesn't exist, create a new one
    if (!userProgress) {
      userProgress = new UserProgress({ userId, username, modules: [] });
    }

    let moduleProgress = userProgress.modules.find(
      (m) => m.moduleId === moduleId
    );
    if (!moduleProgress) {
      moduleProgress = {
        moduleId,
        completed: false,
        score: null,
        attempts: 0,
        lastAttemptDate: null,
        subItems: [],
      };
      userProgress.modules.push(moduleProgress);
    }

    let subItemProgress = moduleProgress.subItems.find(
      (s) => s.subItemName === subItemName
    );
    if (!subItemProgress) {
      subItemProgress = {
        subItemName,
        completed: false,
        topics: [],
      };
      moduleProgress.subItems.push(subItemProgress);
    }

    let topicProgress = subItemProgress.topics.find(
      (t) => t.topicName === topicName
    );
    if (!topicProgress) {
      topicProgress = { topicName, completed: false };
      subItemProgress.topics.push(topicProgress);
    }

    // Mark the topic as completed
    topicProgress.completed = true;

    // If all topics in subItem are complete, mark subItem as complete
    if (subItemProgress.topics.every((t) => t.completed)) {
      subItemProgress.completed = true;
    }

    // Recalculate progress
    userProgress.progress = recalcProgress(userProgress);
    await userProgress.save();
    res.json({ message: "Topic marked as completed", userProgress });
  } catch (err) {
    res.status(500).json({ error: "Server error while updating topic completion." });
  }
});

// Submit score for a test
router.post("/:userId/submitScore", async (req, res) => {
  const { userId } = req.params;
  let { moduleId, score, username } = req.body;
  moduleId = moduleId.toString();
  const PASS_THRESHOLD = 8;

  try {
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = new UserProgress({ userId, username, modules: [] });
    }

    // Identify the module for which the user is submitting a score
    let moduleProgress = userProgress.modules.find((m) => m.moduleId === moduleId);
    if (!moduleProgress) {
      moduleProgress = {
        moduleId,
        completed: false,
        score: null,
        attempts: 0,
        lastAttemptDate: null,
        subItems: [],
      };
      userProgress.modules.push(moduleProgress);
    }

    // Increase the global attempt count (just for display or overall tracking)
    userProgress.numberOfAttempts = (userProgress.numberOfAttempts || 0) + 1;

    // Check if a new day has started, reset attempts if lastAttemptDate != today
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const lastAttemptDate = moduleProgress.lastAttemptDate
      ? new Date(moduleProgress.lastAttemptDate).toISOString().slice(0, 10)
      : null;

    if (lastAttemptDate !== today) {
      // reset daily attempts
      moduleProgress.attempts = 0;
    }

    // If the user already has 3 attempts for today, block
    if (moduleProgress.attempts >= 3) {
      return res.status(400).json({
        error:
          "Test failed. You have reached maximum test attempts for today. Please try again tomorrow.",
        attempts: moduleProgress.attempts,
      });
    }

    // Increment attempts
    moduleProgress.attempts += 1;
    moduleProgress.lastAttemptDate = new Date();

    // Check pass/fail
    if (score >= PASS_THRESHOLD) {
      // PASS
      moduleProgress.score = score;
      moduleProgress.completed = true;

      // Recalculate the total (overallScore can be sum or average, here just sum)
      const totalScore = userProgress.modules.reduce((acc, mod) => {
        return acc + (mod.score !== null ? mod.score : 0);
      }, 0);
      userProgress.overallScore = totalScore;

      // Recalc progress
      userProgress.progress = recalcProgress(userProgress);

      await userProgress.save();
      return res.json({
        message: "Test passed successfully",
        userProgress,
        attempts: moduleProgress.attempts,
      });
    } else {
      // FAIL
      await userProgress.save();
      if (moduleProgress.attempts < 3) {
        return res.status(400).json({
          error: `Test failed. You have ${3 - moduleProgress.attempts} attempt(s) remaining today.`,
          attempts: moduleProgress.attempts,
        });
      } else {
        return res.status(400).json({
          error:
            "Test failed. You have reached maximum attempts for today. Please try again tomorrow.",
          attempts: moduleProgress.attempts,
        });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while submitting test score." });
  }
});

module.exports = router;
