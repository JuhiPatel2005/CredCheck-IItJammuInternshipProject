import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const verifierService = {
  async getCertificates() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/verifier/certificates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async getCertificateById(id) {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/verifier/certificates/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

   async updateStatus(id, status, comments) {
    const token = localStorage.getItem('token')
    const response = await axios.put(
      `${API_URL}/verifier/certificates/${id}`,
      { status, comments },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
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
