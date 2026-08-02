import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const saveUser = (data) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
}

export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const authService = {
  async googleLogin(idToken) {
    const response = await axios.post(`${API_URL}/auth/google`, { idToken })
    if (response.data.token) {
      saveUser(response.data)
    }
    return response.data
  },

  async sendVerifierOtp(email, password) {
    const response = await axios.post(`${API_URL}/auth/verifier/send-otp`, { email, password })
    return response.data
  },

  async verifyVerifierOtp(email, otp) {
    const response = await axios.post(`${API_URL}/auth/verifier/verify-otp`, { email, otp })
    if (response.data.token) {
      saveUser(response.data)
    }
    return response.data
  },

  async resendVerifierOtp(email) {
    const response = await axios.post(`${API_URL}/auth/verifier/resend-otp`, { email })
    return response.data
  },

  async adminLogin(email, password) {
    const response = await axios.post(`${API_URL}/auth/admin/login`, { email, password })
    if (response.data.token) {
      saveUser(response.data)
    }
    return response.data
  },

  async sendAdminOtp(email, password) {
    const response = await axios.post(`${API_URL}/auth/admin/send-otp`, { email, password })
    return response.data
  },

  async verifyAdminOtp(email, otp) {
    const response = await axios.post(`${API_URL}/auth/admin/verify-otp`, { email, otp })
    if (response.data.token) {
      saveUser(response.data)
    }
    return response.data
  },

  async getMe() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  async getProfile() {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  async updateProfile(data) {
    const token = localStorage.getItem('token')
    const response = await axios.put(`${API_URL}/auth/profile`, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  async registerVerifier(organizationName, email, password) {
    const response = await axios.post(`${API_URL}/auth/verifier/register`, {
      organizationName,
      email,
      password,
    })
    return response.data
  },

  async verifyVerifierRegistrationOtp(email, otp) {
    const response = await axios.post(`${API_URL}/auth/verifier/register/verify-otp`, { email, otp })
    return response.data
  },

  async resendVerifierRegistrationOtp(email) {
    const response = await axios.post(`${API_URL}/auth/verifier/register/resend-otp`, { email })
    return response.data
  },

  async resendAdminOtp(email) {
    const response = await axios.post(`${API_URL}/auth/admin/resend-otp`, { email })
    return response.data
  },
}
