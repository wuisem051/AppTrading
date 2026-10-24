import { useState, useRef } from 'react';
import { useBinanceTrading } from './hooks/useBinanceTrading';
import { useAlertManager } from './hooks/useAlertManager';
import { HeaderTicker } from './components/HeaderTicker';
import { TradingChart } from './components/TradingChart';
import { AlertZoneManager } from './components/AlertZoneManager';
import { NotificationBanner } from './components/NotificationBanner';
import type { Timeframe, TradingPairConfig } from './types/trading';
import { SUPPORTED_PAIRS } from './types/trading';
import { soundManager } from './utils/audioAlerts';

export function App() {
  const [selectedPair, setSelectedPair] = useState<TradingPairConfig>(SUPPORTED_PAIRS[0]); // Defaults to BEL/USDT
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');

  // Real-time Binance Feed
  const {
    ticker,
    candles,
    currentCandle,
    isConnected,
    latency
  } = useBinanceTrading(selectedPair, timeframe);

  // Dynamic Support/Resistance & Volatility Alert Manager
  const {
    zones,
    addZone,
    toggleZone,
    deleteZone,
    volatilityThreshold,
    setVolatilityThreshold,
    activeVolatilityAlert,
    dismissVolatilityAlert,
    activeZoneAlert,
    dismissZoneAlert,
    unlockAudio
  } = useAlertManager(ticker?.price, selectedPair);

  const tickerRef = useRef(ticker);
  tickerRef.current = ticker;

  const handleChartClickAdd = (price: number) => {
    unlockAudio();
    const roundedPrice = Number(price.toFixed(selectedPair.precision));
    const current = tickerRef.current?.price ?? 0;
    const isSupport = roundedPrice < current;
    const type = isSupport ? 'support' : 'resistance';
    addZone(roundedPrice, type, isSupport ? `Soporte ${selectedPair.baseAsset}` : `Resistencia ${selectedPair.baseAsset}`);
  };

  const handleQuickAdd = (price: number) => {
    unlockAudio();
    const roundedPrice = Number(price.toFixed(selectedPair.precision));
    addZone(roundedPrice, 'resistance', `Nivel Rápido ${selectedPair.baseAsset}`);
  };

  const handleTestAudio = () => {
    soundManager.playZoneAlert('resistance');
  };

  return (
    <div 
      onClick={unlockAudio} 
      className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white"
    >
      {/* 1. Header de Estado en Vivo (Estilo Reloj & Ticker Binance con Selector) */}
      <HeaderTicker
        ticker={ticker}
        isConnected={isConnected}
        latency={latency}
        selectedPair={selectedPair}
        onSelectPair={setSelectedPair}
        onQuickZoneAdd={handleQuickAdd}
        onTestAudio={handleTestAudio}
      />

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 p-3 sm:p-4 max-w-[1920px] w-full mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Gráfico Dinámico (Lightweight Charts) */}
        <section className="lg:col-span-3 flex flex-col min-h-[550px] lg:min-h-0">
          <TradingChart
            candles={candles}
            currentCandle={currentCandle}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            zones={zones}
            onAddZoneByClick={handleChartClickAdd}
            precision={selectedPair.precision}
          />
        </section>

        {/* Panel Lateral de Control de Zonas & Alertas */}
        <aside className="lg:col-span-1 h-full min-h-[450px]">
          <AlertZoneManager
            zones={zones}
            currentPrice={ticker?.price}
            onAddZone={addZone}
            onToggleZone={toggleZone}
            onDeleteZone={deleteZone}
            volatilityThreshold={volatilityThreshold}
            onChangeVolatilityThreshold={setVolatilityThreshold}
            precision={selectedPair.precision}
            baseAsset={selectedPair.baseAsset}
          />
        </aside>

      </main>

      {/* 3. Pop-up Visual de Alertas (Volatilidad o Niveles Tocados) */}
      <NotificationBanner
        volatilityAlert={activeVolatilityAlert}
        zoneAlert={activeZoneAlert}
        onDismissVolatility={dismissVolatilityAlert}
        onDismissZone={dismissZoneAlert}
        pairLabel={selectedPair.label}
        precision={selectedPair.precision}
      />

      {/* Footer Status Bar */}
      <footer className="bg-[#0c1017] border-t border-slate-900 px-4 py-2 text-[11px] text-slate-500 flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-3">
          <span>PWA Ready (Offline Cache & Service Worker)</span>
          <span>•</span>
          <span>Binance Spot API v3</span>
        </div>
        <div>
          Desplegable en Netlify / Vercel / Capacitor Android
        </div>
      </footer>
    </div>
  );
}

export default App;
