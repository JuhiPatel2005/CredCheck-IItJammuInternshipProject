import multer from 'multer'

const ALLOWED_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf']

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF, PNG, JPG, and JPEG files are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

export default upload