// Test script for unified file manager API
// Run this in the browser console or as a Node.js script

async function testUnifiedFileManager() {
    const baseUrl = 'http://localhost:3001'; // Adjust port if needed
    const projectPath = 'GHOST_Proyectos/libros/Test_Project';
    
    console.log('Testing Unified File Manager API...');
    
    try {
        // Test 1: Get project structure
        console.log('\n1. Testing getStructure...');
        const structureResponse = await fetch(`${baseUrl}/api/unified-file-operations?projectPath=${encodeURIComponent(projectPath)}`);
        const structureData = await structureResponse.json();
        console.log('Structure response:', structureData);
        
        if (!structureData.success) {
            console.error('Failed to get structure:', structureData.message);
            return;
        }
        
        // Test 2: Create a test file
        console.log('\n2. Testing createFile...');
        const createFileResponse = await fetch(`${baseUrl}/api/unified-file-operations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'createFile',
                projectPath: projectPath,
                fileName: 'test-file.md',
                content: '# Test File\n\nThis is a test file created by the unified file manager.',
            }),
        });
        const createFileData = await createFileResponse.json();
        console.log('Create file response:', createFileData);
        
        if (!createFileData.success) {
            console.error('Failed to create file:', createFileData.message);
            return;
        }
        
        // Test 3: Create a test folder
        console.log('\n3. Testing createFolder...');
        const createFolderResponse = await fetch(`${baseUrl}/api/unified-file-operations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'createFolder',
                projectPath: projectPath,
                folderName: 'test-folder',
            }),
        });
        const createFolderData = await createFolderResponse.json();
        console.log('Create folder response:', createFolderData);
        
        if (!createFolderData.success) {
            console.error('Failed to create folder:', createFolderData.message);
            return;
        }
        
        // Test 4: Update file content
        console.log('\n4. Testing updateContent...');
        const updateResponse = await fetch(`${baseUrl}/api/unified-file-operations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updateContent',
                projectPath: projectPath,
                filePath: 'test-file.md',
                content: '# Updated Test File\n\nThis file has been updated by the unified file manager.',
            }),
        });
        const updateData = await updateResponse.json();
        console.log('Update content response:', updateData);
        
        if (!updateData.success) {
            console.error('Failed to update content:', updateData.message);
            return;
        }
        
        // Test 5: Rename file
        console.log('\n5. Testing rename...');
        const renameResponse = await fetch(`${baseUrl}/api/unified-file-operations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'rename',
                projectPath: projectPath,
                oldPath: 'test-file.md',
                newName: 'renamed-test-file.md',
            }),
        });
        const renameData = await renameResponse.json();
        console.log('Rename response:', renameData);
        
        if (!renameData.success) {
            console.error('Failed to rename file:', renameData.message);
            return;
        }
        
        // Test 6: Delete test items
        console.log('\n6. Testing delete...');
        const deleteFileResponse = await fetch(`${baseUrl}/api/unified-file-operations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                projectPath: projectPath,
                itemPath: 'renamed-test-file.md',
            }),
        });
        const deleteFileData = await deleteFileResponse.json();
        console.log('Delete file response:', deleteFileData);
        
        const deleteFolderResponse = await fetch(`${baseUrl}/api/unified-file-operations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                projectPath: projectPath,
                itemPath: 'test-folder',
            }),
        });
        const deleteFolderData = await deleteFolderResponse.json();
        console.log('Delete folder response:', deleteFolderData);
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testUnifiedFileManager(); 