import User from '../models/User.js'

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { name, college, degree, batch } = req.body
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (college !== undefined) updateData.college = college
    if (degree !== undefined) updateData.degree = degree
    if (batch !== undefined) updateData.batch = batch

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}