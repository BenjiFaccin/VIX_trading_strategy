---
sidebar_position: 1
---

# IBKR Integration

To forward-test my selected VIX trading strategies in real market conditions, I integrated the entire automation pipeline with **Interactive Brokers (IBKR)** using their **IB Gateway API** via the `ib_insync` Python library.

---

## 🔌 API Connection Setup

The system connects to IBKR using:
- `host = 127.0.0.1`
- `port = 4002` (paper account)
- `clientId = 1 / 2 / 3*`

*Different clientId because as several codes simulateneously interact with ib gateway, I have to connect through a different clientId to avoid errors. 
This allows real-time interaction with **live or delayed data**, order placement, monitoring, and trade logging.

---

## 🧪 Paper Account for Forward Testing

All live testing is done via an **IBKR paper account**, ensuring:
- No capital risk during development
- Realistic order behavior
- Access to true bid/ask spreads
- Reliable monitoring of execution slippage and commissions

---

## 🕒 Market Data Subscription Tiers

Initially, I relied on **delayed market data**, which is sufficient for architecture validation. However, for proper spread pricing and execution logic, I later subscribed to the following **live feeds**:

| Feed | Description | Monthly Cost |
|------|-------------|---------------|
| CBOE Streaming Market Indexes (NP) | Live VIX index quotes | USD 3.50 |
| OPRA (US Options Exchanges) (NP, L1) | Live options chain (bid/ask) | USD 1.50 *(waived if $20/month in commissions)* |

![IBKR Market Data Subscriptions](/img/databought.png)

---

## 📈 What Data Is Pulled

Once live data is enabled, the strategy uses:

- **Live VIX price** (spot value)
- **Live option chain** for:
  - Put bid/ask per strike
  - Expirations with less than 31 DTE
- **Greeks** (delta, vega, theta, gamma) for strike selection
- **Open positions and pending orders** for conflict resolution

---

## 🛠️ Execution Logic

The system dynamically scans available strategy files based on:
- The **current VIX spike threshold**
- Available expiration dates (under 31 DTE)
- Matching **DTE sheets** within the strategy file

---

## 🧾 Trade Logging

Every attempted or successful trade is logged to a CSV file with full metadata:
- Trade status (filled / partial / skipped)
- Strike, expiration, VIX price, commissions
- Execution prices, cost basis, and associated strategy file
- Q3 threshold and average expiry value for evaluation

This enables robust tracking and future improvement of execution efficiency.

---

## ✅ Summary

The integration with IBKR allows me to:
- **Forward test strategies in a realistic trading environment**
- Use **live pricing and execution logic**
- Log and monitor performance over time
- Ensure compatibility with real-world slippage and commissions

The setup ensures every trade follows the original strategy assumptions and thresholds, while being validated against actual market data.

