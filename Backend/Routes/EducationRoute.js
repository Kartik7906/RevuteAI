// module.js (Express Router)
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const UserProgress = require("../Model/EducationSchema");
const modulesData = require("../Model/modulesData");

function recalcProgress(userProgress) {
  let totalUnits = 0;
  let completedUnits = 0;
  modulesData.forEach((mod) => {
    if (!mod.subItems || mod.subItems.length === 0) {
      totalUnits += 1;
      const mp = userProgress.modules.find((m) => m.moduleId === mod.id.toString());
      if (mp && mp.completed) completedUnits++;
    } else {
      mod.subItems.forEach((sub) => {
        if (sub.topics && sub.topics.length > 0) {
          totalUnits += sub.topics.length;
          const mp = userProgress.modules.find((m) => m.moduleId === mod.id.toString());
          if (mp) {
            const sp = mp.subItems.find((s) => s.subItemName === sub.name);
            if (sp && sp.topics) {
              sub.topics.forEach((t) => {
                const tp = sp.topics.find((x) => x.topicName === t.name);
                if (tp && tp.completed) completedUnits++;
              });
            }
          }
        } else {
          totalUnits += 1;
          const mp = userProgress.modules.find((m) => m.moduleId === mod.id.toString());
          if (mp) {
            const sp = mp.subItems.find((s) => s.subItemName === sub.name);
            if (sp && sp.completed) completedUnits++;
          }
        }
      });
    }
  });
  return totalUnits > 0 ? Math.floor((completedUnits / totalUnits) * 100) : 0;
}

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const _id = new mongoose.Types.ObjectId(userId);
    const progressData = await UserProgress.findOne({ userId: _id });
    if (!progressData) return res.json({ modules: [], progress: 0, overallScore: 0 });
    res.json(progressData);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching progress." });
  }
});

router.post("/:userId/completeTopic", async (req, res) => {
  try {
    const { userId } = req.params;
    const { moduleId, subItemName, topicName, username } = req.body;
    const _id = new mongoose.Types.ObjectId(userId);
    let userProgress = await UserProgress.findOne({ userId: _id });
    if (!userProgress) userProgress = new UserProgress({ userId: _id, username, modules: [] });
    let moduleProgress = userProgress.modules.find((m) => m.moduleId === moduleId);
    if (!moduleProgress) {
      moduleProgress = { moduleId, completed: false, subItems: [] };
      userProgress.modules.push(moduleProgress);
    }
    let subItemProgress = moduleProgress.subItems.find((s) => s.subItemName === subItemName);
    if (!subItemProgress) {
      subItemProgress = { subItemName, completed: false, attempts: 0, lastAttemptDate: null, score: null, topics: [] };
      moduleProgress.subItems.push(subItemProgress);
    }
    let topicProgress = subItemProgress.topics.find((t) => t.topicName === topicName);
    if (!topicProgress) {
      topicProgress = { topicName, completed: false };
      subItemProgress.topics.push(topicProgress);
    }
    topicProgress.completed = true;
    if (subItemProgress.topics.every((t) => t.completed)) subItemProgress.completed = true;
    userProgress.progress = recalcProgress(userProgress);
    await userProgress.save();
    res.json({ message: "Topic marked as completed", userProgress });
  } catch (err) {
    res.status(500).json({ error: "Server error updating topic completion." });
  }
});

router.post("/:userId/submitScore", async (req, res) => {
  try {
    const { userId } = req.params;
    const { moduleId, subItemName, score, username } = req.body;
    const PASS_THRESHOLD = 8;
    const _id = new mongoose.Types.ObjectId(userId);
    let userProgress = await UserProgress.findOne({ userId: _id });
    if (!userProgress) userProgress = new UserProgress({ userId: _id, username, modules: [] });
    let moduleProgress = userProgress.modules.find((m) => m.moduleId === moduleId);
    if (!moduleProgress) {
      moduleProgress = { moduleId, completed: false, subItems: [] };
      userProgress.modules.push(moduleProgress);
    }
    let subItemProgress = moduleProgress.subItems.find((s) => s.subItemName === subItemName);
    if (!subItemProgress) {
      subItemProgress = { subItemName, completed: false, attempts: 0, lastAttemptDate: null, score: null, topics: [] };
      moduleProgress.subItems.push(subItemProgress);
    }
    if (subItemProgress.completed) return res.status(400).json({ error: "This test is already completed." });
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastAttemptStr = subItemProgress.lastAttemptDate ? new Date(subItemProgress.lastAttemptDate).toISOString().slice(0, 10) : null;
    if (lastAttemptStr !== todayStr) subItemProgress.attempts = 0;
    if (subItemProgress.attempts >= 3) {
      return res.status(400).json({ error: "You have reached maximum attempts for today.", attempts: subItemProgress.attempts });
    }
    subItemProgress.attempts += 1;
    subItemProgress.lastAttemptDate = new Date();
    if (score >= PASS_THRESHOLD) {
      subItemProgress.completed = true;
      subItemProgress.score = score;
      subItemProgress.attempts = 0;
      const defModule = modulesData.find((m) => m.id.toString() === moduleId);
      if (defModule && defModule.subItems) {
        const allSubItemsDone = defModule.subItems.every((x) => {
          const sp = moduleProgress.subItems.find((z) => z.subItemName === x.name);
          return sp && sp.completed;
        });
        moduleProgress.completed = allSubItemsDone;
      } else {
        moduleProgress.completed = true;
      }
      const allScoredSubItems = userProgress.modules.flatMap((m) => m.subItems.filter((s) => s.score !== null));
      if (allScoredSubItems.length > 0) {
        const total = allScoredSubItems.reduce((acc, s) => acc + s.score, 0);
        userProgress.overallScore = total / allScoredSubItems.length;
      } else {
        userProgress.overallScore = 0;
      }
      userProgress.progress = recalcProgress(userProgress);
      await userProgress.save();
      return res.json({ message: "Test passed", userProgress, attempts: subItemProgress.attempts });
    } else {
      await userProgress.save();
      if (subItemProgress.attempts < 3) {
        return res.status(400).json({
          error: `Test failed. You have ${3 - subItemProgress.attempts} attempt(s) remaining today.`,
          attempts: subItemProgress.attempts
        });
      } else {
        return res.status(400).json({
          error: "Test failed. You have reached maximum attempts for today.",
          attempts: subItemProgress.attempts
        });
      }
    }
  } catch (err) {
    res.status(500).json({ error: "Server error submitting test score." });
  }
});

module.exports = router;
