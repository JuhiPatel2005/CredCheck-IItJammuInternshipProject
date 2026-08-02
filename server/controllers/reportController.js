import Report from '../models/Report.js'

export const createReport = async (req, res) => {
  try {
    const { certificateId, reportedBy, reason } = req.body

    if (!certificateId || !reason) {
      return res.status(400).json({ message: 'Certificate ID and reason are required' })
    }

    const report = await Report.create({
      certificateId,
      reportedBy: reportedBy || '',
      reason,
    })

    res.status(201).json({ message: 'Report submitted successfully', report })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 })
    res.json(reports)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const resolveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)

    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    report.status = 'resolved'
    await report.save()

    res.json({ message: 'Report marked as resolved', report })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)

    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    await Report.findByIdAndDelete(req.params.id)

    res.json({ message: 'Report deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}