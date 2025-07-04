// Test script for move item functionality
const testMoveItem = async () => {
    console.log('=== Testing Move Item Functionality ===');
    
    // Test data
    const testData = {
        projectRootPath: 'GHOST_Proyectos/libros/Test_Project',
        itemId: 'test-item-id',
        targetParentId: 'target-folder-id'
    };
    
    try {
        console.log('Sending move request:', testData);
        
        const response = await fetch('/api/workspace/moveItem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData),
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Move successful:', data);
        } else {
            const error = await response.json();
            console.error('Move failed:', error);
        }
    } catch (error) {
        console.error('Test error:', error);
    }
};

// Run test if in browser environment
if (typeof window !== 'undefined') {
    window.testMoveItem = testMoveItem;
    console.log('Move item test function available as window.testMoveItem()');
}

module.exports = { testMoveItem }; 