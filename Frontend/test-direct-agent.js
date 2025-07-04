// Test directo del agente para debug del contexto
const fetch = require('node-fetch');

async function testDirectAgent() {
    console.log('=== TEST DIRECTO DEL AGENTE ===\n');

    try {
        // Test 1: Cargar contexto
        console.log('1. Cargando contexto...');
        const contextResponse = await fetch('http://localhost:3000/api/projects/context?path=GHOST_Proyectos/libros/Boceto_101_Tips_para_Hablar_con_la_IA&file=GHOST_Proyectos/libros/Boceto_101_Tips_para_Hablar_con_la_IA/Ideas Tips/101 Tips para Hablar con la IA.md');
        const contextData = await contextResponse.json();
        
        if (!contextData.success) {
            console.log('❌ Error al cargar contexto:', contextData.error);
            return;
        }

        console.log('✅ Contexto cargado:', contextData.data.content.length, 'caracteres');
        
        // Verificar contenido específico
        const content = contextData.data.content;
        if (content.includes('Usa IA con empatía')) {
            console.log('✅ El contexto contiene el segundo tip correcto');
        } else {
            console.log('❌ El contexto NO contiene el segundo tip');
            console.log('Contenido encontrado:', content.substring(0, 500));
        }

        // Test 2: Preguntar al agente con prompt muy específico
        console.log('\n2. Preguntando al agente...');
        const agentResponse = await fetch('http://localhost:3000/api/ai/ghost-agent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Lee cuidadosamente el contexto proporcionado. El segundo tip en la lista se llama "Usa IA con empatía". Confirma que puedes ver este texto en el contexto respondiendo exactamente: "Sí, veo el segundo tip: Usa IA con empatía"',
                context: {
                    path: 'GHOST_Proyectos/libros/Boceto_101_Tips_para_Hablar_con_la_IA',
                    specificFile: 'GHOST_Proyectos/libros/Boceto_101_Tips_para_Hablar_con_la_IA/Ideas Tips/101 Tips para Hablar con la IA.md'
                }
            })
        });

        if (agentResponse.ok) {
            const agentData = await agentResponse.json();
            console.log('✅ Agente respondió:', agentData.response || agentData.message);
            
            // Verificar respuesta
            const response = agentData.response || agentData.message || '';
            if (response.includes('Usa IA con empatía')) {
                console.log('✅ El agente SÍ puede leer el contexto correctamente');
            } else {
                console.log('❌ El agente NO puede leer el contexto correctamente');
                console.log('Respuesta recibida:', response);
            }
        } else {
            console.log('❌ Error del agente:', agentResponse.status);
            const errorText = await agentResponse.text();
            console.log('Error:', errorText);
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Ejecutar el test
testDirectAgent().catch(console.error); 