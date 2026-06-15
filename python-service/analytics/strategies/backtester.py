import numpy as np
import pandas as pd
from analytics.utils.indicators import calculate_sma, calculate_rsi, calculate_momentum

class VectorizedBacktester:
    def __init__(self, data: pd.DataFrame, initial_capital: float = 100000.0):
        self.df = data.copy()
        self.initial_capital = initial_capital

    def run_ma_crossover(self, short_period: int, long_period: int):
        self.df['short_ma'] = calculate_sma(self.df['Close'], short_period)
        self.df['long_ma'] = calculate_sma(self.df['Close'], long_period)
        
        self.df['signal'] = 0
        # 1 when short MA is above long MA, else 0
        self.df.loc[self.df['short_ma'] > self.df['long_ma'], 'signal'] = 1
        self.df['position'] = self.df['signal'].diff()
        self._evaluate_performance()
        return self

    def run_rsi(self, period: int, overbought: float, oversold: float):
        self.df['rsi'] = calculate_rsi(self.df['Close'], period)
        self.df['signal'] = 0
        
        # Vectorized signal state construction
        state = 0
        signals = []
        for rsi in self.df['rsi']:
            if pd.isna(rsi):
                signals.append(0)
            elif rsi < oversold:
                state = 1  # Long
                signals.append(state)
            elif rsi > overbought:
                state = 0  # Liquidate
                signals.append(state)
            else:
                signals.append(state)
                
        self.df['signal'] = signals
        self.df['position'] = self.df['signal'].diff()
        self._evaluate_performance()
        return self

    def _evaluate_performance(self):
        # Calculate daily system strategy returns
        self.df['market_returns'] = self.df['Close'].pct_change()
        # Shift signal by 1 day to execute on the next opening/day bar to avoid look-ahead bias
        self.df['strategy_returns'] = self.df['signal'].shift(1) * self.df['market_returns']
        self.df['strategy_returns'] = self.df['strategy_returns'].fillna(0)
        
        # Equity Curve calculation
        self.df['cum_market_returns'] = (1 + self.df['market_returns'].fillna(0)).cumprod()
        self.df['cum_strategy_returns'] = (1 + self.df['strategy_returns']).cumprod()
        self.df['equity_curve'] = self.initial_capital * self.df['cum_strategy_returns']
        self.df['benchmark_curve'] = self.initial_capital * self.df['cum_market_returns']
        
        # Peak equity tracking for Drawdown calculation
        self.df['peak'] = self.df['equity_curve'].cummax()
        self.df['drawdown'] = (this_dd := (self.df['equity_curve'] - self.df['peak']) / self.df['peak'])
        
        # Complete Strategy Diagnostics Parsing
        total_days = len(self.df)
        total_return = self.df['cum_strategy_returns'].iloc[-1] - 1
        
        # Annualized values assuming daily scale asset inputs
        ann_return = (1 + total_return) ** (252 / total_days) - 1 if total_return > -1 else -1
        daily_vol = self.df['strategy_returns'].std()
        ann_vol = daily_vol * np.sqrt(252)
        
        sharpe = ann_return / ann_vol if ann_vol > 0 else 0
        
        downside_returns = self.df['strategy_returns'][self.df['strategy_returns'] < 0]
        downside_vol = downside_returns.std() * np.sqrt(252)
        sortino = ann_return / downside_vol if downside_vol > 0 else 0
        
        max_dd = this_dd.min()
        
        # Parse simulated discrete order books
        trades = []
        trade_signals = self.df[self.df['position'] != 0]
        
        for idx, row in trade_signals.iterrows():
            if row['position'] == 1:
                trades.append({'type': 'BUY', 'date': str(idx.date()), 'price': float(row['Close']), 'size': 1.0})
            elif row['position'] == -1:
                trades.append({'type': 'SELL', 'date': str(idx.date()), 'price': float(row['Close']), 'size': 1.0})

        # Basic Trade Metrics Engine
        win_rate = 0.0
        profit_factor = 1.0
        if len(trades) > 1:
            trade_returns = []
            # Calculate returns pair matching basic FIFO/LIFO tracking
            for i in range(1, len(trades), 2):
                if trades[i-1]['type'] == 'BUY':
                    ret = (trades[i]['price'] - trades[i-1]['price']) / trades[i-1]['price']
                    trade_returns.append(ret)
            if trade_returns:
                pos_trades = [r for r in trade_returns if r > 0]
                neg_trades = [r for r in trade_returns if r <= 0]
                win_rate = len(pos_trades) / len(trade_returns) if len(trade_returns) > 0 else 0
                
                gross_profits = sum(pos_trades)
                gross_losses = abs(sum(neg_trades))
                profit_factor = gross_profits / gross_losses if gross_losses > 0 else (gross_profits if gross_profits > 0 else 1.0)

        self.metrics = {
            'totalReturn': float(total_return),
            'annualizedReturn': float(ann_return),
            'sharpeRatio': float(sharpe),
            'sortinoRatio': float(sortino),
            'maxDrawdown': float(max_dd),
            'winRate': float(win_rate),
            'profitFactor': float(profit_factor),
            'numberOfTrades': int(len(trades))
        }
        self.trades = trades