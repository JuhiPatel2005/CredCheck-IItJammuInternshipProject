import express from 'express'
import { createReport, getAllReports, resolveReport, deleteReport } from '../controllers/reportController.js'
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', createReport)

router.use(authenticateUser)
router.use(authorizeRoles('admin'))

router.get('/', getAllReports)

router.put('/:id/resolve', resolveReport)

router.delete('/:id', deleteReport)

export default router