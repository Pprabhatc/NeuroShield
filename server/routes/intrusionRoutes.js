const express = require('express');
const router = express.Router();
const multer = require('multer');
const { predictIntrusion } = require('../controllers/intrusionController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/predict', protect, upload.single('file'), predictIntrusion);

module.exports = router;
