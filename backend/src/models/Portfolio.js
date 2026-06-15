const mongoose = require('mongoose');

const AssetAllocationSchema = new mongoose.Schema({
  ticker: { type: String, required: true, uppercase: true },
  allocation: { type: Number, required: true } // Represented as decimal, e.g., 0.40 for 40%
});

const PortfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  assets: [AssetAllocationSchema],
  metrics: {
    expectedReturn: { type: Number },
    volatility: { type: Number },
    sharpeRatio: { type: Number },
    diversificationScore: { type: Number }
  },
  correlationMatrix: { type: Map, of: { type: Map, of: Number } },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);