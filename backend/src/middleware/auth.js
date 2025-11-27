import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    const user = await User.findById(payload.sub).select('-passwordHash')
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    req.user = user
    next()
  } catch (err) {
    console.error('JWT error', err)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'dev-secret'
  const payload = {
    sub: user._id.toString(),
    email: user.email,
  }
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}


