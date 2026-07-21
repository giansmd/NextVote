require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dummyTrafficService = require('./services/dummy-traffic.service');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NextVote API is running' });
});

const apiRoutes = require('./routes/index');

app.use('/api', apiRoutes);

// Handling 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, async () => {
  console.log(`🚀 NextVote Server running on port ${PORT}`);
  try {
    await dummyTrafficService.recoverActiveElections();
  } catch (err) {
    console.error('Error recovering active elections for dummy traffic:', err);
  }
});