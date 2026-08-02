import User from '../models/User.js'
import Certificate from '../models/Certificate.js'
import VerifierRequest from '../models/VerifierRequest.js'

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password')
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const totalCerts = await Certificate.countDocuments({ studentId: user._id })
        const verifiedCerts = await Certificate.countDocuments({ 
          studentId: user._id, 
          status: 'verified' 
        })
        const pendingCerts = await Certificate.countDocuments({ 
          studentId: user._id, 
          status: 'pending' 
        })
        const rejectedCerts = await Certificate.countDocuments({ 
          studentId: user._id, 
          status: 'rejected' 
        })
        return {
          ...user.toObject(),
          totalCertificates: totalCerts,
          verifiedCertificates: verifiedCerts,
          pendingCertificates: pendingCerts,
          rejectedCertificates: rejectedCerts,
        }
      })
    )
    res.json(usersWithCounts)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getAllVerifierRequests = async (req, res) => {
  try {
    const requests = await VerifierRequest.find({}).sort({ requestedAt: -1 })
    const requestsWithUser = await Promise.all(
      requests.map(async (request) => {
        const user = await User.findOne({ email: request.email, role: 'verifier' }).select('-password')
        return {
          ...request.toObject(),
          user: user ? user.toObject() : null,
        }
      })
    )

    res.json(requestsWithUser)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({})
      .populate('studentId', 'name email college degree batch')
      .sort({ createdAt: -1 })
    const certificatesWithVerifier = await Promise.all(
      certificates.map(async (cert) => {
        const verifier = cert.verifierEmail 
          ? await User.findOne({ email: cert.verifierEmail, role: 'verifier' }).select('name email')
          : null
        return {
          ...cert.toObject(),
          verifierName: verifier?.name || 'N/A',
        }
      })
    )
    res.json(certificatesWithVerifier)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const updateVerifierRequestStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "approved" or "rejected"' })
    }

    const verifierRequest = await VerifierRequest.findById(req.params.id)

    if (!verifierRequest) {
      return res.status(404).json({ message: 'Verifier request not found' })
    }

    if (verifierRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Verifier request has already been reviewed' })
    }
    verifierRequest.status = status
    await verifierRequest.save()
    const user = await User.findOne({ email: verifierRequest.email, role: 'verifier' })
    if (user) {
      if (status === 'approved') {
        user.approved = true
      } else if (status === 'rejected') {
        user.approved = false
      }
      await user.save()
    }

    res.json({ message: `Verifier request ${status} successfully` })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id)

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' })
    }

    res.json({ message: 'Certificate deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deleteVerifier = async (req, res) => {
  try {
    const verifierRequest = await VerifierRequest.findById(req.params.id)

    if (!verifierRequest) {
      return res.status(404).json({ message: 'Verifier request not found' })
    }

    await User.deleteOne({ email: verifierRequest.email, role: 'verifier' })
    await VerifierRequest.findByIdAndDelete(req.params.id)

    res.json({ message: 'Verifier deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const toggleUserTrusted = async (req, res) => {
  try {
    const { trusted } = req.body

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.role !== 'verifier') {
      return res.status(400).json({ message: 'Only verifiers can be marked as trusted' })
    }
    user.trusted = trusted
    await user.save()

    res.json({ message: `User ${trusted ? 'marked as trusted' : 'trust removed'} successfully`, user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const toggleTrustedVerifier = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.role !== 'verifier') {
      return res.status(400).json({ message: 'Only verifiers can be marked as trusted' })
    }
    user.trusted = !user.trusted
    await user.save()

    res.json({ message: `Verifier ${user.trusted ? 'marked as trusted' : 'trust removed'} successfully`, user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
