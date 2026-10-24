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

export interface TradingPairConfig {
  id: string;          // e.g. 'BELUSDT'
  baseAsset: string;   // 'BEL'
  quoteAsset: string;  // 'USDT'
  label: string;       // 'BEL/USDT'
  streamName: string;  // 'belusdt'
  precision: number;   // 4 or 5
}

export const SUPPORTED_PAIRS: TradingPairConfig[] = [
  {
    id: 'BELUSDT',
    baseAsset: 'BEL',
    quoteAsset: 'USDT',
    label: 'BEL/USDT',
    streamName: 'belusdt',
    precision: 4
  },
  {
    id: 'ARPAUSDT',
    baseAsset: 'ARPA',
    quoteAsset: 'USDT',
    label: 'ARPA/USDT',
    streamName: 'arpausdt',
    precision: 5
  }
];

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
