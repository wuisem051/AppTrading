import React, { useEffect, useRef } from 'react';
import { 
  createChart, 
  ColorType, 
  CandlestickSeries,
  type ISeriesApi,
  type IChartApi,
  type Time
} from 'lightweight-charts';
import type { KlineCandle, PriceZoneAlert, Timeframe } from '../types/trading';

interface TradingChartProps {
  candles: KlineCandle[];
  currentCandle: KlineCandle | null;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  zones: PriceZoneAlert[];
  onAddZoneByClick?: (price: number) => void;
}

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export const TradingChart: React.FC<TradingChartProps> = ({
  candles,
  currentCandle,
  timeframe,
  onTimeframeChange,
  zones,
  onAddZoneByClick
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const priceLinesRef = useRef<{ [key: string]: ReturnType<ISeriesApi<'Candlestick'>['createPriceLine']> }>({});
  const onAddZoneByClickRef = useRef(onAddZoneByClick);
  onAddZoneByClickRef.current = onAddZoneByClick;

  // 1. Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#090d14' },
        textColor: '#848e9c',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
      },
      crosshair: {
        vertLine: {
          color: 'rgba(99, 102, 241, 0.5)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#4f46e5',
        },
        horzLine: {
          color: 'rgba(99, 102, 241, 0.5)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#4f46e5',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(30, 41, 59, 0.8)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.15,
        },
      },
      timeScale: {
        borderColor: 'rgba(30, 41, 59, 0.8)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
      priceFormat: {
        type: 'price',
        precision: 5,
        minMove: 0.00001,
      },
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Click handler on chart to add zone at clicked price
    chart.subscribeClick((param) => {
      if (param.point && onAddZoneByClickRef.current) {
        const coordinatePrice = series.coordinateToPrice(param.point.y);
        if (coordinatePrice !== null && coordinatePrice > 0) {
          onAddZoneByClickRef.current(coordinatePrice);
        }
      }
    });

    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // 2. Feed historical candles
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    const formattedData = candles.map(c => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));

    seriesRef.current.setData(formattedData);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // 3. Real-time candle updates
  useEffect(() => {
    if (!seriesRef.current || !currentCandle) return;

    seriesRef.current.update({
      time: currentCandle.time as Time,
      open: currentCandle.open,
      high: currentCandle.high,
      low: currentCandle.low,
      close: currentCandle.close
    });
  }, [currentCandle]);

  // 4. Synchronize Support/Resistance Price Lines
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    // Remove old lines
    Object.values(priceLinesRef.current).forEach(line => {
      series.removePriceLine(line);
    });
    priceLinesRef.current = {};

    // Render active zones
    zones.forEach(zone => {
      if (!zone.active) return;

      const isSupport = zone.type === 'support';
      const color = isSupport ? '#10b981' : '#f43f5e';

      const line = series.createPriceLine({
        price: zone.price,
        color: color,
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `${zone.label} ($${zone.price.toFixed(5)})`,
      });

      priceLinesRef.current[zone.id] = line;
    });
  }, [zones]);

  return (
    <div className="flex flex-col h-full w-full bg-[#090d14] rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl relative">
      
      {/* Top Toolbar: Timeframe Selector & Chart Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0c1017] border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-2 hidden sm:inline">
            Periodo:
          </span>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                timeframe === tf
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            💡 Haz clic en el gráfico para marcar una zona
          </span>
          <button
            onClick={() => chartRef.current?.timeScale().fitContent()}
            className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Auto ajustar escala"
          >
            Ajustar
          </button>
        </div>
      </div>

      {/* Lightweight Charts Canvas Container */}
      <div ref={chartContainerRef} className="w-full flex-1 min-h-[420px]" />
    </div>
  );
};
