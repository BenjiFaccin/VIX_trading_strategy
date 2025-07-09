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

---

### 📉 Exercised Legs Performance

To track the **final realized return** of spreads that were **held to expiry**, the dashboard now includes detailed analysis of the long and short legs:

#### 1. Cumulative Exercised Long & Short Leg Returns
- Shows **cumulative return** over time for both long and short legs
- Green = Long Leg returns
- Red = Short Leg returns

#### 2. Net Return Exercised Legs
- Highlights **net payoff** per expiry cycle
- Net = Long leg - Short leg payoff

#### 3. Net Cumulative Return Exercised Legs
- Total **cumulative profit** for exercised spreads over time
- Serves as a benchmark of realized profitability post-expiry

---

These metrics are essential for computing net profitability and ensuring model assumptions align with reality.