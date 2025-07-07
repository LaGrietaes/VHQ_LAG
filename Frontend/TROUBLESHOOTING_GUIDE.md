# 🔧 Guía de Solución de Problemas - Ghost Agent

## 🚨 Problemas Comunes y Soluciones

### 1. **Error de Sintaxis en TypeScript**
**Síntoma:** `Expected ',', got ':'` en archivos con markdown

**Causa:** Cadenas de texto con markdown (`**texto**`) dentro de código TypeScript

**Solución:** ✅ **ARREGLADO**
- Removí los asteriscos dobles (`**`) de las cadenas de texto
- Cambié `**Análisis:**` por `Análisis:`
- Cambié `**Desafío:**` por `Desafío:`

### 2. **Script "dev" No Encontrado**
**Síntoma:** `npm error Missing script: "dev"`

**Causa:** Script faltante en package.json

**Solución:** ✅ **ARREGLADO**
- Agregué `"dev": "next dev"` al package.json

### 3. **Error de PowerShell con &&**
**Síntoma:** `The token '&&' is not a valid statement separator`

**Causa:** PowerShell no reconoce `&&` como separador

**Solución:**
```powershell
# En lugar de:
cd frontend && npm run dev

# Usa:
cd frontend
npm run dev
```

### 4. **Servidor No Inicia**
**Síntoma:** Error al compilar o iniciar Next.js

**Solución:**
```bash
# 1. Limpia la caché
rm -rf .next
# o en Windows:
rmdir /s .next

# 2. Reinstala dependencias
npm install

# 3. Inicia el servidor
npm run dev
```

### 5. **Ghost Agent No Responde**
**Síntoma:** El botón del Ghost Agent no funciona

**Verificación:**
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca errores relacionados con `/api/ai/ghost-agent`
4. Verifica que el servidor esté corriendo en `http://localhost:3000`

### 6. **Archivos No Se Cargan**
**Síntoma:** Los dropdowns están vacíos o no cargan archivos

**Solución:**
1. Verifica que los archivos existan en `GHOST_Proyectos/libros/Boceto_101_Tips_para_Hablar_con_la_IA/`
2. Asegúrate de que los archivos tengan extensión `.md`
3. Refresca la página (F5)

### 7. **Contenido Generado Es Superficial**
**Síntoma:** El contenido generado es muy básico

**Solución:** ✅ **ARREGLADO**
- El sistema ahora usa la guía de estilo `GHOST_Tips.md`
- Genera contenido más denso (6-8 minutos de lectura)
- Incluye casos reales y análisis detallados

---

## 🧪 Cómo Verificar que Todo Funciona

### 1. **Verificar Servidor**
```bash
# El servidor debe mostrar:
> frontend@0.1.0 dev
> next dev

   ▲ Next.js 15.3.4
   - Local:        http://localhost:3000
   ✓ Ready in X.Xs
```

### 2. **Verificar Ghost Agent**
1. Abre `http://localhost:3000`
2. Navega al proyecto "Boceto_101_Tips_para_Hablar_con_la_IA"
3. Haz clic en el botón Ghost Agent (ícono de cerebro)
4. Deberías ver las 3 opciones: Bosquejo, Tipo de Contenido, Generar Contenido

### 3. **Verificar Generación de Contenido**
1. Selecciona "Generar Contenido"
2. Elige "Generar 1 elemento"
3. El contenido generado debe tener:
   - Título llamativo con numeración
   - 11 secciones bien definidas
   - Casos reales con storytelling
   - Análisis antes/después
   - Retos prácticos

---

## 📋 Checklist de Verificación

- [ ] Servidor inicia sin errores
- [ ] Página principal carga en `http://localhost:3000`
- [ ] Proyecto "Boceto_101_Tips_para_Hablar_con_la_IA" es visible
- [ ] Botón Ghost Agent funciona
- [ ] Dropdowns cargan archivos correctamente
- [ ] Generación de contenido funciona
- [ ] Contenido generado es denso y educativo
- [ ] No hay errores en la consola del navegador

---

## 🆘 Si Nada Funciona

### Opción 1: Reinicio Completo
```bash
# 1. Detén el servidor (Ctrl+C)
# 2. Limpia todo
rm -rf .next node_modules package-lock.json
# 3. Reinstala
npm install
# 4. Inicia
npm run dev
```

### Opción 2: Verificar Dependencias
```bash
# Verifica que tienes Node.js 18+
node --version

# Verifica que tienes npm
npm --version

# Reinstala dependencias
npm install
```

### Opción 3: Contactar Soporte
Si nada funciona, proporciona:
1. Versión de Node.js
2. Versión de npm
3. Sistema operativo
4. Logs de error completos
5. Pasos exactos que seguiste

---

## 🎯 Estado Actual del Sistema

✅ **Funcionando Correctamente:**
- Servidor de desarrollo
- Ghost Agent API
- Generación de contenido mejorada
- Estructura de archivos
- Dropdowns de archivos

✅ **Mejoras Implementadas:**
- Contenido más denso (6-8 min lectura)
- Casos reales con storytelling
- Análisis antes/después
- Retos prácticos aplicables
- Estructura de 11 secciones

---

**¡El sistema está listo para usar! 🚀** 