import Certificate from '../models/Certificate.js'
import User from '../models/User.js'

export const getPublicCertificate = async (req, res) => {
  try {
    const { publicLinkId } = req.params
    const certificate = await Certificate.findOne({ publicLinkId })

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' })
    }
    if (certificate.status !== 'verified') {
      return res.json({
        status: certificate.status,
        studentName: 'Unknown',
        title: certificate.title,
        organization: certificate.organization,
        description: certificate.description || '',
        issueDate: certificate.issueDate,
        verifierName: 'Not yet verified',
        verifiedAt: null,
        qrCodeUrl: null,
        publicLink: null,
      })
    }
    const student = await User.findById(certificate.studentId)
    let verifierName = certificate.verifiedBy
    if (!verifierName) {
      const verifier = await User.findOne({ email: certificate.verifierEmail })
      verifierName = verifier ? verifier.name : 'Unknown'
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

    res.json({
      studentName: student ? student.name : 'Unknown',
      title: certificate.title,
      organization: certificate.organization,
      description: certificate.description || '',
      issueDate: certificate.issueDate,
      status: certificate.status,
      verifierName: verifierName,
      verifiedAt: certificate.verifiedAt || certificate.updatedAt,
      qrCodeUrl: certificate.qrCodeUrl,
      publicLink: `${clientUrl}/cert/${publicLinkId}`,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}