import express from 'express'
import { getProfile, updateProfile } from '../controllers/studentController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateUser)

router.get('/profile', getProfile)

router.put('/profile', updateProfile)

export default router