async function testSystemStats() {
  try {
    console.log('Testing system-stats API...');
    const response = await fetch('http://localhost:3000/api/system-stats');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      console.log('Response not ok:', response.statusText);
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.error('Error testing system-stats API:', error);
  }
}

testSystemStats(); 