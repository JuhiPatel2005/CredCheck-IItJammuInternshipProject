import express from 'express'
import { getPublicCertificate } from '../controllers/publicController.js'

const router = express.Router()

router.get('/certificate/:publicLinkId', getPublicCertificate)

export default router