const express = require('express');
const router = express.Router();
const multer = require('multer');
const authenticate = require('../middleware/auth');
const {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume
} = require('../controllers/resumeController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'), false);
    }
  }
});

router.post('/upload', authenticate, upload.single('resume'), uploadResume);
router.get('/', authenticate, getResumes);
router.get('/:id', authenticate, getResumeById);
router.delete('/:id', authenticate, deleteResume);

module.exports = router;
