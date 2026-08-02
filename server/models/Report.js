import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      trim: true,
    },
    reportedBy: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'reports',
  }
)

const Report = mongoose.model('Report', reportSchema)
export default Report