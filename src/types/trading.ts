export interface TickerData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  lastUpdate: number;
  tickDirection: 'up' | 'down' | 'neutral';
}

export interface KlineCandle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface PriceZoneAlert {
  id: string;
  label: string;
  price: number;
  type: 'support' | 'resistance';
  active: boolean;
  createdAt: number;
  triggeredAt?: number;
}

export interface VolatilityAlertEvent {
  id: string;
  timestamp: number;
  percentChange: number;
  durationSeconds: number;
  fromPrice: number;
  toPrice: number;
  direction: 'pump' | 'dump';
}
