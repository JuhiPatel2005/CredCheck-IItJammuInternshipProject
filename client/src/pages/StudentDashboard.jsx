import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { User, GraduationCap, Calendar, FileText, CheckCircle, Clock, XCircle, Trash2, Eye, Edit, ExternalLink } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import { studentService } from '../services/studentService'
import { certificateService } from '../services/certificateService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function StudentDashboard() {
  const location = useLocation()
  const navigate = useNavigate()

  const [view, setView] = useState('dashboard')
  const [profile, setProfile] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [selectedCert, setSelectedCert] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  useEffect(() => {
    const path = location.pathname
    if (path.includes('/profile')) {
      setView('profile')
    } else if (path.includes('/certificates')) {
      setView('certificates')
    } else if (path.includes('/upload')) {
      setView('upload')
    } else {
      setView('dashboard')
    }
  }, [location.pathname])

  useEffect(() => {
    if (view === 'dashboard') {
      loadDashboard()
    } else if (view === 'profile') {
      loadProfile()
    } else if (view === 'certificates') {
      loadCertificates()
    }
  }, [view])

  const handleUpload = async (data) => {
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('organization', data.organization)
      formData.append('issueDate', data.issueDate)
      formData.append('description', data.description || '')
      formData.append('verifierEmail', data.verifierEmail)
      formData.append('certificateFile', data.file[0])

      await certificateService.uploadCertificate(formData)
      toast.success('Certificate uploaded successfully')
      reset()
      navigate('/dashboard/student')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload certificate')
    }
  }

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [profileData, certs] = await Promise.all([
        studentService.getProfile(),
        certificateService.getMyCertificates(),
      ])
      setProfile(profileData)
      setCertificates(certs)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await studentService.getProfile()
      setProfile(data)
      reset({
        name: data.name || '',
        college: data.college || '',
        degree: data.degree || '',
        batch: data.batch || '',
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const loadCertificates = async () => {
    try {
      setLoading(true)
      const data = await certificateService.getMyCertificates()
      setCertificates(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const onProfileUpdate = async (data) => {
    try {
      await studentService.updateProfile(data)
      toast.success('Profile updated successfully')
      setEditingProfile(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleViewDetails = async (cert) => {
    try {
      const data = await certificateService.getCertificateById(cert._id)
      setSelectedCert(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load certificate details')
    }
  }

  const handleViewFile = (cert) => {
    const token = localStorage.getItem('token')
    window.open(`${API_URL}/certificates/${cert._id}/file?token=${token}`, '_blank')
  }

  const handleDownloadFile = async (cert) => {
    try {
      const { blob, filename } = await certificateService.downloadCertificateFile(cert._id)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Certificate downloaded successfully')
    } catch (error) {
      toast.error('Failed to download file')
    }
  }

  const handleDeleteCertificate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) {
      return
    }

    try {
      await certificateService.deleteCertificate(id)
      toast.success('Certificate deleted successfully')
      loadCertificates()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete certificate')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const renderDetailModal = () => {
    if (!selectedCert) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Certificate Details</h3>
            <button
              onClick={() => setSelectedCert(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Certificate Title</p>
                <p className="font-medium text-gray-900">{selectedCert.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-4 h-4 text-gray-400">@</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Organization</p>
                <p className="font-medium text-gray-900">{selectedCert.organization}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Issue Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedCert.issueDate)}</p>
              </div>
            </div>

            {selectedCert.description && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">{selectedCert.description}</p>
              </div>
            )}

            {selectedCert.fileUrl && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Uploaded File</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewFile(selectedCert)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View PDF
                  </button>
                  <button
                    onClick={() => handleDownloadFile(selectedCert)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              {getStatusBadge(selectedCert.status)}
            </div>

            {profile && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Student Name</p>
                  <p className="font-medium text-gray-900">{profile.name || 'N/A'}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Upload Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedCert.createdAt)}</p>
              </div>
            </div>

            {selectedCert.status === 'verified' && selectedCert.verifiedAt && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Verification Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedCert.verifiedAt)}</p>
                </div>
              </div>
            )}

            {selectedCert.status === 'verified' && selectedCert.qrCodeUrl && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">Public Certificate Link & QR Code</p>
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={selectedCert.qrCodeUrl}
                    alt="QR Code"
                    className="w-40 h-40"
                  />
                  <a
                    href={`${import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'}/cert/${selectedCert.publicLinkId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-sm break-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {`${import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'}/cert/${selectedCert.publicLinkId}`}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'}/cert/${selectedCert.publicLinkId}`)
                      toast.success('Link copied to clipboard!')
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}

            {selectedCert.status === 'rejected' && selectedCert.comments && (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 mb-1">Rejection Reason</p>
                <p className="text-red-900">{selectedCert.comments}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading && view === 'dashboard') {
    return <Loader />
  }

  if (view === 'dashboard') {
    const total = certificates.length
    const verified = certificates.filter((c) => c.status === 'verified').length
    const pending = certificates.filter((c) => c.status === 'pending').length

    return (
      <>
        <div>
          <PageHeader title="Dashboard" subtitle="Welcome back!" />
          {profile && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{profile.name || 'Student'}</h3>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  {profile.college && <p className="text-sm text-gray-500 mt-1">{profile.college}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{verified}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Certificates</h3>
            </div>
            <div className="p-6">
              {certificates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No certificates uploaded yet</p>
                  <button
                    onClick={() => navigate('/dashboard/student/certificates')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View all certificates
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificates.slice(0, 5).map((cert) => (
                    <div key={cert._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{cert.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{cert.organization}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(cert.status)}
                          <button
                            onClick={() => handleViewDetails(cert)}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {renderDetailModal()}
      </>
    )
  }

  if (view === 'profile') {
    if (loading) {
      return <Loader />
    }

    return (
      <>
        <div>
          <PageHeader title="Profile" subtitle="Manage your profile information" />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            {editingProfile ? (
              <form onSubmit={handleSubmit(onProfileUpdate)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                  <input
                    type="text"
                    {...register('college')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Your college name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                  <input
                    type="text"
                    {...register('degree')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Your degree"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <input
                    type="text"
                    {...register('batch')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 2024"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProfile(false)
                      reset()
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{profile?.name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-4 h-4 text-gray-400">@</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{profile?.email || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">College</p>
                    <p className="font-medium text-gray-900">{profile?.college || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Degree</p>
                    <p className="font-medium text-gray-900">{profile?.degree || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Batch</p>
                    <p className="font-medium text-gray-900">{profile?.batch || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {renderDetailModal()}
      </>
    )
  }

  if (view === 'upload') {
    const onSubmit = handleUpload

    return (
      <>
        <div>
          <PageHeader title="Upload Certificate" subtitle="Add a new certificate" />

          <div className="max-w-2xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Title</label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Web Development Bootcamp"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    {...register('organization', { required: 'Organization is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Coursera, Google, Microsoft"
                  />
                  {errors.organization && <p className="mt-1 text-sm text-red-600">{errors.organization.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    {...register('issueDate', { required: 'Issue date is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.issueDate && <p className="mt-1 text-sm text-red-600">{errors.issueDate.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Brief description of the certificate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verifier Email (Required)</label>
                  <input
                    type="email"
                    {...register('verifierEmail', {
                      required: 'Verifier email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="verifier@example.com"
                  />
                  {errors.verifierEmail && <p className="mt-1 text-sm text-red-600">{errors.verifierEmail.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate File</label>
                  <input
                    type="file"
                    {...register('file', {
                      required: 'File is required',
                      validate: {
                        fileType: (files) => {
                          const allowedTypes = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg']
                          const file = files?.[0]
                          if (!file) return true
                          if (!allowedTypes.includes(file.type)) {
                            return 'Invalid file type. Allowed: PDF, PNG, JPG, JPEG'
                          }
                          return true
                        },
                        fileSize: (files) => {
                          const file = files?.[0]
                          if (!file) return true
                          if (file.size > 5 * 1024 * 1024) {
                            return 'File size must be less than 5MB'
                          }
                          return true
                        },
                      },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Upload Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/student')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {renderDetailModal()}
      </>
    )
  }

  if (view === 'certificates') {
    if (loading) {
      return <Loader />
    }

    return (
      <>
        <div>
          <PageHeader title="My Certificates" subtitle="Manage your certificates" />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {certificates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No certificates uploaded yet</p>
                <p className="text-gray-400 text-sm mb-6">Upload your first certificate to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {certificates.map((cert) => (
                      <tr key={cert._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{cert.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{cert.organization}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(cert.issueDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(cert.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(cert)}
                              className="text-gray-600 hover:text-gray-900"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCertificate(cert._id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {renderDetailModal()}
      </>
    )
  }

  return null
}