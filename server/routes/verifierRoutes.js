import express from 'express'
import {
  getVerifierCertificates,
  getVerifierCertificateById,
  updateCertificateStatus,
} from '../controllers/verifierController.js'
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateUser)
router.use(authorizeRoles('verifier'))

router.get('/certificates', getVerifierCertificates)

router.get('/certificates/:id', getVerifierCertificateById)

router.put('/certificates/:id', updateCertificateStatus)

export default router