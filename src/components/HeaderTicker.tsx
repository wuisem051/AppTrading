import React, { useState } from 'react';
import type { TickerData, TradingPairConfig } from '../types/trading';
import { SUPPORTED_PAIRS } from '../types/trading';
import { 
  TrendingUp, 
  TrendingDown, 
  Wifi, 
  WifiOff, 
  Bell, 
  Volume2,
  ChevronDown
} from 'lucide-react';
import { requestNotificationPermission } from '../utils/audioAlerts';

interface HeaderTickerProps {
  ticker: TickerData | null;
  isConnected: boolean;
  latency: number;
  selectedPair: TradingPairConfig;
  onSelectPair: (pair: TradingPairConfig) => void;
  onQuickZoneAdd?: (currentPrice: number) => void;
  onTestAudio?: () => void;
}

export const HeaderTicker: React.FC<HeaderTickerProps> = ({
  ticker,
  isConnected,
  latency,
  selectedPair,
  onSelectPair,
  onQuickZoneAdd,
  onTestAudio
}) => {
  const [notifGranted, setNotifGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });
  const [pairMenuOpen, setPairMenuOpen] = useState<boolean>(false);

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
  };

  const isPositive = (ticker?.priceChangePercent ?? 0) >= 0;
  const tickClass = ticker?.tickDirection === 'up' 
    ? 'text-emerald-400 animate-pulse' 
    : ticker?.tickDirection === 'down' 
      ? 'text-rose-400 animate-pulse' 
      : 'text-slate-100';

  return (
    <header className="sticky top-0 z-30 bg-[#0c1017]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 select-none">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Brand & Pair Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/10 font-black text-white text-base tracking-wider border border-white/10">
              ⚡
            </div>
            
            {/* Interactive Pair Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPairMenuOpen(!pairMenuOpen)}
                className="flex items-center gap-2 group text-left px-2 py-1 -ml-2 rounded-lg hover:bg-slate-800/70 transition border border-transparent hover:border-slate-700/60"
                title="Cambiar par de trading"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-base font-bold text-white tracking-wide group-hover:text-amber-400 transition-colors">
                      {selectedPair.label}
                    </h1>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${pairMenuOpen ? 'rotate-180' : ''}`} />
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                      Spot
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Binance WebSocket Feed
                  </p>
                </div>
              </button>

              {pairMenuOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 w-52 bg-[#0e131d] border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setPairMenuOpen(false)}
                >
                  <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-2.5 py-1">
                    Seleccionar Par
                  </span>
                  {SUPPORTED_PAIRS.map(p => {
                    const isSelected = p.id === selectedPair.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPair(p);
                          setPairMenuOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400/80"></span>
                          {p.label}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-amber-400 font-mono">Activo</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="h-7 w-[1px] bg-slate-800 hidden sm:block"></div>

          {/* Price & Real-Time Tick */}
          <div className="flex items-baseline gap-3">
            <span className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight transition-colors duration-150 ${tickClass}`}>
              {ticker ? `$${ticker.price.toFixed(selectedPair.precision)}` : '----'}
            </span>
            {ticker && (
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                <span>{isPositive ? '+' : ''}{ticker.priceChangePercent.toFixed(2)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: 24h Statistics Terminal Pill */}
        {ticker && (
          <div className="hidden lg:flex items-center gap-6 bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2 font-mono text-xs shadow-inner">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">24h High</span>
              <span className="font-semibold text-emerald-400">${ticker.high24h.toFixed(selectedPair.precision)}</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">24h Low</span>
              <span className="font-semibold text-rose-400">${ticker.low24h.toFixed(selectedPair.precision)}</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">24h Vol ({selectedPair.baseAsset})</span>
              <span className="font-semibold text-slate-200">
                {ticker.volume24h >= 1_000_000 
                  ? `${(ticker.volume24h / 1_000_000).toFixed(2)}M`
                  : `${(ticker.volume24h / 1_000).toFixed(1)}K`}
              </span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">24h Vol (USDT)</span>
              <span className="font-semibold text-slate-200">
                {ticker.quoteVolume24h >= 1_000_000
                  ? `${(ticker.quoteVolume24h / 1_000_000).toFixed(2)}M`
                  : `$${(ticker.quoteVolume24h / 1_000).toFixed(1)}K`}
              </span>
            </div>
          </div>
        )}

        {/* Right: Quick actions & Connection status */}
        <div className="flex items-center gap-2.5">
          {ticker && onQuickZoneAdd && (
            <button
              onClick={() => onQuickZoneAdd(ticker.price)}
              title="Marcar precio actual como nivel rápido"
              className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition flex items-center gap-1.5"
            >
              <span>+ Marcar Nivel</span>
            </button>
          )}

          {/* Test Sound */}
          {onTestAudio && (
            <button
              onClick={onTestAudio}
              title="Probar sonido de alerta"
              className="p-1.5 text-slate-400 hover:text-indigo-400 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition"
            >
              <Volume2 size={16} />
            </button>
          )}

          {/* Browser Notifications Toggle */}
          <button
            onClick={handleRequestNotif}
            title={notifGranted ? 'Notificaciones Web Activas' : 'Activar Notificaciones Web'}
            className={`p-1.5 rounded-lg border transition ${
              notifGranted 
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' 
                : 'text-slate-400 border-slate-700/60 bg-slate-800/80 hover:text-amber-400'
            }`}
          >
            <Bell size={16} />
          </button>

          {/* Latency & Connection pill */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono">
            {isConnected ? (
              <>
                <Wifi size={13} className="text-emerald-400" />
                <span className="text-emerald-400 font-semibold">{latency}ms</span>
              </>
            ) : (
              <>
                <WifiOff size={13} className="text-rose-400" />
                <span className="text-rose-400">Desconectado</span>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
