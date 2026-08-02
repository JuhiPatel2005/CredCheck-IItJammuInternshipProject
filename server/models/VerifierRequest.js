import mongoose from 'mongoose'

const verifierRequestSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      trim: true,
    },
    otp: {
      type: String,
      trim: true,
    },
    otpExpiry: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'verifier_requests',
  }
)

const VerifierRequest = mongoose.model('VerifierRequest', verifierRequestSchema)
export default VerifierRequest