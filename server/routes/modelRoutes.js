const express = require('express');
const router = express.Router();
const { getModelPerformance } = require('../controllers/modelController');

router.get('/performance', getModelPerformance);

module.exports = router;
