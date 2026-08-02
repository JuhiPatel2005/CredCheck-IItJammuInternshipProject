import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const studentService = {
  async getProfile() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/student/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async updateProfile(data) {
    const token = localStorage.getItem('token')
    const response = await axios.put(`${API_URL}/student/profile`, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },
}