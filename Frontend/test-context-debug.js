// Test simple para verificar el problema del contexto
console.log('=== TEST DE CONTEXTO ===');

// Simular la pregunta que debería responder correctamente
const expectedContext = `9. **Dale contexto, obtendrás inteligencia**  
   Usa contexto para transformar respuestas genéricas en específicas.`;

console.log('Contexto esperado:', expectedContext);
console.log('El agente debería responder con la descripción del tip 9');
console.log('Pero está respondiendo sobre Dale Cooper de Twin Peaks');
console.log('Esto confirma que el agente está alucinando completamente');

// Verificar que el contexto está en los logs
console.log('\nEn los logs vemos:');
console.log('- Context content length: 12906 ✅');
console.log('- El contexto contiene el tip 9 correctamente ✅');
console.log('- Pero el agente responde sobre Twin Peaks ❌');

console.log('\n=== DIAGNÓSTICO ===');
console.log('El problema es que el agente está ignorando el contexto');
console.log('y usando su conocimiento previo en lugar del contexto proporcionado'); 