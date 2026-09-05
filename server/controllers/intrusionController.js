const axios = require('axios');
const storage = require('../services/storage');

const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5001';

exports.predictIntrusion = async (req, res) => {
  try {
    let flaskRes;

    if (req.file) {
      const fileName = req.file.originalname || '';
      const allowedExts = ['.csv', '.pdf', '.txt', '.log', '.json', '.doc', '.docx'];
      const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

      if (!allowedExts.includes(fileExt) && !req.file.mimetype.includes('pdf') && !req.file.mimetype.includes('text')) {
        return res.status(415).json({
          success: false,
          message: 'Unsupported file type. Accepted formats: PDF (.pdf), TXT (.txt), LOG (.log), CSV (.csv), JSON (.json), DOCX (.docx).'
        });
      }

      if (!req.file.buffer || req.file.buffer.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'The uploaded file is empty.'
        });
      }

      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype || 'text/csv'
      });

      flaskRes = await axios.post(`${FLASK_URL}/predictintrusion`, form, {
        headers: form.getHeaders(),
        timeout: 15000
      });
    } else if (req.body && (Array.isArray(req.body) || typeof req.body === 'object')) {
      const payloadString = JSON.stringify(req.body);
      if (payloadString === '{}' || payloadString === '[]') {
        return res.status(400).json({
          success: false,
          message: 'Request payload cannot be empty.'
        });
      }

      flaskRes = await axios.post(`${FLASK_URL}/predictintrusion`, req.body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'No file or valid JSON payload uploaded.'
      });
    }

    const data = flaskRes.data;

    if (!data || data.success === false) {
      return res.status(400).json({
        success: false,
        message: data.message || 'Intrusion scan failed.',
        missing_columns: data.missing_columns
      });
    }

    // Store scan summary using authentic schema
    const newScan = {
      id: 'scan-' + Date.now(),
      userId: req.user ? req.user.id : 'anonymous',
      type: 'Intrusion Detection',
      filename: req.file ? req.file.originalname : 'Preset Sample Payload',
      totalRecords: data.total_records || 0,
      normalRecords: data.safe_records || 0,
      maliciousRecords: data.threats_detected || 0,
      attackDistribution: data.attack_distribution || {},
      riskDistribution: data.risk_summary || {},
      mainAttackCategory: data.main_attack_category || 'Normal',
      overallRisk: data.overall_risk || 'Low',
      averageConfidence: data.average_confidence || 0,
      timestamp: new Date().toISOString()
    };

    storage.addScan(newScan);

    return res.json({
      success: true,
      scanId: newScan.id,
      ...data
    });
  } catch (err) {
    if (err.response) {
      // Forward Flask's status code and error details directly
      return res.status(err.response.status).json(
        err.response.data || {
          success: false,
          message: 'Error returned from ML microservice.'
        }
      );
    }

    // Flask connection error or timeout
    return res.status(503).json({
      success: false,
      message: 'The intrusion detection service is currently unavailable. Please start the Flask ML service and try again.'
    });
  }
};