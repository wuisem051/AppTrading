# ARPA/USDT Pro Terminal — PWA de Monitoreo & Trading

Aplicación Web Progresiva (PWA) de alto rendimiento para monitoreo y trading profesional en tiempo real para el par **ARPA/USDT**, conectada directamente a los WebSockets de Binance y construida con **React**, **Vite**, **Tailwind CSS v4** y **TradingView Lightweight Charts v5**.

---

## ⚡ Características Principales

1. **Header Ticker en Vivo (Binance WebSocket Stream):**
   - Conexión de baja latencia a `wss://stream.binance.com:9443/ws/arpausdt@ticker`.
   - Renderizado con parpadeo dinámico verde/rojo según el tick del precio.
   - Estadísticas 24h: Máximo, Mínimo, Volumen en ARPA y en USDT.
   - Indicador de latencia y estado de conexión en milisegundos con reconexión automática.

2. **Gráfico Dinámico Profesional (TradingView Lightweight Charts):**
   - Stream de velas en tiempo real (`arpausdt@kline_<timeframe>`).
   - Soporte para múltiples temporalidades (`1m`, `5m`, `15m`, `1h`, `4h`, `1d`).
   - Carga inicial del histórico mediante la API REST de Binance (500 velas) y actualización continua sin recarga.
   - Creación de zonas directamente al hacer clic sobre cualquier nivel de precio del gráfico.

3. **Detector de Volatilidad Rápida (Spikes / Pumping / Dumping):**
   - Algoritmo en tiempo real con ventana deslizante de 60 segundos.
   - Detecta subidas o bajadas agresivas según el umbral configurado por el usuario (ej. $\pm 0.75\%$).
   - Alerta visual flotante y sintetizador de sonido en tiempo real con la Web Audio API (frecuencia modulada).
   - Compatible con la Web Notifications API para avisos cuando la pestaña esté en segundo plano.

4. **Gestor de Zonas de Soporte y Resistencia:**
   - Líneas horizontales proyectadas directamente sobre el canvas del gráfico.
   - Verificación de cruce y toque con tolerancia de precisión.
   - Panel lateral para activar, desactivar, etiquetar o eliminar zonas con persistencia en `localStorage`.

5. **PWA & Compatibilidad Móvil / Desktop:**
   - Service Worker y Web App Manifest preconfigurados mediante `vite-plugin-pwa`.
   - Preparado para desplegar en Netlify (`netlify.toml` incluido) o empaquetar con Capacitor en Android.

---

## 🚀 Despliegue en Netlify

1. Sube este repositorio a **GitHub**.
2. En Netlify, selecciona **Import an existing project** desde GitHub.
3. Configuración de Build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. El archivo [netlify.toml](file:///e:/App%20trading/netlify.toml) ya contiene la configuración de SPA redirect y cabeceras de seguridad.

---

## 📱 Empaquetado en Android (Capacitor)

Si deseas compilar la APK nativa para Android:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "ARPA Trader" "com.arpatrader.app" --web-dir dist
npm run build
npx cap add android
npx cap open android
```
