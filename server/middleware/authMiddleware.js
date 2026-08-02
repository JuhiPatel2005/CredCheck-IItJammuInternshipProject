import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env') })

const JWT_SECRET = process.env.JWT_SECRET

export const authenticateUser = async (req, res, next) => {
  const authorization = req.headers.authorization
  const queryToken = req.query.token

  let token
  if (authorization && authorization.startsWith('Bearer ')) {
    token = authorization.split(' ')[1]
  } else if (queryToken) {
    token = queryToken
  } else {
    return res.status(401).json({ message: 'Authorization token missing' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' })
    }
    next()
  }
}
