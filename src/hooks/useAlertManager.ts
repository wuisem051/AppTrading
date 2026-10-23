import { useState, useEffect, useRef } from 'react';
import type { PriceZoneAlert, VolatilityAlertEvent } from '../types/trading';
import { soundManager, sendBrowserNotification } from '../utils/audioAlerts';

const ZONES_STORAGE_KEY = 'arpa_trader_zones_v1';

export function useAlertManager(currentPrice: number | undefined) {
  // 1. Price Zones State
  const [zones, setZones] = useState<PriceZoneAlert[]>(() => {
    try {
      const saved = localStorage.getItem(ZONES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default zones for initial showcase
    return [
      { id: '1', label: 'Resistencia Clave', price: 0.05500, type: 'resistance', active: true, createdAt: Date.now() },
      { id: '2', label: 'Soporte Mayor', price: 0.04800, type: 'support', active: true, createdAt: Date.now() },
    ];
  });

  // 2. Volatility threshold settings (default 0.75% in 60 seconds for ARPA)
  const [volatilityThreshold, setVolatilityThreshold] = useState<number>(0.75); // %
  const [activeVolatilityAlert, setActiveVolatilityAlert] = useState<VolatilityAlertEvent | null>(null);
  const [activeZoneAlert, setActiveZoneAlert] = useState<PriceZoneAlert | null>(null);

  // Buffer to track price history for volatility calculation: [timestamp, price]
  const priceHistoryRef = useRef<{ timestamp: number; price: number }[]>([]);
  const lastPriceRef = useRef<number | undefined>(undefined);
  const audioUnlockedRef = useRef<boolean>(false);

  // Save zones to localStorage
  useEffect(() => {
    localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(zones));
  }, [zones]);

  // Audio unlock helper for mobile browsers (user interaction requirement)
  const unlockAudio = () => {
    if (!audioUnlockedRef.current) {
      soundManager.playZoneAlert('support');
      audioUnlockedRef.current = true;
    }
  };

  // Add a new zone
  const addZone = (price: number, type: 'support' | 'resistance', label?: string) => {
    const newZone: PriceZoneAlert = {
      id: Math.random().toString(36).substring(2, 9),
      price,
      type,
      label: label?.trim() || `${type === 'support' ? 'Soporte' : 'Resistencia'} @ ${price.toFixed(5)}`,
      active: true,
      createdAt: Date.now()
    };
    setZones(prev => [newZone, ...prev]);
  };

  // Toggle zone active status
  const toggleZone = (id: string) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z));
  };

  // Delete a zone
  const deleteZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
  };

  // 3. Evaluate Alerts on price tick
  useEffect(() => {
    if (!currentPrice || currentPrice <= 0) return;
    const now = Date.now();

    // A. Update Volatility Sliding Window (last 60 seconds)
    const history = priceHistoryRef.current;
    history.push({ timestamp: now, price: currentPrice });

    // Remove points older than 60 seconds
    const cutoff = now - 60000;
    while (history.length > 0 && history[0].timestamp < cutoff) {
      history.shift();
    }

    // Evaluate Volatility spike
    if (history.length > 2) {
      const oldestPoint = history[0];
      const changePct = ((currentPrice - oldestPoint.price) / oldestPoint.price) * 100;
      const absChange = Math.abs(changePct);

      if (absChange >= volatilityThreshold) {
        const direction = changePct > 0 ? 'pump' : 'dump';
        
        // Cooldown for alert trigger (don't spam every millisecond)
        if (!activeVolatilityAlert || (now - activeVolatilityAlert.timestamp > 15000)) {
          const alertEvent: VolatilityAlertEvent = {
            id: String(now),
            timestamp: now,
            percentChange: Number(changePct.toFixed(2)),
            durationSeconds: Math.round((now - oldestPoint.timestamp) / 1000),
            fromPrice: oldestPoint.price,
            toPrice: currentPrice,
            direction
          };

          setActiveVolatilityAlert(alertEvent);
          soundManager.playVolatilityAlert(direction);
          sendBrowserNotification(`⚡ Alerta de Volatilidad: ARPA/USDT`, {
            body: `${direction === 'pump' ? '🚀 PUMP' : '🔻 DUMP'}: ${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}% en ${alertEvent.durationSeconds}s ($${currentPrice})`
          });
        }
      }
    }

    // B. Check Price Zones (Support / Resistance touches & crossovers)
    const prev = lastPriceRef.current;
    if (prev !== undefined) {
      zones.forEach(zone => {
        if (!zone.active) return;

        // Check if price crossed the line or is extremely close (0.05% tolerance)
        const crossedAbove = prev <= zone.price && currentPrice >= zone.price;
        const crossedBelow = prev >= zone.price && currentPrice <= zone.price;
        const touched = Math.abs(currentPrice - zone.price) / zone.price <= 0.0005;

        if (crossedAbove || crossedBelow || touched) {
          // Trigger alert
          setActiveZoneAlert({ ...zone, triggeredAt: now });
          soundManager.playZoneAlert(zone.type);

          sendBrowserNotification(`🎯 Zona Tocada: ${zone.label}`, {
            body: `Precio actual: $${currentPrice.toFixed(5)} tocó tu nivel marcado de $${zone.price.toFixed(5)}.`
          });

          // Deactivate zone temporarily or mark as triggered to avoid loop
          setZones(prevList => prevList.map(z => z.id === zone.id ? { ...z, active: false, triggeredAt: now } : z));
        }
      });
    }

    lastPriceRef.current = currentPrice;
  }, [currentPrice, zones, volatilityThreshold, activeVolatilityAlert]);

  return {
    zones,
    addZone,
    toggleZone,
    deleteZone,
    volatilityThreshold,
    setVolatilityThreshold,
    activeVolatilityAlert,
    dismissVolatilityAlert: () => setActiveVolatilityAlert(null),
    activeZoneAlert,
    dismissZoneAlert: () => setActiveZoneAlert(null),
    unlockAudio
  };
}
