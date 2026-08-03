import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'

export default function Login() {
  const [activeRole, setActiveRole] = useState('student')
  const navigate = useNavigate()
  const location = useLocation()
  const [verifierEmail, setVerifierEmail] = useState('')
  const [showVerifierOtp, setShowVerifierOtp] = useState(false)
  const [isSendingVerifierOtp, setIsSendingVerifierOtp] = useState(false)
  const [isVerifyingVerifierOtp, setIsVerifyingVerifierOtp] = useState(false)
  const [isResendingVerifierOtp, setIsResendingVerifierOtp] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [showAdminOtp, setShowAdminOtp] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)
  useEffect(() => {
    if (location.state?.role) {
      setActiveRole(location.state.role)
    }
  }, [location.state])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await authService.googleLogin(credentialResponse.credential)
      toast.success('Login successful!')
      navigate('/dashboard/student')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed')
    }
  }

  const onGoogleError = () => {
    toast.error('Google login failed')
  }
  const onVerifierSubmit = async (data) => {
    try {
      setIsSendingVerifierOtp(true)
      await authService.sendVerifierOtp(data.email, data.password)
      setVerifierEmail(data.email)
      setShowVerifierOtp(true)
      toast.success('OTP sent to your email!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid login')
    } finally {
      setIsSendingVerifierOtp(false)
    }
  }
  const onVerifierOtpVerify = async (data) => {
    try {
      setIsVerifyingVerifierOtp(true)
      await authService.verifyVerifierOtp(verifierEmail, data.otp)
      toast.success('Login successful!')
      navigate('/dashboard/verifier')
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setIsVerifyingVerifierOtp(false)
    }
  }

  const handleVerifierBackToLogin = () => {
    setShowVerifierOtp(false)
    setIsVerifyingVerifierOtp(false)
  }
  const onResendVerifierOtp = async () => {
    try {
      setIsResendingVerifierOtp(true)
      await authService.resendVerifierOtp(verifierEmail)
      toast.success('OTP resent successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setIsResendingVerifierOtp(false)
    }
  }

  const onAdminSubmit = async (data) => {
    try {
      setIsSendingOtp(true)
      await authService.sendAdminOtp(data.email, data.password)
      setAdminEmail(data.email)
      setShowAdminOtp(true)
      toast.success('OTP sent to your email!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid login')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const onAdminOtpVerify = async (data) => {
    try {
      setIsVerifyingOtp(true)
      await authService.verifyAdminOtp(adminEmail, data.otp)
      toast.success('Login successful!')
      navigate('/dashboard/admin')
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleAdminBackToLogin = () => {
    setShowAdminOtp(false)
    setAdminEmail('')
  }
  const onResendAdminOtp = async () => {
    try {
      setIsResendingOtp(true)
      await authService.resendAdminOtp(adminEmail)
      toast.success('OTP resent successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setIsResendingOtp(false)
    }
  }

  const handleRoleChange = (role) => {
    setActiveRole(role)
    setShowVerifierOtp(false)
    setShowAdminOtp(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CredCheck</h1>
          <p className="text-gray-600">Certificate & Internship Verifier for Students</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeRole === 'student'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('verifier')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeRole === 'verifier'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Verifier
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeRole === 'admin'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admin
            </button>
          </div>

          <div className={`space-y-4 ${activeRole === 'student' ? '' : 'hidden'}`}>
            <div className="text-center text-sm text-gray-600 mb-4">
              Sign in with your Google account to access your student dashboard
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                width="280"
                height="40"
                text="signin_with"
                theme="outline"
                shape="rectangular"
                size="large"
                logo_alignment="left"
                type="standard"
              />
            </div>
          </div>

          {activeRole === 'verifier' && !showVerifierOtp && (
            <form onSubmit={handleSubmit(onVerifierSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="verifier@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSendingVerifierOtp}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSendingVerifierOtp ? 'Sending OTP...' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Don't have a verifier account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/verify-request')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Register as Verifier
                </button>
              </p>
            </form>
          )}

          {activeRole === 'verifier' && showVerifierOtp && (
            <form onSubmit={handleSubmit(onVerifierOtpVerify)} className="space-y-4">
              <div className="text-center text-sm text-gray-600 mb-4">
                Enter the 6-digit OTP sent to <strong>{verifierEmail}</strong>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  {...register('otp', {
                    required: 'OTP is required',
                    minLength: {
                      value: 6,
                      message: 'OTP must be 6 digits',
                    },
                    maxLength: {
                      value: 6,
                      message: 'OTP must be 6 digits',
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'OTP must contain only numbers',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifyingVerifierOtp}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifyingVerifierOtp ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={onResendVerifierOtp}
                disabled={isResendingVerifierOtp}
                className="w-full text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {isResendingVerifierOtp ? 'Sending...' : "Didn't receive OTP? Resend"}
              </button>

              <button
                type="button"
                onClick={handleVerifierBackToLogin}
                className="flex items-center justify-center gap-2 w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to login
              </button>
            </form>
          )}

          {activeRole === 'admin' && !showAdminOtp && (
            <form onSubmit={handleSubmit(onAdminSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSendingOtp ? 'Sending OTP...' : 'Sign In'}
              </button>
            </form>
          )}

          {activeRole === 'admin' && showAdminOtp && (
            <form onSubmit={handleSubmit(onAdminOtpVerify)} className="space-y-4">
              <div className="text-center text-sm text-gray-600 mb-4">
                Enter the 6-digit OTP sent to <strong>{adminEmail}</strong>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  {...register('otp', {
                    required: 'OTP is required',
                    minLength: {
                      value: 6,
                      message: 'OTP must be 6 digits',
                    },
                    maxLength: {
                      value: 6,
                      message: 'OTP must be 6 digits',
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'OTP must contain only numbers',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={onResendAdminOtp}
                disabled={isResendingOtp}
                className="w-full text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {isResendingOtp ? 'Sending...' : "Didn't receive OTP? Resend"}
              </button>

              <button
                type="button"
                onClick={handleAdminBackToLogin}
                className="flex items-center justify-center gap-2 w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}