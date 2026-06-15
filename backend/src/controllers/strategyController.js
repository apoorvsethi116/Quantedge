const Strategy = require('../models/Strategy');
const Backtest = require('../models/Backtest');
const axios = require('axios');

exports.runStrategyBacktest = async (req, res) => {
  const { ticker, strategyType, parameters } = req.body;
  
  try {
    // 1. Forward calculations down to internal Python quantitative microservice
    const pythonEngineUrl = process.env.ANALYTICS_ENGINE_URL || 'http://localhost:5000/api/v1';
    const response = await axios.post(`${pythonEngineUrl}/analytics/backtest`, {
      ticker,
      strategyType,
      parameters
    });
    
    const { metrics, equityCurve, executedTrades } = response.data;
    
    // 2. Wrap and save data within database logging structures
    const backtestLog = new Backtest({
      userId: req.user?.id || "000000000000000000000000", // Fallback for testing without active logins
      ticker,
      parameters,
      metrics,
      equityCurve,
      executedTrades
    });

    const savedLog = await backtestLog.save();
    return res.status(201).json(savedLog);
  } catch (err) {
    console.error('Backtest Gateway proxy error:', err.message);
    return res.status(500).json({ error: 'Downstream calculation engine is offline or threw an exception.' });
  }
};

exports.getBacktestHistory = async (req, res) => {
  try {
    const records = await Backtest.find({ userId: req.user.id })
      .select('ticker parameters metrics runAt')
      .sort({ runAt: -1 });
    return res.status(200).json(records);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};