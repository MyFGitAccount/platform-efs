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
  
  // Install and build client
  console.log('🎨 Building client...');
  execSync('npm install', { cwd: 'client', stdio: 'inherit' });
  execSync('npm run build', { cwd: 'client', stdio: 'inherit' });
  
  // Create api directory if it doesn't exist
  const apiDir = path.join(process.cwd(), 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
