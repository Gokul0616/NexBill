const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/onboarding', authController.updateOnboarding);
router.get('/verification-status', authController.getVerificationStatus);
router.post('/dismiss-banner', authController.dismissBanner);

// File Upload endpoint
router.post('/upload-onboarding-doc', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

module.exports = router;
