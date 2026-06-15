# 📈 QuantEdge — Full-Stack Algorithmic Trading Backtester

QuantEdge is a full-stack quantitative finance platform that enables users to create, evaluate, and backtest trading strategies using historical market data. The application combines a modern React dashboard, a secure Node.js backend, and a dedicated Python analytics engine to deliver portfolio insights, risk metrics, and strategy performance analysis.

---

## 🚀 Features

### Authentication & User Management

* Secure user registration and login
* JWT-based authentication
* Password hashing with bcrypt
* Protected API routes

### Strategy Backtesting

* Moving Average Crossover Strategy
* RSI Strategy
* Momentum Strategy
* Custom strategy parameters

### Quantitative Analytics

* Total Return
* Annualized Return
* Volatility
* Sharpe Ratio
* Maximum Drawdown
* Win Rate
* Portfolio Performance Tracking

### Data Visualization

* Price Charts
* Equity Curves
* Portfolio Growth Analysis
* Drawdown Visualization
* Correlation Heatmaps
* Risk vs Return Analysis

---

## 🏗️ System Architecture

```text
React Frontend
        │
        ▼
Node.js + Express API
        │
        ├────────────► MongoDB Atlas
        │
        ▼
Python Analytics Engine
(Pandas • NumPy • Matplotlib)
```

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication

### Analytics Engine

* Python
* Pandas
* NumPy
* Matplotlib
* Financial Performance Metrics

---

## 📊 Quantitative Metrics

### Moving Average Crossover

Generates buy and sell signals based on the crossover of short-term and long-term moving averages.

### Volatility

Measures the standard deviation of asset returns to estimate risk.

### Maximum Drawdown

Measures the largest decline from a portfolio peak to its lowest point.

```math
Drawdown = \frac{Peak - Trough}{Peak}
```

### Sharpe Ratio

Evaluates risk-adjusted returns.

```math
Sharpe Ratio = \frac{R_p - R_f}{\sigma_p}
```

Where:

* Rp = Portfolio Return
* Rf = Risk-Free Rate
* σp = Portfolio Volatility

---

## 🛠️ Tech Stack

| Layer          | Technologies                      |
| -------------- | --------------------------------- |
| Frontend       | React, Vite, Tailwind CSS         |
| Backend        | Node.js, Express.js               |
| Database       | MongoDB Atlas                     |
| Analytics      | Python, Pandas, NumPy, Matplotlib |
| Authentication | JWT, bcrypt                       |
| Deployment     | Vercel, Render                    |

---

## 📂 Project Structure

```text
QuantEdge/
│
├── frontend/
├── backend/
├── python-service/
├── docs/
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (.env)

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Frontend (.env)

```env
VITE_API_GATEWAY_URL=http://localhost:8080/api
```

---

## 🚀 Local Setup

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Python Analytics Service

```bash
cd python-service

pip install -r requirements.txt

python app.py
```

---

## 🎯 Future Enhancements

* Live Market Data Integration
* Paper Trading Environment
* Portfolio Optimization Models
* Machine Learning-Based Signal Generation
* Real-Time WebSocket Market Streams

---

## 📄 License

This project is developed for educational, research, and portfolio purposes.
