const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB, getMongoStatus } = require('./config/db');

dotenv.config();

const app = express();

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect Database (Async with Mongo or fallback)
connectDB();

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pgs', require('./routes/pgRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'StaySmart AI Backend',
    database: getMongoStatus() ? 'MongoDB Connected' : 'In-Memory Store Active',
    timestamp: new Date().toISOString()
  });
});

// Serve Static Frontend Assets in Production
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  // In Docker: __dirname = /app, frontend/dist is at /app/frontend/dist
  // In local dev: __dirname = /path/to/project/backend, dist is at ../frontend/dist
  const dockerDistPath = path.resolve(__dirname, 'frontend', 'dist');
  const localDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');
  const fs = require('fs');
  const distPath = fs.existsSync(dockerDistPath) ? dockerDistPath : localDistPath;
  console.log(`📁 Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`❌ Could not serve index.html:`, err.message);
        res.status(500).json({ error: 'Frontend build not found. Run npm run build first.' });
      }
    });
  });
} else {
  // 404 Route Handler for Dev
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API Route Not Found' });
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 StaySmart AI Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
