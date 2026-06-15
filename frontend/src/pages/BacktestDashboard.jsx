import React, { useState, useEffect } from 'react';
import { runBacktestAPI, getLivePriceAPI, getBacktestHistoryAPI } from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function BacktestDashboard() {
  const [ticker, setTicker] = useState('AAPL');
  const [strategyType, setStrategyType] = useState('MA_CROSSOVER');
  
  // Strategy Hyperparameters
  const [shortPeriod, setShortPeriod] = useState(20);
  const [longPeriod, setLongPeriod] = useState(50);
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [overbought, setOverbought] = useState(70);
  const [oversold, setOversold] = useState(30);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);

  // Live price tracking states
  const [livePrice, setLivePrice] = useState(null);
  const [liveChange, setLiveChange] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');

  const loadHistoryFeed = async () => {
    try {
      const data = await getBacktestHistoryAPI();
      setHistory(data);
    } catch (err) {
      console.log("Database history trace offline.");
    }
  };

  useEffect(() => {
    loadHistoryFeed();
  }, [results]);

  useEffect(() => {
    let intervalId;
    const fetchLiveTicker = async () => {
      try {
        const data = await getLivePriceAPI(ticker);
        setLivePrice(data.currentPrice);
        setLiveChange(data.dailyPctChange);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (err) {
        console.log("Live stream market session inactive.");
      }
    };

    fetchLiveTicker();
    intervalId = setInterval(fetchLiveTicker, 10000);
    return () => clearInterval(intervalId);
  }, [ticker]);

  const handleClearHistory = async () => {
    if (window.confirm("// ACTION MATRIX REQUIRED: Are you sure you want to permanently delete your execution logs?")) {
      try {
        await clearBacktestHistoryAPI();
        setHistory([]); // Instantly clear the sidebar UI arrays state
      } catch (err) {
        alert("Failed to clear cloud engine logs.");
      }
    }
  };

  const handleExecute = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    // Package parameters context dynamically based on strategy selection
    const parameters = strategyType === 'MA_CROSSOVER' 
      ? { shortPeriod: int(shortPeriod), longPeriod: int(longPeriod) }
      : { period: int(rsiPeriod), overbought: float(overbought), oversold: float(oversold) };

    try {
      const data = await runBacktestAPI({
        ticker,
        strategyType,
        parameters,
        saveStrategy: true
      });
      setResults(data);
    } catch (err) {
      alert("Pipeline Failure: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadPastRun = (item) => {
    setTicker(item.ticker);
    setStrategyType(item.strategyType || 'MA_CROSSOVER');
    if (item.parameters) {
      if (item.strategyType === 'RSI') {
        setRsiPeriod(item.parameters.period || 14);
        setOverbought(item.parameters.overbought || 70);
        setOversold(item.parameters.oversold || 30);
      } else {
        setShortPeriod(item.parameters.shortPeriod || 20);
        setLongPeriod(item.parameters.longPeriod || 50);
      }
    }
  };

  // Helper type conversions for safe JSON payloads
  const int = (val) => parseInt(val, 10) || 0;
  const float = (val) => parseFloat(val) || 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 font-sans select-none selection:bg-brand-yellow selection:text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Branding Banner Header */}
        <header className="bg-brand-yellow text-black border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden">
          <div className="absolute right-4 top-2 text-8xl font-black opacity-10 font-mono tracking-tighter">DATA_ENG</div>
          <h1 className="text-4xl font-black uppercase tracking-tight font-mono">QUANTEDGE // TERMINAL</h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Algorithmic Trading & Vectorized Backtesting Portal v4.0</p>
        </header>

        {/* Real-time Ticker Ribbon */}
        <div className="bg-[#141414] border-4 border-black p-4 flex items-center justify-between font-mono text-sm shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center space-x-4">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-black text-brand-yellow">// LIVE FEED MATRIX:</span>
            <span className="bg-black text-white px-2 py-1 font-bold border border-zinc-700">{ticker}</span>
          </div>
          <div className="flex space-x-8">
            <div>PRICE: <span className="text-white font-black">${livePrice ? livePrice.toFixed(2) : 'FETCHING...'}</span></div>
            <div>24H CHANGE: <span className={`font-black ${liveChange >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>{liveChange ? `${liveChange.toFixed(2)}%` : '--'}</span></div>
            <div className="text-zinc-500 text-xs flex items-center">LAST TICK: {lastUpdate || 'CONNECTING...'}</div>
          </div>
        </div>

        {/* Two-Column Grid Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LEFT SIDEBAR: Logs */}
          <div className="bg-[#141414] border-4 border-black p-4 flex flex-col h-[675px]">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-yellow font-mono mb-4">// EXECUTION LOGS (MONGO)</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => loadPastRun(item)}
                    className="bg-black border border-zinc-800 p-3 cursor-pointer hover:border-brand-yellow transition-colors group relative"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-black text-white group-hover:text-brand-yellow">{item.ticker}</span>
                      <span className="text-[9px] text-zinc-500 font-mono uppercase bg-zinc-900 px-1 border border-zinc-800">
                        {item.strategyType === 'RSI' ? 'RSI' : 'MA_CROSS'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      Ret: <span className={item.metrics?.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-500'}>
                        {(item.metrics?.totalReturn * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-zinc-600 font-mono text-xs p-4 text-center border border-dashed border-zinc-800">[ Log clear ]</div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Workspace */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Form Inputs Parameter Grid Container */}
            <form onSubmit={handleExecute} className="bg-[#141414] p-4 border-4 border-black shadow-[4px_4px_0px_0px_#FFE600] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-brand-yellow mb-1 font-mono">// ASSET INDICES (e.g. TSLA, NVDA, BTC-USD)</label>
                  <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} className="w-full bg-black border border-white text-white font-mono font-bold p-2 outline-none focus:border-brand-yellow uppercase" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-brand-yellow mb-1 font-mono">// CALCULUS MODELS</label>
                  <select value={strategyType} onChange={(e) => setStrategyType(e.target.value)} className="w-full bg-black border border-white text-white font-mono font-bold p-2 outline-none focus:border-brand-yellow appearance-none rounded-none">
                    <option value="MA_CROSSOVER">MA_CROSSOVER (Moving Average)</option>
                    <option value="RSI">RSI (Relative Strength Index)</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC HYPERPARAMETER BOXES SUB-GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-800 pt-3">
                {strategyType === 'MA_CROSSOVER' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1 font-mono">Short Period (Fast)</label>
                      <input type="number" value={shortPeriod} onChange={(e) => setShortPeriod(e.target.value)} className="w-full bg-black border border-zinc-700 text-white font-mono p-2 outline-none focus:border-brand-yellow" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1 font-mono">Long Period (Slow)</label>
                      <input type="number" value={longPeriod} onChange={(e) => setLongPeriod(e.target.value)} className="w-full bg-black border border-zinc-700 text-white font-mono p-2 outline-none focus:border-brand-yellow" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1 font-mono">RSI Lookback Window</label>
                      <input type="number" value={rsiPeriod} onChange={(e) => setRsiPeriod(e.target.value)} className="w-full bg-black border border-zinc-700 text-white font-mono p-2 outline-none focus:border-brand-yellow" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1 font-mono">Overbought Threshold</label>
                      <input type="number" value={overbought} onChange={(e) => setOverbought(e.target.value)} className="w-full bg-black border border-zinc-700 text-white font-mono p-2 outline-none focus:border-brand-yellow" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1 font-mono">Oversold Threshold</label>
                      <input type="number" value={oversold} onChange={(e) => setOversold(e.target.value)} className="w-full bg-black border border-zinc-700 text-white font-mono p-2 outline-none focus:border-brand-yellow" />
                    </div>
                  </>
                )}
                
                <div className="flex items-end md:col-span-1">
                  <button type="submit" disabled={loading} className="w-full bg-white text-black font-black uppercase tracking-wider p-2.5 border border-black hover:bg-brand-yellow transition-colors shadow-[2px_2px_0px_0px_#FFE600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer text-xs">
                    {loading ? '[ COMPILING... ]' : '[ RUN EVALUATION ]'}
                  </button>
                </div>
              </div>
            </form>

            {/* Display Analytics Blocks if active */}
            {results ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Strategy Total Return', value: `${(results.metrics.totalReturn * 100).toFixed(2)}%`, bg: 'bg-[#141414]', text: 'text-brand-yellow', border: 'border-white' },
                    { label: 'Annualized Growth', value: `${(results.metrics.annualizedReturn * 100).toFixed(2)}%`, bg: 'bg-[#141414]', text: 'text-white', border: 'border-white' },
                    { label: 'Sharpe Safety Scale', value: results.metrics.sharpeRatio.toFixed(2), bg: 'bg-white', text: 'text-black', border: 'border-black', shadow: 'shadow-[4px_4px_0px_0px_#FFE600]' },
                    { label: 'Max Peak Drawdown', value: `${(results.metrics.maxDrawdown * 100).toFixed(2)}%`, bg: 'bg-[#141414]', text: 'text-rose-500', border: 'border-white' }
                  ].map((m, idx) => (
                    <div key={idx} className={`${m.bg} border-4 ${m.border} p-3 relative ${m.shadow || ''}`}>
                      <span className="text-[9px] uppercase font-black tracking-widest block opacity-60 font-mono mb-0.5">{m.label}</span>
                      <span className={`text-2xl font-black tracking-tight font-mono ${m.text}`}>{m.value}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-[#141414] border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-yellow font-mono mb-4">// VECTOR OPTIMIZATION EQUATION MODEL MAP</h3>
                  <div className="h-[400px] w-full bg-black border border-zinc-800 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.equityCurve}>
                        <CartesianGrid strokeDasharray="2 2" stroke="#222" />
                        <XAxis dataKey="date" stroke="#666" tickLine={true} fontSize={10} />
                        <YAxis stroke="#666" tickLine={true} fontSize={10} domain={['dataMin', 'dataMax']} />
                        <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#FFE600', color: '#FFF', fontFamily: 'monospace', fontSize: 12 }} />
                        <Area type="monotone" name="System" dataKey="equity" stroke="#FFE600" strokeWidth={2.5} fillOpacity={0.03} fill="#FFE600" />
                        <Area type="monotone" name="Benchmark" dataKey="benchmark" stroke="#FFFFFF" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-4 border-dashed border-zinc-800 h-[510px] flex items-center justify-center text-zinc-600 font-mono text-xs uppercase">
                [ Waiting for matrix pipeline deployment // Click execution parameter array to calculate vectors ]
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}