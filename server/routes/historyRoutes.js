const express = require('express');
const router = express.Router();
const { getHistory, deleteScan, exportCSV } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getHistory);
router.delete('/:id', protect, deleteScan);
router.get('/export', protect, exportCSV);

module.exports = router;
