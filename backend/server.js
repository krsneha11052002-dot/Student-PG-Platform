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
app.use('/api/roommates', require('./routes/roommateRoutes'));
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

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
  const fs = require('fs');

  // Priority order for finding the built frontend:
  // 1. STATIC_DIR env var (set in Docker via Dockerfile)
  // 2. /app/public (Docker: copied to /app/public in Dockerfile)
  // 3. __dirname/public (same as above, relative)
  // 4. __dirname/../frontend/dist (local source-based deploy)
  const candidates = [
    process.env.STATIC_DIR,
    '/app/public',
    path.join(__dirname, 'public'),
    path.join(__dirname, '..', 'frontend', 'dist'),
    path.join(__dirname, 'frontend', 'dist'),
  ].filter(Boolean);

  const distPath = candidates.find(p => fs.existsSync(path.join(p, 'index.html')));

  if (!distPath) {
    console.error('❌ Frontend build not found! Searched:', candidates);
    console.error('   Run "npm run build" first, or check the Dockerfile COPY step.');
  } else {
    console.log(`📁 Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
          console.error(`❌ Could not serve index.html:`, err.message);
          res.status(500).json({ error: 'Frontend build not found.' });
        }
      });
    });
  }
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
