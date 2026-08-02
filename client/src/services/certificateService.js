import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const certificateService = {
  async getMyCertificates() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/certificates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async getCertificateById(id) {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/certificates/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async uploadCertificate(formData) {
    const token = localStorage.getItem('token')
    const response = await axios.post(`${API_URL}/certificates`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

   async deleteCertificate(id) {
    const token = localStorage.getItem('token')
    const response = await axios.delete(`${API_URL}/certificates/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async downloadCertificateFile(id) {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/certificates/${id}/file/download`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    })

    return { blob: response.data, filename: 'certificate.pdf' }
  }
}