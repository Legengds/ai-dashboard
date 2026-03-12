const express = require('express');
const cors = require('cors');
const path = require('path');
const trackingRoutes = require('./routes/tracking');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dashboard dist
app.use(express.static(path.join(__dirname, '..', '..', 'dashboard', 'dist')));

// API Routes
app.use('/api/tracking', trackingRoutes);

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'dashboard', 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
