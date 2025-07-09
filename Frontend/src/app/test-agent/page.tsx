'use client';

import { useState } from 'react';

export default function TestAgentPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAgentFileCreation = async () => {
    setLoading(true);
    setResult('🔄 Probando creación de archivo con el agente...');

    const currentDate = new Date().toLocaleString();
    const message = `IMPORTANTE: Responde SOLO con el formato FILE_OPERATION. NO escribas nada más.

Crea un archivo con este contenido exacto:

=== FILE_OPERATION ===
{
  "type": "create_file",
  "targetProject": "Boceto_101_Tips_para_Hablar_con_la_IA",
  "fileName": "Generated_Content/agent_test.md",
  "content": "# Test del Agente\\n\\nEste archivo fue creado por el agente Ghost.\\n\\n## Información\\n- Creado: ${currentDate}\\n- Método: Agente Ghost\\n- Estado: Funcionando\\n\\n## Verificación\\n✅ El agente está operativo\\n✅ Los archivos se crean correctamente\\n✅ El formato FILE_OPERATION funciona\\n\\n## Conclusión\\nEl agente está funcionando perfectamente."
}
=== END_FILE_OPERATION ===

SOLO responde con el formato FILE_OPERATION. NADA MÁS.`;

    try {
      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Respuesta recibida\n\nRespuesta completa:\n${data.response}\n\nOperaciones de archivo:\n${JSON.stringify(data.fileOperations, null, 2)}\n\nDatos completos:\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Error: ${data.error || 'Error desconocido'}\n\nStatus: ${response.status}`);
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testSimplePrompt = async () => {
    setLoading(true);
    setResult('🔄 Probando prompt simple...');

    try {
      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Crea un archivo de prueba llamado test_simple.md con el contenido "Hola mundo" usando el formato FILE_OPERATION.'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Respuesta recibida\n\nRespuesta completa:\n${data.response}\n\nOperaciones de archivo:\n${JSON.stringify(data.fileOperations, null, 2)}\n\nDatos completos:\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Error: ${data.error || 'Error desconocido'}\n\nStatus: ${response.status}`);
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Test Agente - Creación de Archivos</h1>
        <p className="mb-6 text-gray-600">Pruebas del agente Ghost para crear archivos</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={testAgentFileCreation}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Test Agente Completo
          </button>
          
          <button
            onClick={testSimplePrompt}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Test Prompt Simple
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Resultados:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
            {result || 'Haz clic en un botón para comenzar las pruebas...'}
          </pre>
        </div>
      </div>
    </div>
  );
} 