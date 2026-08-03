import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import User from '../models/User.js'
import VerifierRequest from '../models/VerifierRequest.js'
import { verifyGoogleToken } from '../config/googleAuth.js'
import { generateToken } from '../utils/generateToken.js'

const createEmailTransporter = (authUser = null) => {
  const emailHost = process.env.EMAIL_HOST
  const emailPort = process.env.EMAIL_PORT
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS

  if (!emailHost || !emailUser || !emailPass) {
    throw new Error(
      'Email is not configured. Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in your .env file.\n' +
      'See server/.env.example for setup instructions.'
    )
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: Number(emailPort || 587),
    secure: false,
    requireTLS: true,
    auth: {
      user: authUser || emailUser,
      pass: emailPass,
    },
  })
}

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const sendOtpEmail = async (email, otp) => {
  try {
    console.log('Attempting to send OTP email to:', email)
    console.log('Using EMAIL_HOST:', process.env.EMAIL_HOST)
    console.log('Using EMAIL_USER:', process.env.EMAIL_USER)
    console.log('Using EMAIL_FROM:', process.env.EMAIL_FROM)
    
    const transporter = createEmailTransporter()

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'CredCheck Email Verification OTP',
      html: `
        <p>Your OTP is</p>
        <h2>${otp}</h2>
        <p>This OTP expires in 10 minutes.</p>
      `,
    })
    
    console.log('OTP email sent successfully to:', email)
  } catch (error) {
    console.error('OTP email send failed:', error)
    console.error('Error code:', error.code)
    console.error('Error response:', error.response)
    console.error('Error responseCode:', error.responseCode)
    console.error('SMTP Error - Check if sender email is verified in Brevo dashboard')
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