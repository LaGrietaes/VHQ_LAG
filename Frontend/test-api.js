// Simple test script to verify API endpoints
const testAPI = async () => {
  console.log('Testing Agent Status API...')
  
  try {
    // Test status endpoint
    const statusResponse = await fetch('http://localhost:3000/api/agents/status')
    const statusData = await statusResponse.json()
    console.log('Status API Response:', statusData)
    
    // Test control endpoint (start Ghost agent)
    console.log('\nTesting Agent Control API (starting Ghost agent)...')
    const controlResponse = await fetch('http://localhost:3000/api/agents/control', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agentId: 'GHOST_AGENT', action: 'start' }),
    })
    const controlData = await controlResponse.json()
    console.log('Control API Response:', controlData)
    
  } catch (error) {
    console.error('API Test Error:', error)
  }
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testAPI()
}

module.exports = { testAPI } 