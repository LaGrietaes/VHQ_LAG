// Simple script to check if Tips_Generados directory exists
const fs = require('fs');
const path = require('path');

const projectPath = 'GHOST_Proyectos/libros/Boceto_101_Tips_para_Hablar_con_la_IA';
const tipsDir = path.join(projectPath, 'Tips_Generados');

console.log('🔍 Checking directory structure...');
console.log('Project path:', projectPath);
console.log('Tips directory:', tipsDir);

// Check if project directory exists
if (fs.existsSync(projectPath)) {
    console.log('✅ Project directory exists');
    
    // Check if Tips_Generados directory exists
    if (fs.existsSync(tipsDir)) {
        console.log('✅ Tips_Generados directory exists');
        
        // List files in Tips_Generados
        const files = fs.readdirSync(tipsDir);
        console.log('📁 Files in Tips_Generados:', files.length);
        
        if (files.length > 0) {
            console.log('📄 Files:');
            files.forEach(file => {
                const filePath = path.join(tipsDir, file);
                const stats = fs.statSync(filePath);
                console.log(`  - ${file} (${stats.size} bytes)`);
            });
        } else {
            console.log('📁 Directory is empty');
        }
    } else {
        console.log('❌ Tips_Generados directory does not exist');
        console.log('💡 Use the "Crear Directorio" button in the Simple Book Generator');
    }
} else {
    console.log('❌ Project directory does not exist');
    console.log('💡 Make sure you have the correct project path');
}

console.log('\n🎯 To create the directory:');
console.log('1. Open the Simple Book Generator');
console.log('2. Click "Crear Directorio" button');
console.log('3. Or use any of the generation buttons (they create the directory automatically)'); 