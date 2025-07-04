// Test con prompt muy específico para forzar el uso del contexto
console.log('=== TEST CON PROMPT ESPECÍFICO ===');

const specificPrompt = `Lee cuidadosamente el contexto proporcionado. 

En el contexto hay un documento llamado "101 Tips para Hablar con la IA". 

El tip número 9 dice exactamente: "**Dale contexto, obtendrás inteligencia**"

La descripción de este tip es: "Usa contexto para transformar respuestas genéricas en específicas."

Responde SOLO con la descripción del tip 9 que está en el contexto. No inventes nada.`;

console.log('Prompt específico:', specificPrompt);
console.log('\nEste prompt debería forzar al agente a:');
console.log('1. Leer el contexto');
console.log('2. Encontrar el tip 9');
console.log('3. Responder con la descripción exacta');
console.log('4. NO inventar información sobre Dale Cooper');

console.log('\nPara probar esto:');
console.log('1. Ve a la aplicación');
console.log('2. Selecciona el agente GHOST');
console.log('3. Selecciona el contexto del proyecto');
console.log('4. Copia y pega el prompt específico de arriba');
console.log('5. Verifica si responde correctamente'); 