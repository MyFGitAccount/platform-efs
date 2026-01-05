import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  console.log('📁 Loaded .env file for development');
} else {
  console.log('🚀 Running in production mode, using Vercel environment variables');
}
const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for Vercel
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Production: allow specific origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://platform-efs.vercel.app', // Change to your Vercel domain
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import routes - IMPORTANT: Use dynamic imports for Vercel compatibility
import('./routes/index.js').then(module => {
  app.use('/api', module.default);
}).catch(err => {
  console.error('Failed to load index routes:', err);
});

import('./routes/auth.js').then(module => {
  app.use('/api/auth', module.default);
}).catch(err => {
  console.error('Failed to load auth routes:', err);
});

import('./routes/admin.js').then(module => {
  app.use('/api/admin', module.default);
}).catch(err => {
  console.error('Failed to load admin routes:', err);
});

import('./routes/courses.js').then(module => {
  app.use('/api/courses', module.default);
}).catch(err => {
  console.error('Failed to load courses routes:', err);
});

import('./routes/calendar.js').then(module => {
  app.use('/api/calendar', module.default);
}).catch(err => {
  console.error('Failed to load calendar routes:', err);
});

import('./routes/dashboard.js').then(module => {
  app.use('/api/dashboard', module.default);
}).catch(err => {
  console.error('Failed to load dashboard routes:', err);
});

import('./routes/group.js').then(module => {
  app.use('/api/group', module.default);
}).catch(err => {
  console.error('Failed to load group routes:', err);
});

import('./routes/materials.js').then(module => {
  app.use('/api/materials', module.default);
}).catch(err => {
  console.error('Failed to load materials routes:', err);
});

import('./routes/profile.js').then(module => {
  app.use('/api/profile', module.default);
}).catch(err => {
  console.error('Failed to load profile routes:', err);
});

import('./routes/questionnaire.js').then(module => {
  app.use('/api/questionnaire', module.default);
}).catch(err => {
  console.error('Failed to load questionnaire routes:', err);
});

import('./routes/upload.js').then(module => {
  app.use('/api/upload', module.default);
}).catch(err => {
  console.error('Failed to load upload routes:', err);
});

import('./routes/me.js').then(module => {
  app.use('/api/me', module.default);
}).catch(err => {
  console.error('Failed to load me routes:', err);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'EFS API Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Welcome to EFS Platform API',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      calendar: '/api/calendar',
      group: '/api/group',
      questionnaire: '/api/questionnaire',
      materials: '/api/materials',
      dashboard: '/api/dashboard',
      profile: '/api/profile',
      admin: '/api/admin',
      upload: '/api/upload'
    },
    version: '1.0.0'
  });
});

// 404 handler for API routes
app.use('/api',(req, res) => {
  res.status(404).json({ 
    ok: false, 
    error: 'API endpoint not found',
    path: req.originalUrl 
  });
});

// Catch-all route for SPA
app.get(/.*/, (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      ok: false,
      error: 'API endpoint not found'
    });
  }
  
  // For non-API routes, this would typically serve your SPA
  // But since we're using Vercel with separate frontend, we'll just return info
  res.json({
    ok: true,
    message: 'EFS Platform API Server',
    note: 'Frontend should be served separately'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      ok: false,
      error: 'CORS Error: Origin not allowed'
    });
  }
  
  res.status(err.status || 500).json({
    ok: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Vercel requires module.exports for serverless functions
// But we also keep app.listen for local development

/*
// For local development only
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
  });
}
*/

// Export for Vercel serverless functions
export default app;
