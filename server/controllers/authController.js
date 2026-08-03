import bcrypt from 'bcryptjs'
import SibApiV3Sdk from 'sib-api-v3-sdk'
import nodemailer from 'nodemailer'
import User from '../models/User.js'
import VerifierRequest from '../models/VerifierRequest.js'
import { verifyGoogleToken } from '../config/googleAuth.js'
import { generateToken } from '../utils/generateToken.js'

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const SENDER_EMAIL = process.env.EMAIL_FROM || 'pdpu1234@gmail.com'

const buildOtpHtml = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #4f46e5; color: white; border-radius: 10px; font-size: 24px;">🔒</div>
    </div>
    <h2 style="text-align: center; color: #111827; margin: 0 0 16px;">CredCheck Email Verification</h2>
    <p style="color: #374151; text-align: center;">Your OTP code is</p>
    <div style="text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; border-radius: 8px; padding: 12px; margin: 16px 0;">${otp}</div>
    <p style="color: #6b7280; text-align: center; font-size: 14px;">This OTP expires in 10 minutes.</p>
    <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 24px;">If you did not request this, please ignore this email.</p>
  </div>
`

const sendOtpEmail = async (email, otp) => {
  console.log('Attempting to send OTP email to:', email)

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured in .env file')
  }

  const keyType = apiKey.startsWith('xkeysib-')
    ? 'API v3 (xkeysib-)'
    : apiKey.startsWith('xsmtpsib-')
      ? 'SMTP relay (xsmtpsib-)'
      : 'unknown'
  console.log('BREVO_API_KEY type detected:', keyType)

  // Brevo HTTP API v3 keys start with "xkeysib-". Prefer this method.
  if (apiKey.startsWith('xkeysib-')) {
    try {
      SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey
      const defaultApiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
        to: [{ email: email }],
        sender: { email: SENDER_EMAIL, name: 'CredCheck' },
        subject: 'CredCheck Email Verification OTP',
        htmlContent: buildOtpHtml(otp),
      })

      const data = await defaultApiInstance.sendTransacEmail(sendSmtpEmail)
      console.log('OTP email sent via Brevo API to:', email, 'Message ID:', data.messageId)
      return
    } catch (error) {
      console.error('Brevo API sending failed, falling back to SMTP:', error)
      // Fall through to SMTP retry
    }
  }

  // Brevo SMTP relay keys start with "xsmtpsib-". Use nodemailer with SMTP relay.
  try {
    const smtpHost = process.env.EMAIL_HOST || 'smtp-relay.brevo.com'
    const smtpPort = parseInt(process.env.EMAIL_PORT || '587', 10)
    const smtpUser = process.env.EMAIL_USER || SENDER_EMAIL
    const smtpPass = process.env.EMAIL_PASS || apiKey

    if (!smtpUser || !smtpPass) {
      throw new Error('SMTP credentials are not configured (EMAIL_USER / EMAIL_PASS)')
    }

    console.log('Attempting to send OTP email via SMTP relay:', smtpHost, 'port:', smtpPort, 'user:', smtpUser)

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    await transporter.sendMail({
      from: `"CredCheck" <${SENDER_EMAIL}>`,
      to: email,
      subject: 'CredCheck Email Verification OTP',
      html: buildOtpHtml(otp),
    })

    console.log('OTP email sent via SMTP relay to:', email)
  } catch (error) {
    console.error('OTP email send failed:', error)
    console.error('Error response:', error.response)
    throw new Error(`Failed to send OTP email: ${error.message}`)
  }
}

export const googleLogin = async (req, res) => {
  const { idToken } = req.body

  if (!idToken) {
    return res.status(400).json({ message: 'Google ID token is required' })
  }

  try {
    const payload = await verifyGoogleToken(idToken)
    const { email, name, sub: googleId } = payload

    if (!email) {
      return res.status(400).json({ message: 'Google account did not provide an email' })
    }

    let user = await User.findOne({ email })

    if (!user) {
      user = await User.create({
        name: name || 'Student',
        email,
        googleId,
        role: 'student',
        verified: true,
      })
    }

    const token = generateToken(user)
    return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, verified: user.verified }, token })
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Google token verification failed' })
  }
}

export const getMe = async (req, res) => {
  return res.json({ user: req.user })
}

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    verified: user.verified,
    approved: user.approved,
    trusted: user.trusted,
    college: user.college,
    degree: user.degree,
    batch: user.batch,
    createdAt: user.createdAt,
    googleId: user.googleId,
  }

  if (user.role === 'verifier') {
    userData.contactNumber = user.contactNumber
    userData.address = user.address
    userData.website = user.website
  }

  return res.json({ user: userData })
}

export const updateProfile = async (req, res) => {
  const userId = req.user.id
  const userRole = req.user.role
  const body = req.body
  let allowedFields = []

  if (userRole === 'student') {
    allowedFields = ['name', 'college', 'degree', 'batch']
  } else if (userRole === 'verifier') {
    allowedFields = ['name', 'contactNumber', 'address', 'website']
  } else if (userRole === 'admin') {
    allowedFields = ['name']
  }
  const updates = {}
  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      updates[field] = body[field]
    }
  })

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, select: '-password' }
  )

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    verified: user.verified,
    approved: user.approved,
    trusted: user.trusted,
    college: user.college,
    degree: user.degree,
    batch: user.batch,
    createdAt: user.createdAt,
    contactNumber: user.contactNumber,
    address: user.address,
    website: user.website,
  }

  return res.json({ user: userData })
}

export const registerVerifier = async (req, res) => {
  const { organizationName, email, password } = req.body

  if (!organizationName || !email || !password) {
    return res.status(400).json({ message: 'Organization name, email, and password are required' })
  }
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already registered' })
  }
  const existingRequest = await VerifierRequest.findOne({ email, status: 'pending' })
  if (existingRequest) {
    return res.status(400).json({ message: 'A verification request is already pending for this email' })
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  const otp = generateOtp()
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
  await VerifierRequest.create({
    organizationName,
    email,
    password: hashedPassword,
    otp,
    otpExpiry,
    status: 'pending',
  })
  try {
    await sendOtpEmail(email, otp)
  } catch (emailError) {
    console.error('Failed to send OTP email during verifier registration:', emailError.message)
    return res.status(500).json({ message: 'Could not send OTP email. Please try again later.' })
  }

  return res.status(201).json({ message: 'OTP sent successfully.' })
}

export const resendVerifierOtp = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }
  const verifierRequest = await VerifierRequest.findOne({ email, status: 'pending' })
  if (!verifierRequest) {
    return res.status(404).json({ message: 'Verification request not found or already verified' })
  }
  const otp = generateOtp()
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
  verifierRequest.otp = otp
  verifierRequest.otpExpiry = otpExpiry
  await verifierRequest.save()
  try {
    await sendOtpEmail(email, otp)
  } catch (emailError) {
    console.error('Failed to resend OTP email:', emailError.message)
    return res.status(500).json({ message: 'Could not send OTP email. Please try again later.' })
  }

  return res.json({ message: 'OTP resent successfully' })
}

export const verifyVerifierOtp = async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }
  const verifierRequest = await VerifierRequest.findOne({ email, status: 'pending' })
  if (!verifierRequest) {
    return res.status(404).json({ message: 'Verification request not found or already verified' })
  }
  if (verifierRequest.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' })
  }
  if (verifierRequest.otpExpiry && new Date() > verifierRequest.otpExpiry) {
    return res.status(400).json({ message: 'OTP has expired' })
  }
  await User.create({
    name: verifierRequest.organizationName,
    email: verifierRequest.email,
    password: verifierRequest.password,
    role: 'verifier',
    verified: true,
    approved: false,
  })
  verifierRequest.otp = undefined
  verifierRequest.otpExpiry = undefined
  verifierRequest.password = undefined
  await verifierRequest.save()

  return res.json({ message: 'Verifier verified successfully' })
}

export const sendVerifierLoginOtp = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email, role: 'verifier' }).select('+password')

  if (!user) {
    return res.status(404).json({ message: 'Verifier account not found' })
  }

  if (!user.verified) {
    return res.status(403).json({ message: 'Please verify your email first.' })
  }

  if (!user.approved) {
    return res.status(403).json({ message: 'Your verifier account is waiting for admin approval.' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' })
  }

  const otp = generateOtp()
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

  user.otp = otp
  user.otpExpiry = otpExpiry
  await user.save()

  try {
    await sendOtpEmail(email, otp)
  } catch (emailError) {
    console.error('Failed to send verifier login OTP email:', emailError.message)
    return res.status(500).json({ message: 'Could not send OTP email. Please try again later.' })
  }

  return res.json({ message: 'OTP sent successfully', email })
}

export const verifyVerifierLoginOtp = async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }

  const user = await User.findOne({ email, role: 'verifier' }).select('+password')

  if (!user) {
    return res.status(404).json({ message: 'Verifier account not found' })
  }

  if (!user.otp || !user.otpExpiry) {
    return res.status(400).json({ message: 'OTP not found. Please login again.' })
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' })
  }

  if (new Date() > user.otpExpiry) {
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()
    return res.status(400).json({ message: 'OTP has expired' })
  }

  user.otp = undefined
  user.otpExpiry = undefined
  await user.save()

  const token = generateToken(user)
  return res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      approved: user.approved,
      trusted: user.trusted,
    },
    token,
  })
}

export const resendVerifierLoginOtp = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  const user = await User.findOne({ email, role: 'verifier' }).select('+password')
  if (!user) {
    return res.status(404).json({ message: 'Verifier account not found' })
  }

  const otp = generateOtp()
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

  user.otp = otp
  user.otpExpiry = otpExpiry
  await user.save()

  try {
    await sendOtpEmail(email, otp)
  } catch (emailError) {
    console.error('Failed to resend verifier login OTP email:', emailError.message)
    return res.status(500).json({ message: 'Could not send OTP email. Please try again later.' })
  }

  return res.json({ message: 'OTP resent successfully', email })
}

const adminOtpStore = new Map()

export const resendAdminOtp = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }
  const user = await User.findOne({ email, role: 'admin' }).select('+password')
  if (!user) {
    return res.status(404).json({ message: 'Admin account not found' })
  }
  const otp = generateOtp()
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
  adminOtpStore.set(email, { otp, otpExpiry })
  try {
    await sendOtpEmail(email, otp)
  } catch (emailError) {
    console.error('Failed to resend admin OTP email:', emailError.message)
    return res.status(500).json({ message: 'Could not send OTP email. Please try again later.' })
  }

  return res.json({ message: 'OTP resent successfully', email })
}

export const sendAdminOtp = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email, role: 'admin' }).select('+password')

  if (!user) {
    return res.status(404).json({ message: 'Admin account not found' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' })
  }
  const otp = generateOtp()
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
  adminOtpStore.set(email, { otp, otpExpiry })
  try {
    await sendOtpEmail(email, otp)
  } catch (emailError) {
    console.error('Failed to send admin OTP email:', emailError.message)
    return res.status(500).json({ message: 'Could not send OTP email. Please try again later.' })
  }

  return res.json({ message: 'OTP sent successfully', email })
}

export const verifyAdminOtp = async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }

  const record = adminOtpStore.get(email)

  if (!record) {
    return res.status(400).json({ message: 'OTP not found or expired. Please login again.' })
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' })
  }

  if (new Date() > record.otpExpiry) {
    adminOtpStore.delete(email)
    return res.status(400).json({ message: 'OTP has expired' })
  }
  const user = await User.findOne({ email, role: 'admin' })
  if (!user) {
    return res.status(404).json({ message: 'Admin account not found' })
  }
  adminOtpStore.delete(email)

  const token = generateToken(user)
  return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, verified: user.verified }, token })
}

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email, role: 'admin' }).select('+password')

  if (!user) {
    return res.status(404).json({ message: 'Admin account not found' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' })
  }

  const token = generateToken(user)
  return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, verified: user.verified }, token })
}