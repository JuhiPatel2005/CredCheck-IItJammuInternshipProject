import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'
import Certificate from '../models/Certificate.js'
import User from '../models/User.js'
import {
  sendCertificateVerifiedEmail,
  sendCertificateRejectedEmail,
} from '../utils/emailService.js'

export const getVerifierCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ verifierEmail: req.user.email })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })

    res.json(certificates)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getVerifierCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('studentId', 'name email')

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' })
    }
    if (certificate.verifierEmail !== req.user.email) {
      return res.status(403).json({ message: 'Access denied' })
    }
    res.json(certificate)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const updateCertificateStatus = async (req, res) => {
  try {
    const { status, comments } = req.body
    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "verified" or "rejected"' })
    }

    const certificate = await Certificate.findById(req.params.id)

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' })
    }
    if (certificate.verifierEmail !== req.user.email) {
      return res.status(403).json({ message: 'Access denied' })
    }
    if (certificate.status !== 'pending') {
      return res.status(400).json({ message: 'Certificate has already been reviewed' })
    }
    const updateData = { status }
    if (comments !== undefined) {
      updateData.comments = comments
    }
    if (status === 'verified') {
      const publicLinkId = uuidv4()
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
      const qrDataUrl = await QRCode.toDataURL(`${clientUrl}/cert/${publicLinkId}`)

      updateData.publicLinkId = publicLinkId
      updateData.qrCodeUrl = qrDataUrl
      updateData.verifiedBy = req.user.name
      updateData.verifiedAt = new Date()
    }

    const updatedCertificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    // --- Notify the student about the verification result ---
    // We fetch the student's email from the User collection.
    // IMPORTANT: We try/catch so that if the email fails,
    // the certificate status update still succeeds.
    // NOTE: publicLinkId and qrCodeUrl are read from the updated
    // certificate document so we always have the latest values.
    try {
      const student = await User.findById(certificate.studentId)
      const studentEmail = student?.email

      if (studentEmail) {
        if (status === 'verified') {
          await sendCertificateVerifiedEmail({
            studentEmail,
            certificateTitle: certificate.title,
            organization: certificate.organization,
            publicLinkId: updatedCertificate.publicLinkId,
            qrCodeUrl: updatedCertificate.qrCodeUrl,
          })
        } else if (status === 'rejected') {
          await sendCertificateRejectedEmail({
            studentEmail,
            certificateTitle: certificate.title,
            organization: certificate.organization,
            comments: comments,
          })
        }
      }
    } catch (emailError) {
      console.error(`[${status}] Failed to notify student via email:`, emailError.message)
    }

    res.json({ message: `Certificate ${status} successfully`, certificate: updatedCertificate })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}