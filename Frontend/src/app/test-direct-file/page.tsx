'use client';

import { useState } from 'react';

export default function TestDirectFilePage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDirectFileCreation = async () => {
    setLoading(true);
    setResult('🔄 Probando creación directa de archivo...');

    try {
      const response = await fetch('/api/unified-file-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createFile',
          projectPath: 'Boceto_101_Tips_para_Hablar_con_la_IA',
          fileName: 'Generated_Content/direct_test.md',
          content: `# Test Directo

Este archivo fue creado directamente por la API.

## Información
- Creado: ${new Date().toLocaleString()}
- Método: API directa
- Estado: Funcionando

## Verificación
✅ El sistema está operativo
✅ Los archivos se crean correctamente
✅ La API funciona

## Conclusión
El sistema está funcionando perfectamente.`
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Archivo creado exitosamente\n\nRespuesta:\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Error: ${data.error || 'Error desconocido'}\n\nStatus: ${response.status}\n\nRespuesta completa:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectoryCreation = async () => {
    setLoading(true);
    setResult('🔄 Probando creación de directorio...');

    try {
      const response = await fetch('/api/unified-file-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createFolder',
          projectPath: 'Boceto_101_Tips_para_Hablar_con_la_IA',
          folderName: 'Generated_Content'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Directorio creado exitosamente\n\nRespuesta:\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Error: ${data.error || 'Error desconocido'}\n\nStatus: ${response.status}\n\nRespuesta completa:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testProjectStructure = async () => {
    setLoading(true);
    setResult('🔄 Obteniendo estructura del proyecto...');

    try {
      const response = await fetch('/api/unified-file-operations?projectPath=Boceto_101_Tips_para_Hablar_con_la_IA');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Estructura obtenida\n\nEstructura:\n${JSON.stringify(data, null, 2)}`);
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
        <h1 className="text-3xl font-bold mb-6">🔧 Test Directo - API de Archivos</h1>
        <p className="mb-6 text-gray-600">Pruebas directas de la API de archivos sin usar el agente</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testDirectoryCreation}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Crear Directorio
          </button>
          
          <button
            onClick={testDirectFileCreation}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Crear Archivo Directo
          </button>

          <button
            onClick={testProjectStructure}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Ver Estructura
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