# 📝 Registro de Actualizaciones y Cambios (UPDATES.md)

Este documento registra cronológicamente los hitos, mejoras, correcciones y novedades en el desarrollo de **ARPA/USDT Pro Terminal**.

---

## [v1.2.0] — 2026-10-23
### 🚀 Mejoras en Netlify, Sanitización y Estabilidad de Despliegue
- **Fix (Build Netlify)**: Limpieza y resolución de marcadores de conflicto Git en `src/services/firebase.ts` que provocaban fallos en el runner de compilación de Netlify.
- **Configuración Netlify**: Añadido `netlify.toml` con configuración de build (`npm run build`), directorio de salida (`dist`) y regla SPA rewrite `/* -> /index.html 200`.
- **Seguridad**: Sanitización del historial Git para excluir credenciales expuestas en commits anteriores mediante variables de entorno seguras (`.env` / `import.meta.env`).

---

## [v1.1.0] — 2026-10-23
### ⚡ Detección Dinámica de Zonas & Sincronización en la Nube
- **Fix (Soporte vs Resistencia)**: Corregido el bug donde los clics en el gráfico solo creaban zonas de resistencia. Ahora evalúa dinámicamente si el precio seleccionado está por debajo del precio actual (generando **Soporte**) o por encima (generando **Resistencia**).
- **Integración Firebase**:
  - Conexión completa con **Google Cloud Firestore** para persistencia en la nube de zonas (`zones`) e historial de alertas disparadas (`alerts`).
  - Sincronización bidireccional en tiempo real con `onSnapshot`, permitiendo reflejar cambios al instante entre pestañas o dispositivos móviles.
  - Integración de **Firebase Analytics** para métricas de uso y rendimiento.

---

## [v1.0.0] — 2026-10-23
### 🎉 Lanzamiento Inicial — Base PWA & Trading Terminal
- **Arquitectura Base**:
  - Configuración inicial con React 19, Vite, TypeScript y Tailwind CSS v4.
  - Soporte PWA mediante `vite-plugin-pwa` con `manifest.json` e iconos adaptativos para instalación en escritorio y móviles.
- **Visualización Financiera**:
  - Gráfico de velas japonesas en tiempo real utilizando **TradingView Lightweight Charts**.
  - Soporte para selector de temporalidades (1m, 5m, 15m, 1h, 4h, 1d) con descarga histórica REST y actualización continua vía WebSocket.
- **Header & Ticker en Vivo**:
  - Reloj en vivo de mercado con contador UTC y local.
  - Indicadores en tiempo real de precio actual, variación 24h (%), volumen en USDT, máximo y mínimo del día.
- **Sistema de Alertas Locales**:
  - Definición de zonas de precio interactivas con líneas horizontales sobre el gráfico.
  - Disparadores de audio sintetizados con la Web Audio API nativa (sin assets externos pesados).
  - Banners toast animados para notificaciones inmediatas de cruces de precio.

---

## 📌 Guía para Nuevas Actualizaciones
Al registrar nuevas actualizaciones en este archivo, seguir el formato estándar:

```markdown
## [vX.Y.Z] — YYYY-MM-DD
### ✨ Nuevas Características
- Descripción de nuevas funcionalidades...

### 🐛 Correcciones (Bug Fixes)
- Descripción del problema resuelto...

### ⚡ Optimizaciones y Refactorización
- Mejoras de rendimiento o de código...
```
