import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Shield, ArrowLeft, Mail } from 'lucide-react'
import { authService } from '../services/authService'

export default function VerifyRequest() {
  const navigate = useNavigate()
  const [step, setStep] = useState('register')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegistering },
  } = useForm()
  const {
    register: otpForm,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors, isSubmitting: isVerifying },
  } = useForm()
  const onRegister = async (data) => {
    try {
      await authService.registerVerifier(
        data.organizationName,
        data.email,
        data.password
      )
      toast.success('OTP sent to your email!')
      setRegisteredEmail(data.email)
      setStep('otp')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }
  const onVerifyOtp = async (data) => {
    try {
      await authService.verifyVerifierRegistrationOtp(registeredEmail, data.otp)
      toast.success('Email verified successfully!')
      setStep('success')
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed')
    }
  }
  const onResendOtp = async () => {
    try {
      setIsResending(true)
      await authService.resendVerifierRegistrationOtp(registeredEmail)
      toast.success('OTP resent successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">CredCheck</h1>
          <p className="text-gray-500">Become a Verifier</p>
        </div>

        {step === 'register' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Register Your Organization</h2>

            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  {...registerForm('organizationName', {
                    required: 'Organization name is required',
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Google, Microsoft"
                />
                {registerErrors.organizationName && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.organizationName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...registerForm('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="org@example.com"
                />
                {registerErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...registerForm('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"
                />
                {registerErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...registerForm('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value, formValues) =>
                      value === formValues.password || 'Passwords do not match',
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"
                />
                {registerErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRegistering ? 'Sending OTP...' : 'Register & Get OTP'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" state={{ role: 'verifier' }} className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {step === 'otp' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 6-digit OTP to <strong>{registeredEmail}</strong>
            </p>

            <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  {...otpForm('otp', {
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
                {otpErrors.otp && (
                  <p className="mt-1 text-sm text-red-600">{otpErrors.otp.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <button
              onClick={onResendOtp}
              disabled={isResending}
              className="w-full text-sm text-indigo-600 hover:text-indigo-700 mt-3 disabled:opacity-50"
            >
              {isResending ? 'Sending...' : "Didn't receive OTP? Resend"}
            </button>

            <button
              onClick={() => setStep('register')}
              className="flex items-center justify-center gap-2 w-full text-sm text-gray-500 hover:text-gray-700 mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to registration
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Email Verified!</h2>
            <div className="border-t border-b border-gray-200 py-4 my-4">
              <p className="text-gray-700">
                Your email has been verified successfully.
              </p>
              <p className="text-gray-700 mt-2">
                Your account has been sent to the administrator for approval.
              </p>
              <p className="text-gray-700 mt-2">
                You will be able to log in once approved.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
