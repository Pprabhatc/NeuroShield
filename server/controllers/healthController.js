const axios = require('axios');

const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5001';

exports.getHealth = async (req, res) => {
  let flaskStatus = 'offline';
  let modelStatus = 'unavailable';

  try {
    const flaskRes = await axios.get(`${FLASK_URL}/health`, { timeout: 2000 });
    if (flaskRes.data && flaskRes.data.status === 'online') {
      flaskStatus = 'online';
      modelStatus = flaskRes.data.models_loaded ? 'loaded' : 'unloaded';
    }
  } catch (err) {
    flaskStatus = 'offline';
    modelStatus = 'unavailable';
  }

  res.json({
    success: true,
    services: {
      express: 'online',
      flask: flaskStatus,
      model: modelStatus
    }
  });
};
