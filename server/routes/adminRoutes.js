import express from 'express'
import {
  getAllUsers,
  getAllVerifierRequests,
  getAllCertificates,
  updateVerifierRequestStatus,
  deleteUser,
  deleteCertificate,
  deleteVerifier,
  toggleUserTrusted,
  toggleTrustedVerifier,
} from '../controllers/adminController.js'
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateUser)
router.use(authorizeRoles('admin'))

router.get('/users', getAllUsers)

router.get('/verifier-requests', getAllVerifierRequests)

router.get('/certificates', getAllCertificates)

router.put('/verifier-requests/:id', updateVerifierRequestStatus)

router.delete('/users/:id', deleteUser)

router.delete('/certificates/:id', deleteCertificate)

router.delete('/verifier-requests/:id', deleteVerifier)

router.put('/users/:id/trust', toggleUserTrusted)

router.patch('/verifiers/:id/trusted', toggleTrustedVerifier)

export default router
