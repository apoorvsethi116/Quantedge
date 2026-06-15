import os
import yfinance as yf
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from analytics.strategies.backtester import VectorizedBacktester

app = Flask(__name__)

@app.route('/api/v1/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'online', 'service': 'QuantEngine'}), 200

@app.route('/api/v1/analytics/stock', methods=['POST'])
def stock_analysis():
    body = request.get_json() or {}
    ticker = body.get('ticker', '').upper()
    
    if not ticker:
        return jsonify({'error': 'Ticker parameter is mandatory'}), 400
        
    try:
        stock = yf.Ticker(ticker)
        
        # 1. Try pulling live 1-minute interval data for the current active day
        live_df = stock.history(period='1d', interval='1m')
        
        # 2. FALLBACK MECHANISM: If the market is closed/empty, pull the last 5 days of hourly bars
        if live_df.empty:
            print(f"// WARNING: Live trading window is currently inactive for {ticker}. Initializing fallback engine.")
            live_df = stock.history(period='5d', interval='1h')
            
        if live_df.empty:
            return jsonify({'error': 'No asset security data matrix could be generated.'}), 404
            
        current_price = float(live_df['Close'].iloc[-1])
        open_price = float(live_df['Open'].iloc[0])
        daily_change = current_price - open_price
        daily_pct_change = (daily_change / open_price) * 100
        
        return jsonify({
            'ticker': ticker,
            'currentPrice': current_price,
            'dailyChange': daily_change,
            'dailyPctChange': daily_pct_change
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/analytics/backtest', methods=['POST'])
def run_backtest():
    body = request.get_json() or {}
    ticker = body.get('ticker', '').upper()
    strategy_type = body.get('strategyType')
    params = body.get('parameters', {})
    
    if not ticker or not strategy_type:
        return jsonify({'error': 'Missing structured query schema parameters'}), 400
        
    try:
        df = yf.Ticker(ticker).history(period='5y')
        if df.empty:
            return jsonify({'error': 'Target symbol security matrix processing failed'}), 404
            
        tester = VectorizedBacktester(df)
        
        if strategy_type == 'MA_CROSSOVER':
            short_p = int(params.get('shortPeriod', 20))
            long_p = int(params.get('longPeriod', 50))
            tester.run_ma_crossover(short_p, long_p)
        elif strategy_type == 'RSI':
            pd_window = int(params.get('period', 14))
            ob = float(params.get('overbought', 70))
            os = float(params.get('oversold', 30))
            tester.run_rsi(pd_window, ob, os)
        else:
            return jsonify({'error': 'Strategy type implementation not supported'}), 400
            
        curve_data = []
        for idx, row in tester.df.iterrows():
            curve_data.append({
                'date': str(idx.date()),
                'equity': float(row['equity_curve']),
                'benchmark': float(row['benchmark_curve'])
            })
            
        return jsonify({
            'metrics': tester.metrics,
            'equityCurve': curve_data,
            'executedTrades': tester.trades
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/analytics/portfolio', methods=['POST'])
def portfolio_analytics():
    body = request.get_json() or {}
    assets = body.get('assets', [])
    
    if not assets:
        return jsonify({'error': 'Empty allocation weights provided'}), 400
        
    tickers = [a['ticker'].upper() for a in assets]
    weights = np.array([float(a['allocation']) for a in assets])
    
    if not np.isclose(np.sum(weights), 1.0):
        return jsonify({'error': 'Allocations must sum to 1.0'}), 400
        
    try:
        data = {}
        for t in tickers:
            hist = yf.Ticker(t).history(period='3y')
            if not hist.empty:
                data[t] = hist['Close']
                
        price_df = pd.DataFrame(data).dropna()
        returns_df = price_df.pct_change().dropna()
        
        cov_matrix = returns_df.cov() * 252
        corr_matrix = returns_df.corr().to_dict()
        
        port_expected_return = np.sum(returns_df.mean() * weights) * 252
        port_variance = np.dot(weights.T, np.dot(cov_matrix, weights))
        port_volatility = np.sqrt(port_variance)
        
        indiv_vols = np.array([returns_df[t].std() * np.sqrt(252) for t in tickers])
        weighted_vols = np.sum(indiv_vols * weights)
        div_score = weighted_vols / port_volatility if port_volatility > 0 else 1.0
        
        return jsonify({
            'metrics': {
                'expectedReturn': float(port_expected_return),
                'volatility': float(port_volatility),
                'sharpeRatio': float(port_expected_return / port_volatility) if port_volatility > 0 else 0.0,
                'diversificationScore': float(div_score)
            },
            'correlationMatrix': corr_matrix
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)