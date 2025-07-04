// Test script for the context finder functionality
const testContextFinder = async () => {
  console.log('Testing Context Finder API...\n');

  try {
    // Test the projects API endpoint
    console.log('1. Testing /api/projects endpoint...');
    const response = await fetch('http://localhost:3000/api/projects');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Projects API working!');
      console.log(`Found ${data.books.length} books, ${data.scripts.length} scripts, ${data.blogs.length} blogs`);
      
      // Show some sample projects
      if (data.books.length > 0) {
        console.log(`Sample book: ${data.books[0].title} (${data.books[0].type})`);
      }
      if (data.scripts.length > 0) {
        console.log(`Sample script: ${data.scripts[0].title} (${data.scripts[0].type})`);
      }
      if (data.blogs.length > 0) {
        console.log(`Sample blog: ${data.blogs[0].title} (${data.blogs[0].type})`);
      }

      // Test project context endpoint with a sample project
      console.log('\n2. Testing /api/projects/context endpoint...');
      if (data.books.length > 0) {
        const projectId = data.books[0].id;
        const contextResponse = await fetch(`http://localhost:3000/api/projects/context?id=${projectId}`);
        
        if (contextResponse.ok) {
          const contextData = await contextResponse.json();
          console.log('✅ Project context API working!');
          console.log(`Project: ${contextData.context.project.name}`);
          console.log(`Type: ${contextData.context.project.type}`);
          console.log(`Stats: ${contextData.context.stats.totalFiles} files, ${contextData.context.stats.totalWords} words`);
        } else {
          console.log('❌ Project context API failed:', contextResponse.status, contextResponse.statusText);
        }
      }
    } else {
      console.log('❌ Projects API failed:', response.status, response.statusText);
    }

  } catch (error) {
    console.log('❌ Error testing context finder:', error.message);
  }
};

// Run the test
testContextFinder(); 