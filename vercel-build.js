import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building EFS Platform for Vercel...');

try {
  // Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Install and build server
  console.log('🔧 Building server...');
  execSync('npm install', { cwd: 'server', stdio: 'inherit' });
  
  const serverDir = path.join(process.cwd(), 'server');
  const serverPackage = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
  
  console.log('🎨 Building client...');
  execSync('npm install', { cwd: 'client', stdio: 'inherit' });
  execSync('npm run build', { cwd: 'client', stdio: 'inherit' });
  
  const apiDir = path.join(process.cwd(), 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  console.log('📁 Setting up API...');
  const apiEntry = path.join(apiDir, 'index.js');
  
  const serverEntry = path.join(serverDir, serverPackage.main || 'index.js');
  
  if (fs.existsSync(serverEntry)) {
    console.log(`📄 Copying ${serverEntry} to ${apiEntry}`);
    
    const content = fs.readFileSync(serverEntry, 'utf8');
    
    fs.writeFileSync(apiEntry, `
// Vercel Serverless Function wrapper
const server = require('../${serverEntry.replace(process.cwd() + '/', '')}');
const app = server.app || server;

// Export as Vercel Function
module.exports = (req, res) => {
  req.url = req.url.replace(/^\\/api/, '');
  return app(req, res);
};
`);
  } else {
    console.log('📄 Creating default API entry...');
    fs.writeFileSync(apiEntry, `
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from EFS Platform API' });
});


app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Vercel Serverless Functions
module.exports = (req, res) => {
  req.url = req.url.replace(/^\\/api/, '');
  return app(req, res);
};

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
  });
}
`);
  }
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
