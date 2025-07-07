'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSimpleResponse = async () => {
    setLoading(true);
    setResult('🔄 Probando respuesta simple...');

    try {
      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Responde solo con "Hola, estoy funcionando"'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Respuesta simple recibida\n\nRespuesta completa:\n${data.response}\n\nDatos completos:\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Error: ${data.error || 'Error desconocido'}\n\nStatus: ${response.status}`);
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testFileCreation = async () => {
    setLoading(true);
    setResult('🔄 Probando creación de archivo...');

    try {
      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Crea un archivo de prueba usando EXACTAMENTE este formato:

=== FILE_OPERATION ===
{
  "type": "create_file",
  "targetProject": "Boceto_101_Tips_para_Hablar_con_la_IA",
  "fileName": "Generated_Content/debug_test.md",
  "content": "# Archivo de Debug\\n\\nEste es un archivo de prueba para debug.\\n\\nFecha: ${new Date().toLocaleString()}"
}
=== END_FILE_OPERATION ===

NO escribas nada más. SOLO el formato FILE_OPERATION.`
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Respuesta de creación recibida\n\nRespuesta completa:\n${data.response}\n\nOperaciones de archivo:\n${JSON.stringify(data.fileOperations, null, 2)}\n\nDatos completos:\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Error: ${data.error || 'Error desconocido'}\n\nStatus: ${response.status}`);
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectFileCreation = async () => {
    setLoading(true);
    setResult('🔄 Probando creación directa de archivo...');

    try {
      const response = await fetch('/api/unified-file-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createFile',
          projectPath: 'GHOST_Proyectos/libros/Boceto_101_Tips_para_Hablar_con_la_IA',
          fileName: 'Generated_Content/test_direct.md',
          content: `# Test Directo

Este archivo fue creado directamente sin el agente.

Fecha: ${new Date().toLocaleString()}

## Contenido de prueba

- Punto 1: Verificación del sistema
- Punto 2: Operaciones de archivo
- Punto 3: Funcionalidad básica

## Estado

✅ Sistema funcionando correctamente`
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Archivo creado directamente\n\nRespuesta: ${JSON.stringify(data, null, 2)}`);
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
        <h1 className="text-3xl font-bold mb-6">🧪 Test Ghost Agent</h1>
        <p className="mb-6 text-gray-600">Página de prueba para diagnosticar el problema con el Ghost Agent</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testSimpleResponse}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Test Respuesta Simple
          </button>
          
          <button
            onClick={testFileCreation}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Test Creación de Archivo
          </button>
          
          <button
            onClick={testDirectFileCreation}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Test Creación Directa
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