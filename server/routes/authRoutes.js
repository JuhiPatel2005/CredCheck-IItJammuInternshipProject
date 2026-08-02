import express from 'express'
import {
  googleLogin,
  getMe,
  getProfile,
  updateProfile,
  registerVerifier,
  resendVerifierOtp,
  verifyVerifierOtp,
  sendVerifierLoginOtp,
  verifyVerifierLoginOtp,
  resendVerifierLoginOtp,
  loginAdmin,
  sendAdminOtp,
  resendAdminOtp,
  verifyAdminOtp,
} from '../controllers/authController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/google', googleLogin)
router.get('/me', authenticateUser, getMe)
router.get('/profile', authenticateUser, getProfile)
router.put('/profile', authenticateUser, updateProfile)
router.post('/verifier/register', registerVerifier)
router.post('/verifier/register/resend-otp', resendVerifierOtp)
router.post('/verifier/register/verify-otp', verifyVerifierOtp)
router.post('/verifier/send-otp', sendVerifierLoginOtp)
router.post('/verifier/verify-otp', verifyVerifierLoginOtp)
router.post('/verifier/resend-otp', resendVerifierLoginOtp)
router.post('/admin/login', loginAdmin)
router.post('/admin/send-otp', sendAdminOtp)
router.post('/admin/resend-otp', resendAdminOtp)
router.post('/admin/verify-otp', verifyAdminOtp)

export default router
