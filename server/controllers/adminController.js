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

// ============================================================
// ANALYTICS
// ============================================================

// This function calculates statistics for the Admin Analytics Dashboard.
// It reads REAL data from MongoDB using countDocuments and aggregate queries.
// No new fields or schemas are created - we only read existing data.
export const getAnalytics = async (req, res) => {
  try {
    // 1. Count users by role (students and verifiers)
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalVerifiers = await User.countDocuments({ role: 'verifier' })

    // 2. Count certificates by status
    const totalCertificates = await Certificate.countDocuments({})
    const pendingCertificates = await Certificate.countDocuments({ status: 'pending' })
    const verifiedCertificates = await Certificate.countDocuments({ status: 'verified' })
    const rejectedCertificates = await Certificate.countDocuments({ status: 'rejected' })

    // 3. Calculate percentages (avoid dividing by zero)
    const verificationPercentage = totalCertificates > 0
      ? Math.round((verifiedCertificates / totalCertificates) * 100)
      : 0

    const rejectionPercentage = totalCertificates > 0
      ? Math.round((rejectedCertificates / totalCertificates) * 100)
      : 0

    // 4. Monthly certificate activity (last 6 months)
    // We group certificates by their createdAt month using MongoDB aggregation.
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const monthlyActivity = await Certificate.aggregate([
      {
        // Only look at certificates created in the last 6 months
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        // Group them by year and month
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        // Sort by year then month (oldest first)
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ])

    // Build a friendly array of the last 6 months with counts
    // (even months with zero certificates will show 0)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyTrend = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // getMonth() is 0-based, so +1

      // Find the matching entry from the aggregation result
      const match = monthlyActivity.find(
        (item) => item._id.year === year && item._id.month === month
      )

      monthlyTrend.push({
        month: monthNames[month - 1],
        year,
        count: match ? match.count : 0,
      })
    }

    // 5. Most active verifiers (top 5 by number of certificates handled)
    // We group certificates by verifierEmail and count them.
    const activeVerifiers = await Certificate.aggregate([
      {
        // Only count certificates that have been reviewed (not pending)
        $match: {
          status: { $in: ['verified', 'rejected'] },
          verifierEmail: { $exists: true, $ne: '' },
        },
      },
      {
        // Group by verifier email
        $group: {
          _id: '$verifierEmail',
          count: { $sum: 1 },
        },
      },
      {
        // Sort by count (highest first)
        $sort: { count: -1 },
      },
      {
        // Only take the top 5
        $limit: 5,
      },
    ])

    // Look up verifier names for the top active verifiers
    const activeVerifiersWithNames = await Promise.all(
      activeVerifiers.map(async (verifier) => {
        const user = await User.findOne({ email: verifier._id, role: 'verifier' }).select('name email')
        return {
          email: verifier._id,
          name: user?.name || 'Unknown',
          count: verifier.count,
        }
      })
    )

    // 6. Send all statistics back to the frontend
    res.json({
      totalStudents,
      totalVerifiers,
      totalCertificates,
      pendingCertificates,
      verifiedCertificates,
      rejectedCertificates,
      verificationPercentage,
      rejectionPercentage,
      monthlyTrend,
      activeVerifiers: activeVerifiersWithNames,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
