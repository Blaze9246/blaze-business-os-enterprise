const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Log what's in the directory
const distPath = path.join(__dirname, 'frontend/dist');
console.log('Looking for static files at:', distPath);
console.log('Directory exists:', fs.existsSync(distPath));
if (fs.existsSync(distPath)) {
  console.log('Contents:', fs.readdirSync(distPath));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    revenue: 24500,
    tasks: 24,
    agents: 6,
    stores: 3
  });
});

// Serve static files
app.use(express.static(distPath));

// Handle SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not built. index.html not found at: ' + indexPath);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});