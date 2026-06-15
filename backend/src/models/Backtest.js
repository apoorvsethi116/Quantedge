const mongoose = require('mongoose');

const BacktestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  strategyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Strategy', required: false },
  ticker: { type: String, required: true, uppercase: true },
  parameters: { type: Map, of: mongoose.Schema.Types.Mixed },
  metrics: {
    totalReturn: { type: Number, required: true },
    annualizedReturn: { type: Number, required: true },
    sharpeRatio: { type: Number, required: true },
    sortinoRatio: { type: Number, required: true },
    maxDrawdown: { type: Number, required: true },
    winRate: { type: Number, required: true },
    profitFactor: { type: Number, required: true },
    numberOfTrades: { type: Number, required: true }
  },
  equityCurve: [{
    date: { type: String, required: true },
    equity: { type: Number, required: true },
    benchmark: { type: Number, required: true }
  }],
  executedTrades: [{
    type: { type: String, enum: ['BUY', 'SELL'], required: true },
    date: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: Number, required: true }
  }],
  runAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Backtest', BacktestSchema);