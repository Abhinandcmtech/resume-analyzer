const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadResume, getHistory } = require('../controllers/resumeController');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/upload', authMiddleware, upload.single('resume'), uploadResume);
router.get('/history', authMiddleware, getHistory);

module.exports = router;
