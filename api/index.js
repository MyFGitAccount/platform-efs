
export default (req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  
  // Health check endpoint
  if (req.url === '/api/health' || req.url === '/api') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'API is working',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'production'
    }));
  }
  
  // Test other API endpoints
  if (req.url.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify({ 
      endpoint: req.url,
      method: req.method,
      working: true,
      timestamp: new Date().toISOString()
    }));
  }
  
  // Root path
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.statusCode = 200;
    return res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>EFS Platform</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            h1 { color: #333; }
            .endpoints { background: #f5f5f5; padding: 20px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>EFS Platform API</h1>
            <p>API is running successfully!</p>
            <div class="endpoints">
              <h3>Test endpoints:</h3>
              <ul>
                <li><a href="/api/health">/api/health</a> - Health check</li>
                <li><a href="/api/test">/api/test</a> - Test endpoint</li>
                <li><a href="/">Frontend</a></li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `);
  }
  
  // 404 handler
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 404;
  res.end(JSON.stringify({ 
    error: 'Not Found',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  }));
};
