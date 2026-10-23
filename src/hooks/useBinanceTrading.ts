import { useEffect, useRef, useState, useCallback } from 'react';
import type { TickerData, KlineCandle, Timeframe } from '../types/trading';

const SYMBOL_LOWER = 'arpausdt';
const SYMBOL_UPPER = 'ARPAUSDT';
const REST_BASE = 'https://api.binance.com/api/v3';
const WS_BASE = 'wss://stream.binance.com:9443/ws';

export function useBinanceTrading(timeframe: Timeframe = '1m') {
  const [ticker, setTicker] = useState<TickerData | null>(null);
  const [candles, setCandles] = useState<KlineCandle[]>([]);
  const [currentCandle, setCurrentCandle] = useState<KlineCandle | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latency, setLatency] = useState<number>(0);

  const prevPriceRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // 1. Fetch initial historical klines from REST API
  const fetchHistoricalCandles = useCallback(async (interval: string) => {
    try {
      const response = await fetch(`${REST_BASE}/klines?symbol=${SYMBOL_UPPER}&interval=${interval}&limit=500`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      const parsedCandles: KlineCandle[] = data.map((d: (string | number)[]) => ({
        time: Math.floor(Number(d[0]) / 1000), // convert ms to seconds for lightweight-charts
        open: parseFloat(String(d[1])),
        high: parseFloat(String(d[2])),
        low: parseFloat(String(d[3])),
        close: parseFloat(String(d[4])),
        volume: parseFloat(String(d[5]))
      }));

      setCandles(parsedCandles);
      if (parsedCandles.length > 0) {
        setCurrentCandle(parsedCandles[parsedCandles.length - 1]);
      }
    } catch (err) {
      console.error('Error fetching historical candles from Binance REST:', err);
    }
  }, []);

  // 2. Fetch initial 24h ticker data
  const fetchInitialTicker = useCallback(async () => {
    try {
      const response = await fetch(`${REST_BASE}/ticker/24hr?symbol=${SYMBOL_UPPER}`);
      if (!response.ok) return;
      const d = await response.json();
      const currentPrice = parseFloat(d.lastPrice);
      prevPriceRef.current = currentPrice;

      setTicker({
        symbol: 'ARPA/USDT',
        price: currentPrice,
        priceChange: parseFloat(d.priceChange),
        priceChangePercent: parseFloat(d.priceChangePercent),
        high24h: parseFloat(d.highPrice),
        low24h: parseFloat(d.lowPrice),
        volume24h: parseFloat(d.volume),
        quoteVolume24h: parseFloat(d.quoteVolume),
        lastUpdate: Date.now(),
        tickDirection: 'neutral'
      });
    } catch (err) {
      console.error('Error fetching initial 24h ticker:', err);
    }
  }, []);

  // 3. Connect Multi-Stream WebSocket (ticker + klines)
  useEffect(() => {
    fetchInitialTicker();
    fetchHistoricalCandles(timeframe);

    let active = true;

    const connectWs = () => {
      // Connect to combined stream: <symbol>@ticker / <symbol>@kline_<timeframe>
      // wss://stream.binance.com:9443/ws/arpausdt@ticker/arpausdt@kline_1m
      const streamUrl = `${WS_BASE}/${SYMBOL_LOWER}@ticker/${SYMBOL_LOWER}@kline_${timeframe}`;
      const ws = new WebSocket(streamUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!active) return;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (!active) return;
        const startTs = performance.now();
        try {
          const data = JSON.parse(event.data);

          // Handle 24hr ticker stream
          if (data.e === '24hrTicker') {
            const newPrice = parseFloat(data.c);
            let direction: 'up' | 'down' | 'neutral' = 'neutral';
            
            if (prevPriceRef.current !== null) {
              if (newPrice > prevPriceRef.current) direction = 'up';
              else if (newPrice < prevPriceRef.current) direction = 'down';
            }
            prevPriceRef.current = newPrice;

            setTicker({
              symbol: 'ARPA/USDT',
              price: newPrice,
              priceChange: parseFloat(data.p),
              priceChangePercent: parseFloat(data.P),
              high24h: parseFloat(data.h),
              low24h: parseFloat(data.l),
              volume24h: parseFloat(data.v),
              quoteVolume24h: parseFloat(data.q),
              lastUpdate: data.E,
              tickDirection: direction
            });
          }

          // Handle Kline stream
          if (data.e === 'kline') {
            const k = data.k;
            const updatedCandle: KlineCandle = {
              time: Math.floor(k.t / 1000),
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v)
            };

            setCurrentCandle(updatedCandle);
          }

          const ping = Math.round(performance.now() - startTs);
          setLatency(ping < 1 ? 1 : ping);
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      ws.onerror = (error) => {
        console.warn('Binance WebSocket error:', error);
      };

      ws.onclose = () => {
        if (!active) return;
        setIsConnected(false);
        // Exponential reconnect / safety retry after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (active) connectWs();
        }, 3000);
      };
    };

    connectWs();

    return () => {
      active = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [timeframe, fetchHistoricalCandles, fetchInitialTicker]);

  return {
    ticker,
    candles,
    currentCandle,
    isConnected,
    latency,
    refetchCandles: () => fetchHistoricalCandles(timeframe)
  };
}
