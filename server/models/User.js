import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Please use a valid email address'],
    },
    googleId: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'verifier', 'admin'],
      default: 'student',
    },
    college: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    batch: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    trusted: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
)

const User = mongoose.model('User', userSchema)
export default User
