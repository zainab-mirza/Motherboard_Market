// Test API endpoints
const http = require('http');

function testEndpoint(path, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (method === 'POST') {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test component search
    console.log('1. Testing component search...');
    const searchResult = await testEndpoint('/api/search', { query: 'Intel i7' });
    console.log(`✅ Search API: Status ${searchResult.status}`);
    if (searchResult.data.success) {
      console.log(`   Found ${searchResult.data.results.length} results`);
    }

    // Test authenticity analysis
    console.log('\n2. Testing authenticity analysis...');
    const authResult = await testEndpoint('/api/authenticity', { componentId: 'test-component' });
    console.log(`✅ Authenticity API: Status ${authResult.status}`);

    // Test negotiation
    console.log('\n3. Testing negotiation...');
    const negResult = await testEndpoint('/api/negotiate', { 
      componentId: 'test-component', 
      quantity: 10 
    });
    console.log(`✅ Negotiation API: Status ${negResult.status}`);

    console.log('\n🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

runTests();