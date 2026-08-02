import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'
import Certificate from '../models/Certificate.js'

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

    res.json({ message: `Certificate ${status} successfully`, certificate: updatedCertificate })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}