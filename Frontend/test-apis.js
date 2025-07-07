async function testAPIs() {
  const endpoints = [
    '/api/system-stats',
    '/api/agents/status'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint}...`);
      const response = await fetch(`http://localhost:3000${endpoint}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));
      } else {
        console.log('Response not ok:', response.statusText);
        const text = await response.text();
        console.log('Response text:', text.substring(0, 500) + '...');
      }
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error.message);
    }
  }
}

// Wait a bit for the server to start
setTimeout(testAPIs, 5000); 