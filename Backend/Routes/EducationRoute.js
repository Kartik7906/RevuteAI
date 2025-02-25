const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const UserProgress = require("../Model/EducationSchema")
const modulesData = require("../Model/modulesData")

function recalcProgress(userProgress) {
  let totalUnits = 0
  let completedUnits = 0
  modulesData.forEach((mod) => {
    if (mod.subItems && mod.subItems.length > 0) {
      mod.subItems.forEach((sub) => {
        if (sub.topics && sub.topics.length > 0) {
          totalUnits += sub.topics.length
          const mp = userProgress.modules.find((m) => m.moduleId === mod.id.toString())
          if (mp) {
            const sp = mp.subItems.find((s) => s.subItemName === sub.name)
            if (sp) {
              sub.topics.forEach((t) => {
                const tp = sp.topics.find((x) => x.topicName === t.name)
                if (tp && tp.completed) completedUnits++
              })
            }
          }
        } else {
          totalUnits += 1
          const mp = userProgress.modules.find((m) => m.moduleId === mod.id.toString())
          if (mp) {
            const sp = mp.subItems.find((s) => s.subItemName === sub.name)
            if (sp && sp.completed) completedUnits++
          }
        }
      })
    } else {
      totalUnits += 1
      const mp = userProgress.modules.find((m) => m.moduleId === mod.id.toString())
      if (mp && mp.completed) completedUnits++
    }
  })
  if (totalUnits === 0) return 0
  return Math.floor((completedUnits / totalUnits) * 100)
}

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const _id = new mongoose.Types.ObjectId(userId)
    const progressData = await UserProgress.findOne({ userId: _id })
    if (!progressData) return res.json({ modules: [], progress: 0, overallScore: 0 })
    res.json(progressData)
  } catch (err) {
    res.status(500).json({ error: "Server error fetching progress." })
  }
})

router.post("/:userId/completeTopic", async (req, res) => {
  try {
    const { userId } = req.params
    const { moduleId, subItemName, topicName, username } = req.body
    const _id = new mongoose.Types.ObjectId(userId)
    let userProgress = await UserProgress.findOne({ userId: _id })
    if (!userProgress) userProgress = new UserProgress({ userId: _id, username, modules: [] })
    let mp = userProgress.modules.find((m) => m.moduleId === moduleId)
    if (!mp) {
      mp = { moduleId, completed: false, subItems: [] }
      userProgress.modules.push(mp)
    }
    let sp = mp.subItems.find((s) => s.subItemName === subItemName)
    if (!sp) {
      sp = { subItemName, completed: false, attempts: 0, lastAttemptDate: null, score: null, topics: [] }
      mp.subItems.push(sp)
    }
    let tp = sp.topics.find((t) => t.topicName === topicName)
    if (!tp) {
      tp = { topicName, completed: false }
      sp.topics.push(tp)
    }
    tp.completed = true
    if (sp.topics.every((t) => t.completed)) sp.completed = true
    userProgress.progress = recalcProgress(userProgress)
    await userProgress.save()
    res.json({ message: "Topic marked as completed", userProgress })
  } catch (err) {
    res.status(500).json({ error: "Server error updating topic completion." })
  }
})

router.post("/:userId/submitScore", async (req, res) => {
  try {
    const { userId } = req.params
    const { moduleId, subItemName, userAnswers, username } = req.body
    if (!Array.isArray(userAnswers)) return res.status(400).json({ error: "Invalid answers format" })
    const defModule = modulesData.find((m) => m.id.toString() === moduleId.toString())
    if (!defModule) return res.status(400).json({ error: "Module not found" })
    const defSubItem = defModule.subItems.find((s) => s.name === subItemName)
    if (!defSubItem || !defSubItem.content?.quiz) return res.status(400).json({ error: "Sub-item not found or no quiz available" })
    let computedScore = 0
    const questions = defSubItem.content.quiz
    const totalQuestions = questions.length
    const isSpecial = subItemName.toLowerCase().includes("grammar test") || subItemName.toLowerCase().includes("communication test")
    if (isSpecial) {
      computedScore = totalQuestions
    } else {
      questions.forEach((q, index) => {
        const ua = (userAnswers[index] || "").toString().trim().toLowerCase()
        if (q.type === "mcq") {
          const ca = q.answer?.toString().toLowerCase()
          if (ua === ca) computedScore++
        } else if (q.type === "qna") {
          if (ua) computedScore++
        }
      })
    }
    let passed = false
    if (isSpecial) {
      passed = true
    } else {
      if (questions[0]?.type === "mcq") {
        const passThreshold = Math.ceil(totalQuestions * 0.8)
        passed = computedScore >= passThreshold
      } else {
        passed = computedScore === totalQuestions
      }
    }
    const _id = new mongoose.Types.ObjectId(userId)
    let userProgress = await UserProgress.findOne({ userId: _id })
    if (!userProgress) userProgress = new UserProgress({ userId: _id, username, modules: [] })
    let mp = userProgress.modules.find((m) => m.moduleId === moduleId)
    if (!mp) {
      mp = { moduleId, completed: false, subItems: [] }
      userProgress.modules.push(mp)
    }
    let sp = mp.subItems.find((s) => s.subItemName === subItemName)
    if (!sp) {
      sp = { subItemName, completed: false, attempts: 0, lastAttemptDate: null, score: null, topics: [] }
      mp.subItems.push(sp)
    }
    const today = new Date().toISOString().slice(0, 10)
    const lastAttempt = sp.lastAttemptDate ? sp.lastAttemptDate.toISOString().slice(0, 10) : null
    if (lastAttempt !== today) sp.attempts = 0
    if (sp.attempts >= 3 && !passed) {
      return res.status(400).json({ error: "Test locked for today. Please try again tomorrow.", passed: false, attempts: sp.attempts })
    }
    sp.attempts++
    sp.lastAttemptDate = new Date()
    sp.score = computedScore
    if (passed) sp.completed = true
    userProgress.progress = recalcProgress(userProgress)
    await userProgress.save()
    if (passed) {
      return res.json({ message: "Test passed", score: computedScore, passed: true, attempts: sp.attempts, userProgress })
    } else {
      const attemptsRemaining = 3 - sp.attempts
      return res.status(400).json({ error: `Test failed. ${attemptsRemaining} attempt(s) remaining today.`, passed: false, attempts: sp.attempts })
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error submitting test score." })
  }
})

module.exports = router
