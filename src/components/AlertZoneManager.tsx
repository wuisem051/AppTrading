import React, { useState } from 'react';
import type { PriceZoneAlert } from '../types/trading';
import { 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Zap
} from 'lucide-react';

interface AlertZoneManagerProps {
  zones: PriceZoneAlert[];
  currentPrice?: number;
  onAddZone: (price: number, type: 'support' | 'resistance', label?: string) => void;
  onToggleZone: (id: string) => void;
  onDeleteZone: (id: string) => void;
  volatilityThreshold: number;
  onChangeVolatilityThreshold: (val: number) => void;
  precision?: number;
  baseAsset?: string;
}

export const AlertZoneManager: React.FC<AlertZoneManagerProps> = ({
  zones,
  currentPrice,
  onAddZone,
  onToggleZone,
  onDeleteZone,
  volatilityThreshold,
  onChangeVolatilityThreshold,
  precision = 4,
  baseAsset = 'Crypto'
}) => {
  const [priceInput, setPriceInput] = useState<string>('');
  const [labelInput, setLabelInput] = useState<string>('');
  const [zoneType, setZoneType] = useState<'support' | 'resistance'>('resistance');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(priceInput);
    if (!isNaN(parsed) && parsed > 0) {
      const defaultLabel = `${zoneType === 'support' ? 'Soporte' : 'Resistencia'} @ ${parsed.toFixed(precision)}`;
      onAddZone(parsed, zoneType, labelInput.trim() || defaultLabel);
      setPriceInput('');
      setLabelInput('');
    }
  };

  const handleUseCurrentPrice = () => {
    if (currentPrice) {
      setPriceInput(currentPrice.toFixed(precision));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c1017] rounded-xl border border-slate-800/80 p-4 shadow-xl">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="text-indigo-400" size={18} />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Panel de Zonas & Alertas
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
          {zones.filter(z => z.active).length} Activas
        </span>
      </div>

      {/* Volatility Threshold Config */}
      <div className="my-3.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Zap size={14} />
            <span>Filtro de Volatilidad Rápida</span>
          </div>
          <span className="text-xs font-mono font-bold text-white bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            ±{volatilityThreshold}% / 60s
          </span>
        </div>
        <input 
          type="range"
          min="0.2"
          max="3.0"
          step="0.05"
          value={volatilityThreshold}
          onChange={(e) => onChangeVolatilityThreshold(parseFloat(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
        <p className="text-[10px] text-slate-500 mt-1">
          Dispara alarma sonora si {baseAsset} sube o baja este % en menos de 1 minuto.
        </p>
      </div>

      {/* Add New Zone Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setZoneType('resistance')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
              zoneType === 'resistance'
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown size={14} />
            Resistencia
          </button>
          <button
            type="button"
            onClick={() => setZoneType('support')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
              zoneType === 'support'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp size={14} />
            Soporte
          </button>
        </div>

        <div className="relative">
          <input
            type="number"
            step="any"
            placeholder={`Precio objetivo (ej. ${currentPrice ? currentPrice.toFixed(precision) : '0.1100'})`}
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            required
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {currentPrice && (
            <button
              type="button"
              onClick={handleUseCurrentPrice}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700"
            >
              Actual
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Etiqueta opcional (ej. Techo 4h)"
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus size={14} />
          Agregar Zona de Alerta
        </button>
      </form>

      {/* List of Zones */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {zones.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No tienes zonas registradas. Agrega una arriba o haz clic directamente sobre el gráfico.
          </div>
        ) : (
          zones.map((zone) => {
            const isSupport = zone.type === 'support';
            return (
              <div
                key={zone.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                  zone.active
                    ? isSupport
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-50 text-slate-400'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isSupport ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="text-xs font-semibold truncate">{zone.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold">
                      ${zone.price.toFixed(precision)}
                    </span>
                    {zone.triggeredAt && (
                      <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1 rounded">
                        ¡Tocada!
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleZone(zone.id)}
                    title={zone.active ? 'Desactivar' : 'Activar'}
                    className="p-1 hover:text-white transition"
                  >
                    {zone.active ? (
                      <ToggleRight size={20} className={isSupport ? 'text-emerald-400' : 'text-rose-400'} />
                    ) : (
                      <ToggleLeft size={20} className="text-slate-600" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteZone(zone.id)}
                    title="Eliminar zona"
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
