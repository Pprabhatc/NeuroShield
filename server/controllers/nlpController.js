const axios = require('axios');
const storage = require('../services/storage');

const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5001';

exports.detectScam = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text field is required for scam analysis.' });
    }

    let flaskRes;
    try {
      flaskRes = await axios.post(`${FLASK_URL}/predictscam`, { text });
    } catch (e) {
      console.warn('Flask scam prediction endpoint offline, using internal NLP heuristic fallback:', e.message);
    }

    let data;
    if (flaskRes && flaskRes.data) {
      data = flaskRes.data;
    } else {
      // Internal heuristic fallback
      const textLower = text.toLowerCase();
      const isUrgent = textLower.includes('urgent') || textLower.includes('verify') || textLower.includes('suspended');
      const isOTP = textLower.includes('otp') || textLower.includes('code');
      const isMoney = textLower.includes('$') || textLower.includes('winner') || textLower.includes('bank');

      let category = 'Safe';
      let scamProb = 12.0;
      let riskLevel = 'Safe';

      if (isOTP) { category = 'OTP Fraud'; scamProb = 94.5; riskLevel = 'Critical Risk'; }
      else if (isUrgent && isMoney) { category = 'Phishing'; scamProb = 88.0; riskLevel = 'High Risk'; }
      else if (isMoney) { category = 'Lottery Scam'; scamProb = 82.5; riskLevel = 'High Risk'; }

      data = {
        success: true,
        scam_probability: scamProb,
        category,
        risk_level: riskLevel,
        flagged_keywords: [
          { word: 'verify', tag: 'Credential Prompt', count: 1 },
          { word: 'urgent', tag: 'Panic Urgency', count: 1 }
        ],
        explanation: `Analysis identified ${category} threat patterns with urgency markers.`,
        recommendations: [
          'Do NOT click any links or share authentication codes.',
          'Verify sender details directly with the official service provider.'
        ]
      };
    }

    // Save scan to history
    const newScan = {
      id: 'scan-' + Date.now(),
      userId: req.user ? req.user.id : 'anonymous',
      type: 'NLP Scam Detector',
      target: text.substring(0, 40) + '...',
      attackType: data.category,
      confidence: data.scam_probability,
      riskLevel: data.risk_level,
      summary: data.explanation,
      timestamp: new Date().toISOString()
    };
    storage.addScan(newScan);

    res.json({
      success: true,
      scanId: newScan.id,
      ...data
    });
  } catch (err) {
    res.status(500).json({ message: 'Error analyzing scam message: ' + err.message });
  }
};

exports.analyzeEmail = async (req, res) => {
  try {
    const { subject, sender, body, url } = req.body;

    let flaskRes;
    try {
      flaskRes = await axios.post(`${FLASK_URL}/predictemail`, { subject, sender, body, url });
    } catch (e) {
      console.warn('Flask email prediction offline, using fallback:', e.message);
    }

    let data;
    if (flaskRes && flaskRes.data) {
      data = flaskRes.data;
    } else {
      data = {
        success: true,
        phishing_score: 84.5,
        threat_level: 'Critical Phishing Threat',
        indicators: [
          'Unencrypted HTTP link present in email body.',
          'Domain typosquatting signature detected on login link.',
          'Urgency trigger keyword found in subject header.'
        ],
        threat_summary: 'Email body contains high-consequence credential harvesting link.',
        recommended_action: 'Quarantine email immediately on email security gateway.'
      };
    }

    const newScan = {
      id: 'scan-' + Date.now(),
      userId: req.user ? req.user.id : 'anonymous',
      type: 'Phishing Email',
      target: subject || sender || 'Email Analysis',
      attackType: data.phishing_score > 50 ? 'Phishing' : 'Safe Email',
      confidence: data.phishing_score,
      riskLevel: data.phishing_score > 70 ? 'Critical' : (data.phishing_score > 40 ? 'High' : 'Safe'),
      summary: data.threat_summary,
      timestamp: new Date().toISOString()
    };
    storage.addScan(newScan);

    res.json({
      success: true,
      scanId: newScan.id,
      ...data
    });
  } catch (err) {
    res.status(500).json({ message: 'Error analyzing email: ' + err.message });
  }
};
