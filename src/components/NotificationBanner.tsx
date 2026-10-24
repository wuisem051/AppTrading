import React from 'react';
import type { PriceZoneAlert, VolatilityAlertEvent } from '../types/trading';
import { AlertTriangle, Zap, X } from 'lucide-react';

interface NotificationBannerProps {
  volatilityAlert: VolatilityAlertEvent | null;
  zoneAlert: PriceZoneAlert | null;
  onDismissVolatility: () => void;
  onDismissZone: () => void;
  pairLabel?: string;
  precision?: number;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  volatilityAlert,
  zoneAlert,
  onDismissVolatility,
  onDismissZone,
  pairLabel = 'BEL/USDT',
  precision = 4
}) => {
  if (!volatilityAlert && !zoneAlert) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-auto select-none">
      
      {/* Volatility Spike Pop-up */}
      {volatilityAlert && (
        <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-lg animate-bounce ${
          volatilityAlert.direction === 'pump'
            ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
            : 'bg-rose-950/90 border-rose-500/60 text-rose-200'
        }`}>
          <div className={`p-2 rounded-lg ${volatilityAlert.direction === 'pump' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            <Zap size={20} className="animate-pulse" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm tracking-wide">
                ¡MOVIMIENTO BRUSCO DETECTADO!
              </h4>
              <button onClick={onDismissVolatility} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs mt-1">
              {pairLabel} se movió <span className="font-bold font-mono">{volatilityAlert.percentChange > 0 ? '+' : ''}{volatilityAlert.percentChange}%</span> en {volatilityAlert.durationSeconds}s.
            </p>
            <div className="text-[11px] font-mono mt-1 opacity-80">
              De ${volatilityAlert.fromPrice.toFixed(precision)} ➔ ${volatilityAlert.toPrice.toFixed(precision)}
            </div>
          </div>
        </div>
      )}

      {/* Price Zone Alert Pop-up */}
      {zoneAlert && (
        <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-lg ${
          zoneAlert.type === 'support'
            ? 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200'
            : 'bg-amber-950/90 border-amber-500/60 text-amber-200'
        }`}>
          <div className={`p-2 rounded-lg ${zoneAlert.type === 'support' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <AlertTriangle size={20} className="animate-spin" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">
                ¡ZONA DE PRECIO TOCADA!
              </h4>
              <button onClick={onDismissZone} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs mt-1">
              El precio de {pairLabel} alcanzó el nivel <span className="font-bold">{zoneAlert.label}</span>.
            </p>
            <div className="text-[11px] font-mono mt-1 font-semibold">
              Nivel: ${zoneAlert.price.toFixed(precision)}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
