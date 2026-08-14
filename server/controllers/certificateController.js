import axios from 'axios'
import AdmZip from 'adm-zip'
import Certificate from '../models/Certificate.js'
import cloudinary from '../config/cloudinary.js'
import { sendCertificateUploadedEmail } from '../utils/emailService.js'

const getFilenameFromUrl = (fileUrl) => {
  const parts = fileUrl.split('/')
  let filename = parts[parts.length - 1]
  filename = filename.split('?')[0]
  return filename
}

const ensurePdfExtension = (filename) => {
  if (!filename.toLowerCase().endsWith('.pdf')) {
    return `${filename}.pdf`
  }
  return filename
}

const getPublicIdFromUrl = (fileUrl) => {
  const parts = fileUrl.split('/upload/')
  if (parts.length < 2) return null
  const afterUpload = parts[1]
  const withoutVersion = afterUpload.replace(/^v\d+\//, '')
  return withoutVersion.replace(/\.\w+$/, '')
}

const fetchPdfFromCloudinary = async (fileUrl) => {
  const publicId = getPublicIdFromUrl(fileUrl)
  if (!publicId) {
    throw new Error('Invalid Cloudinary URL')
  }

  const downloadUrl = cloudinary.utils.download_archive_url({
    public_ids: [publicId],
    mode: 'download',
  })

  const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
  if (response.status !== 200 || response.data.length === 0) {
    throw new Error('Failed to download file from Cloudinary')
  }

  const zip = new AdmZip(response.data)
  const zipEntries = zip.getEntries()
  if (zipEntries.length === 0) {
    throw new Error('Empty archive from Cloudinary')
  }

  const pdfEntry = zipEntries.find(e => e.entryName.toLowerCase().endsWith('.pdf')) || zipEntries[0]
  const pdfBuffer = pdfEntry.getData()
  const pdfFilename = ensurePdfExtension(pdfEntry.entryName)

  return { buffer: pdfBuffer, filename: pdfFilename }
}

export const viewCertificateFile = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)

    if (!certificate || !certificate.fileUrl) {
      return res.status(404).json({ message: 'Certificate or file not found' })
    }

    let pdfBuffer
    let filename

    try {
      const response = await axios.get(certificate.fileUrl, { responseType: 'arraybuffer' })
      pdfBuffer = response.data
      filename = getFilenameFromUrl(certificate.fileUrl)
    } catch (directError) {
      const status = directError.response?.status
      if (status === 401 || status === 403) {
        const extracted = await fetchPdfFromCloudinary(certificate.fileUrl)
        pdfBuffer = extracted.buffer
        filename = extracted.filename
      } else {
        throw directError
      }
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error viewing file:', error.message)
    res.status(500).json({ message: 'Failed to load file', error: error.message })
  }
}

export const downloadCertificateFile = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)

    if (!certificate || !certificate.fileUrl) {
      return res.status(404).json({ message: 'Certificate or file not found' })
    }

    let pdfBuffer
    let filename

    try {
      const response = await axios.get(certificate.fileUrl, { responseType: 'arraybuffer' })
      pdfBuffer = response.data
      filename = getFilenameFromUrl(certificate.fileUrl)
    } catch (directError) {
      const status = directError.response?.status
      if (status === 401 || status === 403) {
        const extracted = await fetchPdfFromCloudinary(certificate.fileUrl)
        pdfBuffer = extracted.buffer
        filename = extracted.filename
      } else {
        throw directError
      }
    }

    filename = ensurePdfExtension(filename)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error downloading file:', error.message)
    res.status(500).json({ message: 'Failed to download file', error: error.message })
  }
}

export const createCertificate = async (req, res) => {
  try {
    const { title, organization, issueDate, description, verifierEmail } = req.body
    if (!title || !organization || !issueDate) {
      return res.status(400).json({ message: 'Title, organization, and issue date are required' })
    }
    if (!verifierEmail) {
      return res.status(400).json({ message: 'Verifier email is required' })
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRegex.test(verifierEmail)) {
      return res.status(400).json({ message: 'Please provide a valid verifier email' })
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Certificate file is required (PDF, PNG, JPG, JPEG)' })
    }
    let fileUrl
    try {
      const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'credcheck/certificates',
              resource_type: 'raw',
              use_filename: true,
              unique_filename: true,
            },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(req.file.buffer)
      })
      fileUrl = result.secure_url
    } catch (uploadError) {
      return res.status(500).json({ message: 'Failed to upload file to Cloudinary', error: uploadError.message })
    }
    const certificate = await Certificate.create({
      studentId: req.user._id,
      title,
      organization,
      issueDate,
      description: description || '',
      verifierEmail: verifierEmail || '',
      fileUrl,
      status: 'pending', 
    })

    // --- Notify the verifier that a new certificate is pending their review ---
    // IMPORTANT: We try/catch so that if the email fails,
    // the certificate upload still succeeds.
    try {
      await sendCertificateUploadedEmail({
        verifierEmail: verifierEmail,
        studentName: req.user.name,
        certificateTitle: title,
        organization: organization,
      })
    } catch (emailError) {
      console.error('[Certificate Upload] Failed to notify verifier via email:', emailError.message)
    }

    res.status(201).json({ message: 'Certificate uploaded successfully', certificate })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ studentId: req.user._id }).sort({ createdAt: -1 })
    res.json(certificates)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' })
    }
    if (certificate.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view this certificate' })
    }
    res.json(certificate)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' })
    }
    if (certificate.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this certificate' })
    }
    try {
      const urlParts = certificate.fileUrl.split('/')
      const filename = urlParts[urlParts.length - 1]
      const publicId = `credcheck/certificates/${filename.split('.')[0]}`
      await cloudinary.uploader.destroy(publicId)
    } catch (cloudinaryError) {
    }

    await Certificate.findByIdAndDelete(req.params.id)

    res.json({ message: 'Certificate deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}