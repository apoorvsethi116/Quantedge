const mongoose = require('mongoose');

const StrategySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  strategyType: { type: String, enum: ['MA_CROSSOVER', 'RSI', 'MOMENTUM'], required: true },
  parameters: { type: Map, of: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Strategy', StrategySchema);