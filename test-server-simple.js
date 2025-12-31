const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Simple server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});