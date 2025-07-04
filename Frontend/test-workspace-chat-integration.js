// Test script to verify workspace-chat integration
const testWorkspaceChatIntegration = async () => {
  console.log('🧪 Testing Workspace-Chat Integration...');
  
  try {
    // 1. Test if the development server is running
    console.log('1️⃣ Testing development server...');
    const response = await fetch('/api/projects');
    if (response.ok) {
      console.log('✅ Development server is running');
    } else {
      console.log('❌ Development server not responding');
      return;
    }

    // 2. Test project loading
    console.log('2️⃣ Testing project loading...');
    const projectsResponse = await fetch('/api/projects');
    if (projectsResponse.ok) {
      const projects = await projectsResponse.json();
      console.log('✅ Projects loaded:', projects);
    } else {
      console.log('❌ Failed to load projects');
    }

    // 3. Test chat sessions
    console.log('3️⃣ Testing chat sessions...');
    const chatsResponse = await fetch('/api/chats');
    if (chatsResponse.ok) {
      const chats = await chatsResponse.json();
      console.log('✅ Chat sessions loaded:', chats);
    } else {
      console.log('❌ Failed to load chat sessions');
    }

    // 4. Test workspace refresh event
    console.log('4️⃣ Testing workspace refresh event...');
    let eventReceived = false;
    const eventListener = () => {
      eventReceived = true;
      console.log('✅ Workspace refresh event received');
    };
    
    window.addEventListener('workspace-refresh', eventListener);
    
    // Dispatch a test event
    window.dispatchEvent(new CustomEvent('workspace-refresh', {
      detail: {
        projectId: 'test-project',
        projectPath: 'GHOST_Proyectos/libros/test-project',
        timestamp: Date.now()
      }
    }));
    
    // Wait a bit for the event to be processed
    setTimeout(() => {
      if (eventReceived) {
        console.log('✅ Workspace refresh event system working');
      } else {
        console.log('❌ Workspace refresh event not received');
      }
      window.removeEventListener('workspace-refresh', eventListener);
    }, 1000);

    // 5. Test context finder functionality
    console.log('5️⃣ Testing context finder...');
    const contextFinderButton = document.querySelector('button[title*="context"]');
    if (contextFinderButton) {
      console.log('✅ Context finder button found');
      // Don't click it automatically as it might interfere with user interaction
    } else {
      console.log('❌ Context finder button not found');
    }

    console.log('🎉 Integration test completed!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
};

// Run the test when the page loads
if (typeof window !== 'undefined') {
  // Wait for the page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testWorkspaceChatIntegration);
  } else {
    testWorkspaceChatIntegration();
  }
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testWorkspaceChatIntegration };
} 