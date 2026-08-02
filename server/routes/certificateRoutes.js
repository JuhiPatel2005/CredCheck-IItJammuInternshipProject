import express from 'express'
import {
  createCertificate,
  getMyCertificates,
  getCertificateById,
  viewCertificateFile,
  downloadCertificateFile,
  deleteCertificate,
} from '../controllers/certificateController.js'
import { authenticateUser } from '../middleware/authMiddleware.js'
import upload from '../config/multer.js'

const router = express.Router()

router.use(authenticateUser)

router.post('/', upload.single('certificateFile'), createCertificate)

router.get('/', getMyCertificates)

router.get('/:id', getCertificateById)

router.get('/:id/file', viewCertificateFile)

router.get('/:id/file/download', downloadCertificateFile)

router.delete('/:id', deleteCertificate)

export default router