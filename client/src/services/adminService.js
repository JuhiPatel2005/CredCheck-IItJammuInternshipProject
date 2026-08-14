import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const adminService = {
  async getAnalytics() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async getUsers() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async getVerifiers() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/admin/verifier-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async getCertificates() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/admin/certificates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async updateVerifierRequestStatus(id, status) {
    const token = localStorage.getItem('token')
    const response = await axios.put(
      `${API_URL}/admin/verifier-requests/${id}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return response.data
  },

  async deleteUser(id) {
    const token = localStorage.getItem('token')
    const response = await axios.delete(`${API_URL}/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async deleteCertificate(id) {
    const token = localStorage.getItem('token')
    const response = await axios.delete(`${API_URL}/admin/certificates/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async deleteVerifier(id) {
    const token = localStorage.getItem('token')
    const response = await axios.delete(`${API_URL}/admin/verifier-requests/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async getReports() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async resolveReport(id) {
    const token = localStorage.getItem('token')
    const response = await axios.put(`${API_URL}/reports/${id}/resolve`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async deleteReport(id) {
    const token = localStorage.getItem('token')
    const response = await axios.delete(`${API_URL}/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async toggleTrusted(userId, trusted) {
    const token = localStorage.getItem('token')
    const response = await axios.put(`${API_URL}/admin/users/${userId}/trust`, { trusted }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

   async toggleTrustedVerifier(id) {
    const token = localStorage.getItem('token')
    const response = await axios.patch(`${API_URL}/admin/verifiers/${id}/trusted`, {}, {
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
  },
}
