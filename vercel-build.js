import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building EFS Platform for Vercel...');

try {
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🔧 Installing server dependencies...');
  execSync('npm install', { cwd: 'server', stdio: 'inherit' });
  
  console.log('🎨 Building client...');
  execSync('npm install', { cwd: 'client', stdio: 'inherit' });
  execSync('npm run build', { cwd: 'client', stdio: 'inherit' });
  
  const apiDir = path.join(process.cwd(), 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  console.log('📁 Creating ES Module API entry...');
  const apiEntry = path.join(apiDir, 'index.js');
  
  fs.writeFileSync(apiEntry, `
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes from server
import authRoutes from '../server/routes/auth.js';
import adminRoutes from '../server/routes/admin.js';
import coursesRoutes from '../server/routes/courses.js';
import dashboardRoutes from '../server/routes/dashboard.js';
import groupRoutes from '../server/routes/group.js';
import materialsRoutes from '../server/routes/materials.js';
import profileRoutes from '../server/routes/profile.js';
import uploadRoutes from '../server/routes/upload.js';
import questionnaireRoutes from '../server/routes/questionnaire.js';
import calendarRoutes from '../server/routes/calendar.js';
import meRoutes from '../server/routes/me.js';

// Use routes with /api prefix
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/courses', coursesRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/group', groupRoutes);
app.use('/materials', materialsRoutes);
app.use('/profile', profileRoutes);
app.use('/upload', uploadRoutes);
app.use('/questionnaire', questionnaireRoutes);
app.use('/calendar', calendarRoutes);
app.use('/me', meRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root API endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'EFS Platform API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/auth',
      '/admin',
      '/courses',
      '/dashboard',
      '/group',
      '/materials',
      '/profile',
      '/upload',
      '/questionnaire',
      '/calendar',
      '/me',
      '/health'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.originalUrl,
    method: req.method
  });
});

// Vercel Serverless Function handler
export default (req, res) => {
  // Log the request
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  
  // Remove /api prefix for route matching
  const originalUrl = req.url;
  req.url = req.url.replace(/^\\/api/, '') || '/';
  
  // If empty after removing prefix, set to root
  if (req.url === '') {
    req.url = '/';
  }
  
  console.log(\`Rewritten: \${originalUrl} -> \${req.url}\`);
  
  // Handle the request
  return app(req, res);
};
`);

  const apiPackagePath = path.join(apiDir, 'package.json');
  if (!fs.existsSync(apiPackagePath)) {
    fs.writeFileSync(apiPackagePath, JSON.stringify({
      name: "efs-platform-api",
      version: "1.0.0",
      type: "module",
      dependencies: {
        "express": "^5.2.1",
        "cors": "^2.8.5",
        "dotenv": "^17.2.3"
      }
    }, null, 2));
  }
  
  const envSource = path.join(process.cwd(), '.env');
  const envDest = path.join(apiDir, '.env');
  if (fs.existsSync(envSource)) {
    fs.copyFileSync(envSource, envDest);
    console.log('📋 Copied .env file');
  }
  
  const serverEnvSource = path.join(process.cwd(), 'server', '.env');
  if (fs.existsSync(serverEnvSource)) {
    fs.copyFileSync(serverEnvSource, envDest);
    console.log('📋 Copied server/.env file');
  }
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
