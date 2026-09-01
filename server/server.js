const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Connect DB (with file fallback)
connectDB();

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/intrusion', require('./routes/intrusionRoutes'));
app.use('/api/nlp', require('./routes/nlpRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/model', require('./routes/modelRoutes'));

// Root Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'NeuroShield IDS Backend API',
    timestamp: new Date().toISOString()
  });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`NeuroShield Express Server running on http://localhost:${PORT}`);
});
