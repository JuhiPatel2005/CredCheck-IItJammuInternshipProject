import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const publicService = {
  async getCertificate(publicLinkId) {
    const response = await axios.get(`${API_URL}/public/certificate/${publicLinkId}`)
    return response.data
  },

  async submitReport(certificateId, reason, reportedBy = '') {
    const response = await axios.post(`${API_URL}/reports`, {
      certificateId,
      reportedBy,
      reason,
    })
    return response.data
  },
}