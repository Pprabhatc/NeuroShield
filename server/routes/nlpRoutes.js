const express = require('express');
const router = express.Router();
const { detectScam, analyzeEmail } = require('../controllers/nlpController');
const { protect } = require('../middleware/authMiddleware');

router.post('/detect-scam', protect, detectScam);
router.post('/scam', protect, detectScam);
router.post('/analyze-email', protect, analyzeEmail);

module.exports = router;
