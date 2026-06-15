import numpy as np
import pandas as pd

def calculate_sma(series: pd.Series, period: int) -> pd.Series:
    return series.rolling(window=period).mean()

def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / (loss + 1e-9)
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_momentum(series: pd.Series, period: int) -> pd.Series:
    return series.diff(periods=period)