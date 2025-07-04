// Test script to verify API routes are working
const testAPIRoutes = async () => {
    console.log('=== Testing API Routes ===');
    
    const baseURL = 'http://localhost:3000';
    
    // Test 1: Check if renameItem route exists
    try {
        console.log('Testing renameItem route...');
        const response = await fetch(`${baseURL}/api/workspace/renameItem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectRootPath: 'GHOST_Proyectos/libros/Test_Project',
                itemId: 'test-id',
                newTitle: 'test-title'
            }),
        });
        
        console.log('renameItem response status:', response.status);
        if (response.status === 404) {
            console.error('❌ renameItem route not found');
        } else {
            console.log('✅ renameItem route exists');
        }
    } catch (error) {
        console.error('❌ renameItem test failed:', error);
    }
    
    // Test 2: Check if moveItem route exists
    try {
        console.log('Testing moveItem route...');
        const response = await fetch(`${baseURL}/api/workspace/moveItem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectRootPath: 'GHOST_Proyectos/libros/Test_Project',
                itemId: 'test-id',
                targetParentId: 'target-id'
            }),
        });
        
        console.log('moveItem response status:', response.status);
        if (response.status === 404) {
            console.error('❌ moveItem route not found');
        } else {
            console.log('✅ moveItem route exists');
        }
    } catch (error) {
        console.error('❌ moveItem test failed:', error);
    }
    
    // Test 3: Check if addItem route exists
    try {
        console.log('Testing addItem route...');
        const response = await fetch(`${baseURL}/api/workspace/addItem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectRootPath: 'GHOST_Proyectos/libros/Test_Project',
                parentId: null,
                item: { id: 'test', title: 'test', type: 'file' }
            }),
        });
        
        console.log('addItem response status:', response.status);
        if (response.status === 404) {
            console.error('❌ addItem route not found');
        } else {
            console.log('✅ addItem route exists');
        }
    } catch (error) {
        console.error('❌ addItem test failed:', error);
    }
};

// Run test if in browser environment
if (typeof window !== 'undefined') {
    window.testAPIRoutes = testAPIRoutes;
    console.log('API routes test function available as window.testAPIRoutes()');
}

module.exports = { testAPIRoutes }; 