import React, { useState } from 'react';
import type { TickerData } from '../types/trading';
import { 
  TrendingUp, 
  TrendingDown, 
  Wifi, 
  WifiOff, 
  Bell, 
  Volume2 
} from 'lucide-react';
import { requestNotificationPermission } from '../utils/audioAlerts';

interface HeaderTickerProps {
  ticker: TickerData | null;
  isConnected: boolean;
  latency: number;
  onQuickZoneAdd?: (currentPrice: number) => void;
  onTestAudio?: () => void;
}

export const HeaderTicker: React.FC<HeaderTickerProps> = ({
  ticker,
  isConnected,
  latency,
  onQuickZoneAdd,
  onTestAudio
}) => {
  const [notifGranted, setNotifGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

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
        
        {/* Left: Brand & Pair Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/10 font-black text-white text-base tracking-wider border border-white/10">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">ARPA/USDT</h1>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                  Perpetual & Spot
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Binance Native WebSocket Feed
              </p>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-slate-800 hidden sm:block"></div>

          {/* Price & Real-Time Tick */}
          <div className="flex items-baseline gap-3">
            <span className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight transition-colors duration-150 ${tickClass}`}>
              {ticker ? `$${ticker.price.toFixed(5)}` : '----'}
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
              <span className="font-semibold text-emerald-400">${ticker.high24h.toFixed(5)}</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">24h Low</span>
              <span className="font-semibold text-rose-400">${ticker.low24h.toFixed(5)}</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">24h Vol (ARPA)</span>
              <span className="font-semibold text-slate-200">
                {(ticker.volume24h / 1_000_000).toFixed(2)}M
              </span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">24h Vol (USDT)</span>
              <span className="font-semibold text-slate-200">
                ${(ticker.quoteVolume24h / 1_000).toFixed(1)}K
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
