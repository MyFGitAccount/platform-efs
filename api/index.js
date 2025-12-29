import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/hello', (req, res) => {
  res.json({ 
    message: 'Hello from EFS Platform API',
    version: '1.0.0'
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'EFS Platform API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: ['/health', '/hello']
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.originalUrl,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

export default (req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  const originalUrl = req.url;
  req.url = req.url.replace(/^\/api/, '') || '/';
  
  if (req.url === '') {
    req.url = '/';
  }
  
  console.log(`Rewritten: ${originalUrl} -> ${req.url}`);
  
  return app(req, res);
};
