import express from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { body, validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { generateToken } from '../middleware/auth.js'

const router = express.Router()

// Register (create user)
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, name } = req.body

    try {
      const existing = await User.findOne({ email })
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' })
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const user = await User.create({ email, passwordHash, name })
      const token = generateToken(user)

      return res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          settings: user.settings,
        },
      })
    } catch (err) {
      console.error('Register error', err)
      return res.status(500).json({ error: 'Server error' })
    }
  }
)

// Login
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const valid = await user.comparePassword(password)
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const token = generateToken(user)
      return res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          settings: user.settings,
        },
      })
    } catch (err) {
      console.error('Login error', err)
      return res.status(500).json({ error: 'Server error' })
    }
  }
)

// Forgot password - generate reset token (here we just log it, you can plug in email)
router.post(
  '/forgot-password',
  [body('email').isEmail()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email } = req.body

    try {
      const user = await User.findOne({ email })
      if (!user) {
        // Do not reveal whether email exists
        return res.json({ message: 'If that email exists, a reset link has been generated.' })
      }

      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

      user.resetPasswordToken = token
      user.resetPasswordExpires = expires
      await user.save()

      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(
        email
      )}`

      console.log('Password reset link (send via email in production):', resetUrl)

      return res.json({ message: 'If that email exists, a reset link has been generated.' })
    } catch (err) {
      console.error('Forgot password error', err)
      return res.status(500).json({ error: 'Server error' })
    }
  }
)

// Reset password
router.post(
  '/reset-password',
  [
    body('email').isEmail(),
    body('token').notEmpty(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, token, password } = req.body

    try {
      const user = await User.findOne({
        email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      })

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' })
      }

      user.passwordHash = await bcrypt.hash(password, 10)
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()

      return res.json({ message: 'Password has been reset successfully.' })
    } catch (err) {
      console.error('Reset password error', err)
      return res.status(500).json({ error: 'Server error' })
    }
  }
)

export default router


