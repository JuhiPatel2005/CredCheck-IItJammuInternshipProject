import mongoose from 'mongoose'

const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    organization: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    fileUrl: {
      type: String,
      trim: true,
      required: true,
    },
    verifierEmail: {
      type: String,
      trim: true,
      required: [true, 'Verifier email is required'],
      match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Please use a valid email address'],
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    comments: {
      type: String,
      trim: true,
    },
    publicLinkId: {
      type: String,
      trim: true,
    },
    qrCodeUrl: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: String,
      trim: true,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'certificates',
  }
)

const Certificate = mongoose.model('Certificate', certificateSchema)
export default Certificate
