const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../Model/UserSchema')
const Admin = require('../Model/AdminSchema')
const dotenv = require('dotenv')
dotenv.config()

router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' })
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' })
  }
  try {
    let existingUser = await User.findOne({ email })
    if (!existingUser) {
      existingUser = await Admin.findOne({ email })
    }
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    let finalUsername = username
    let finalRole = 'user'
    if (username.includes('_')) {
      const parts = username.split('_')
      if (parts.length >= 2) {
        const productId = parts[parts.length - 1].trim()
        const namePart = parts.slice(0, parts.length - 1).join('_').trim()
        if (process.env.ADMIN_PRODUCT_ID && productId === process.env.ADMIN_PRODUCT_ID.trim()) {
          finalUsername = namePart
          finalRole = 'admin'
        }
      }
    }
    if (finalRole === 'admin') {
      const admin = new Admin({
        username: finalUsername,
        email,
        password: hashedPassword
      })
      await admin.save()
      return res.status(201).json({ message: 'Admin registered successfully' })
    } else {
      const user = new User({
        username: finalUsername,
        email,
        password: hashedPassword,
        role: finalRole
      })
      await user.save()
      return res.status(201).json({ message: 'User registered successfully' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  let user = await User.findOne({ email })
  let userType = 'user'
  if (!user) {
    user = await Admin.findOne({ email })
    userType = 'admin'
  }
  if (!user) {
    return res.status(400).json({ message: 'User does not exist' })
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: 'Invalid credentials' })
  }
  const payload = { user: { id: user._id, role: userType } }
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
  res.status(200).json({
    message: 'User logged in successfully',
    token,
    userId: user._id,
    username: user.username,
    role: userType
  })
})

module.exports = router
