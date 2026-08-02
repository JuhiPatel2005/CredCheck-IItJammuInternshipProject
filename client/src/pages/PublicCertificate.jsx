import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Shield, CheckCircle, XCircle, Clock, RefreshCw, ExternalLink, Copy, Flag } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Loader from '../components/Loader'
import { publicService } from '../services/publicService'

export default function PublicCertificate() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [certificate, setCertificate] = useState(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportEmail, setReportEmail] = useState('')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

  useEffect(() => {
    loadCertificate()
  }, [id])

  const loadCertificate = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await publicService.getCertificate(id)
      setCertificate(data)
    } catch (error) {
      setError(error.response?.data?.message || 'Certificate not found')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()

    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting')
      return
    }

    setIsSubmittingReport(true)

    try {
      await publicService.submitReport(id, reportReason, reportEmail)
      toast.success('Report submitted successfully')
      setShowReportForm(false)
      setReportReason('')
      setReportEmail('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit report')
    } finally {
      setIsSubmittingReport(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <Loader />
  }

  
  if (error || !certificate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
            <p className="text-gray-500 mb-6">
              This certificate link is invalid or has been removed.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <p className="text-sm text-gray-400">Verified using CredCheck</p>
        </div>
      </div>
    )
  }
  if (certificate.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">CredCheck</h1>
            <p className="text-gray-500">Certificate Verification</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Pending Verification</h2>
              <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-medium text-sm">
                Pending
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Certificate Information</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Certificate Title</p>
                  <p className="text-base font-semibold text-gray-900">{certificate.title}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Organization</p>
                  <p className="text-base font-semibold text-gray-900">{certificate.organization}</p>
                </div>

                {certificate.description && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-base text-gray-900">{certificate.description}</p>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                  <p className="text-base font-semibold text-gray-900">{formatDate(certificate.issueDate)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg mb-6">
              <p className="text-sm text-yellow-700 text-center">
                This certificate is waiting for verification by the issuing organization.
                Please check back later.
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowReportForm(!showReportForm)}
                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <Flag className="w-4 h-4" />
                Report this certificate
              </button>
            </div>

            {showReportForm && (
              <form onSubmit={handleSubmitReport} className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Report Certificate</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Describe why this certificate should be reviewed..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Your Email (Optional)</label>
                    <input
                      type="email"
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmittingReport}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                      {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-gray-400">Verified using CredCheck</p>
        </div>
      </div>
    )
  }
  if (certificate.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">CredCheck</h1>
            <p className="text-gray-500">Certificate Verification</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Rejected</h2>
              <span className="inline-block px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium text-sm">
                Rejected
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Certificate Information</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Certificate Title</p>
                  <p className="text-base font-semibold text-gray-900">{certificate.title}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Organization</p>
                  <p className="text-base font-semibold text-gray-900">{certificate.organization}</p>
                </div>

                {certificate.description && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-base text-gray-900">{certificate.description}</p>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                  <p className="text-base font-semibold text-gray-900">{formatDate(certificate.issueDate)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg mb-6">
              <p className="text-sm text-red-700 text-center">
                This certificate has been rejected by the verifying organization.
                Please contact the student or the issuing organization for more information.
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowReportForm(!showReportForm)}
                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <Flag className="w-4 h-4" />
                Report this certificate
              </button>
            </div>

            {showReportForm && (
              <form onSubmit={handleSubmitReport} className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Report Certificate</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Describe why this certificate should be reviewed..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Your Email (Optional)</label>
                    <input
                      type="email"
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmittingReport}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                      {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-gray-400">Verified using CredCheck</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">CredCheck</h1>
          <p className="text-gray-500">Certificate Verification</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified Certificate</h2>
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium text-sm">
              Verified
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Student Information</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Student Name</p>
                <p className="text-base font-semibold text-gray-900">{certificate.studentName}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Certificate Information</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Certificate Title</p>
                <p className="text-base font-semibold text-gray-900">{certificate.title}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Organization</p>
                <p className="text-base font-semibold text-gray-900">{certificate.organization}</p>
              </div>

              {certificate.description && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-base text-gray-900">{certificate.description}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                <p className="text-base font-semibold text-gray-900">{formatDate(certificate.issueDate)}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Verification Information</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Verified By</p>
                <p className="text-base font-semibold text-gray-900">{certificate.verifierName}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Verification Date</p>
                <p className="text-base font-semibold text-gray-900">{formatDateTime(certificate.verifiedAt)}</p>
              </div>
            </div>
          </div>

          {certificate.qrCodeUrl && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">QR Code</h3>
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <img
                  src={certificate.qrCodeUrl}
                  alt="QR Code"
                  className="inline-block w-40 h-40 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          )}

          {certificate.publicLink && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Public Link</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={certificate.publicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-700 break-all flex-1"
                  >
                    {certificate.publicLink}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(certificate.publicLink)
                      toast.success('Link copied to clipboard!')
                    }}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Copy Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-center pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowReportForm(!showReportForm)}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <Flag className="w-4 h-4" />
              Report this certificate
            </button>
          </div>

          {showReportForm && (
            <form onSubmit={handleSubmitReport} className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Report Certificate</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Describe why this certificate should be reviewed..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Your Email (Optional)</label>
                  <input
                    type="email"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                  >
                    {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-400">Verified using CredCheck</p>
      </div>
    </div>
  )
}
