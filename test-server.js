// Simple test to verify the server is working
const http = require('http');

console.log('Testing server at localhost:3000...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Server responded with status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Health check response:', response);
      console.log('🚀 Server is working correctly!');
    } catch (e) {
      console.log('✅ Server responded but with non-JSON data:', data);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Server test failed:', err.message);
});

req.on('timeout', () => {
  console.log('❌ Server test timed out');
  req.destroy();
});

req.end();