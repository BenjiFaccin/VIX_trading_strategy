---
sidebar_position: 2
---

# Real-time Dashboards

To monitor the live behavior of the forward-tested VIX trading strategies, I built and deployed a **real-time analytics dashboard**, accessible under the **"ForwardTesting"** tab:

👉 [View Dashboard Live](https://vix-trading-strategy.vercel.app/performances)

This dashboard is automatically updated **every 60 seconds**, providing near real-time visibility into trade activity, performance evolution, and operational health of the trading bot.

---

## 📊 What It Tracks

### ✅ Transactions Analysis

The top section gives a **global overview** of trading activity:
- **Total trades executed**
- **Current win rate**
- Daily bar charts of **entries vs. exits**
- Execution rates for monitoring latency or market conditions


---

### 🔄 Cancelled Orders Monitoring

To keep execution quality high, the dashboard tracks:
- **Cancelation rates** over time
- Total **cancelled spreads**
- **Cancelled costs** (potential premium lost due to missed execution)

This helps refine limit order pricing logic and monitor market efficiency.

---

### 📈 Performance Review

The "Performances Review" panel includes:
- **Cumulative row return vs. net return**
- Helps assess trading efficiency and slippage
- Ideal for monitoring **strategy drift** or **cost overruns**

Currently shown with limited sample due to early-stage forward testing.

---

### 💸 Cost and Commissions Tracking

Two additional live metrics:
- **Total Costs Over Time** (spread cost basis)
- **Total Commissions** (based on Interactive Brokers real fees)

These metrics are essential for computing net profitability and ensuring model assumptions align with reality.

---