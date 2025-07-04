// Debug script for chat functionality
console.log('Debug: Testing chat component...');

// Test if we can access the component
const testChatComponent = () => {
  console.log('Debug: Chat component test started');
  
  // Check if the component is mounted
  const chatButton = document.querySelector('button[aria-label="Toggle chat"]');
  if (chatButton) {
    console.log('✅ Chat button found');
    
    // Click the chat button to open the drawer
    chatButton.click();
    console.log('Debug: Chat button clicked');
    
    // Wait a bit and check if drawer opened
    setTimeout(() => {
      const drawer = document.querySelector('.fixed.top-0.right-0');
      if (drawer) {
        console.log('✅ Chat drawer opened');
        
        // Check for input field
        const input = drawer.querySelector('input[placeholder*="Message"]');
        if (input) {
          console.log('✅ Message input found');
          console.log('Input value:', input.value);
          console.log('Input disabled:', input.disabled);
          
          // Test typing
          input.value = 'Test message';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          console.log('Debug: Test message typed');
          
          // Check for send button
          const sendButton = drawer.querySelector('button[title="Send message"]');
          if (sendButton) {
            console.log('✅ Send button found');
            console.log('Send button disabled:', sendButton.disabled);
          } else {
            console.log('❌ Send button not found');
          }
        } else {
          console.log('❌ Message input not found');
        }
      } else {
        console.log('❌ Chat drawer not found');
      }
    }, 1000);
  } else {
    console.log('❌ Chat button not found');
  }
};

// Run the test when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testChatComponent);
} else {
  testChatComponent();
}

console.log('Debug: Test script loaded'); 