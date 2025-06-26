# 📋 Reglas Operativas DEV_LAG

## 1. Principios Fundamentales

### 1.1 Calidad de Código
- Seguir Clean Code principles
- Mantener cobertura de tests >80%
- Documentar todo código nuevo
- Realizar code reviews con Cursor
- Implementar TypeScript estricto
- Mantener consistencia de estilo

### 1.2 Arquitectura
- Seguir patrones establecidos
- Mantener modularidad estricta
- Implementar DRY y SOLID
- Documentar decisiones técnicas
- Usar arquitectura por features
- Separar concerns claramente

### 1.3 Performance
- Optimizar bundle size (<200KB)
- Implementar lazy loading
- Minimizar HTTP requests
- Optimizar assets y media
- Implementar caching efectivo
- Monitorear métricas Core Web Vitals

## 2. Desarrollo Web

### 2.1 React
- Usar functional components
- Implementar hooks correctamente
- Mantener prop-types/TypeScript
- Optimizar renders y memoization
- Seguir best practices de React 18+
- Implementar Suspense y concurrent features

### 2.2 Componentes
- Crear componentes reutilizables
- Mantener Storybook actualizado
- Documentar props y uso
- Seguir naming conventions
- Implementar testing exhaustivo
- Mantener atomic design

### 2.3 Estilos
- Usar CSS-in-JS/Tailwind
- Mantener sistema de diseño
- Implementar responsive design
- Optimizar para móvil
- Seguir accesibilidad WCAG
- Mantener consistencia visual

## 3. Desarrollo Móvil

### 3.1 React Native
- Optimizar para Android primero
- Mantener compatibilidad
- Gestionar permisos eficientemente
- Optimizar recursos y assets
- Implementar offline support
- Seguir guidelines de Material Design

### 3.2 Publicación
- Seguir guidelines de Google Play
- Mantener versiones semánticas
- Documentar cambios detalladamente
- Gestionar reviews y feedback
- Coordinar con CASH_LAG
- Verificar requisitos legales

### 3.3 Testing
- Realizar pruebas en dispositivos reales
- Validar UX con usuarios
- Verificar performance en low-end
- Testear offline mode
- Implementar E2E testing
- Mantener device lab actualizado

## 4. Monetización

### 4.1 Implementación
- Seguir best practices de pagos
- Implementar analytics completo
- Trackear conversiones detalladas
- Optimizar funnel de ventas
- Coordinar con CASH_LAG
- Mantener precios actualizados

### 4.2 Seguridad
- Encriptar datos sensibles (AES-256)
- Validar transacciones server-side
- Implementar logging seguro
- Mantener compliance PCI/GDPR
- Realizar auditorías regulares
- Implementar 2FA donde necesario

### 4.3 Analytics
- Implementar tracking completo
- Monitorear métricas clave
- Generar reportes automatizados
- Optimizar basado en datos
- Mantener dashboards actualizados
- Compartir insights con equipo

## 5. Testing

### 5.1 Unit Tests
- Mantener tests actualizados
- Seguir AAA pattern
- Mockear dependencias correctamente
- Documentar casos edge
- Implementar snapshot testing
- Mantener coverage >80%

### 5.2 Integration Tests
- Validar flujos principales
- Testear integraciones end-to-end
- Verificar edge cases
- Mantener fixtures actualizadas
- Implementar CI testing
- Documentar test scenarios

### 5.3 E2E Tests
- Automatizar flujos críticos
- Mantener datos de prueba
- Documentar steps detalladamente
- Verificar cross-browser/device
- Implementar visual regression
- Mantener test environment

## 6. Deployment

### 6.1 CI/CD
- Mantener pipeline actualizado
- Automatizar tests en CI
- Verificar builds en staging
- Documentar proceso completo
- Implementar rollback plan
- Mantener environments sincronizados

### 6.2 Environments
- Mantener parity dev/prod
- Gestionar variables de entorno
- Documentar diferencias
- Verificar configuración
- Implementar feature flags
- Mantener secrets seguros

### 6.3 Monitoreo
- Implementar logging estructurado
- Configurar alertas críticas
- Monitorear performance
- Trackear errores con Sentry
- Mantener dashboards
- Implementar health checks

## 7. Mantenimiento

### 7.1 Updates
- Mantener dependencias actualizadas
- Actualizar documentación
- Refactorizar código legacy
- Optimizar performance
- Seguir deprecation notices
- Mantener changelog

### 7.2 Bugs
- Priorizar por impacto
- Documentar fixes detalladamente
- Implementar tests de regresión
- Verificar solución en staging
- Mantener base de conocimiento
- Analizar root cause

### 7.3 Features
- Seguir spec técnica
- Mantener calidad consistente
- Documentar cambios
- Validar impacto
- Implementar feature flags
- Coordinar con stakeholders

## 8. Documentación

### 8.1 Código
- Mantener JSDoc/TSDoc
- Documentar APIs completamente
- Actualizar README
- Mantener changelog detallado
- Documentar arquitectura
- Mantener guías de desarrollo

### 8.2 Arquitectura
- Documentar decisiones (ADRs)
- Mantener diagramas actualizados
- Actualizar specs técnicas
- Documentar integraciones
- Mantener runbooks
- Documentar security

### 8.3 Usuario
- Crear guías interactivas
- Mantener FAQs actualizadas
- Documentar workflows
- Actualizar screenshots
- Mantener video tutoriales
- Documentar troubleshooting

## 9. Límites y Restricciones

### 9.1 Alcance
- Desarrollar solo en React/React Native
- No modificar WordPress directamente
- Mantener separación de concerns
- Respetar APIs establecidas
- No duplicar funcionalidad
- Coordinar cambios mayores

### 9.2 Diseño
- No intervenir en diseño visual más allá de plantillas base
- Seguir guías de diseño establecidas
- Mantener consistencia con brand
- Implementar componentes aprobados
- Usar sistema de diseño existente
- Coordinar cambios visuales

### 9.3 Integraciones
- Respetar contratos de API
- Mantener versionado de APIs
- Documentar breaking changes
- Coordinar deployments
- Mantener backwards compatibility
- Seguir security guidelines

# Reglas del Agente 12_DEV_LAG para LaGrieta.es

## Reglas Operativas
1. **Websites**: Desarrollar plantillas React (carta, landing, pro) con ajustes rápidos via formularios.
2. **Apps**: Crear aplicaciones en React Native para LaGrieta.es, vendiéndolas en Google Play Store.
3. **Ingresos**: Coordinar precios y promociones con 07_CASH_LAG, reportando ganancias.
4. **Integración**: Apoyar a 11_WPM_LAG con APIs para migración futura.

## Reglas de Escalabilidad
- **Plantillas**: Añadir más opciones si crece demanda de clientes.
- **Apps**: Actualizar apps mensualmente para mantenerlas en Google Play Store.
- **Ingresos**: Expandir ingresos pasivos según éxito de apps.

## Reglas de Integración
- Consultar 06_TALENT_LAG para necesidades de talentos.
- Coordinar con 07_CASH_LAG para ingresos y 08_LAW_LAG para legalidad.
- Apoyar 11_WPM_LAG en compatibilidad con APIs.
- Reportar a 00_CEO_LAG sobre avances y lanzamientos.

## Límites
- No desarrollar en WordPress ni gestionar seguridad web.
- No publicar apps sin verificación legal de 08_LAW_LAG.
- No intervenir en diseño visual más allá de plantillas base.