---
sidebar_position: 2
---

# Profiles' Generation

Following the backtest framework described in the [Assumptions](./Assumptions.md) page, I generated a total of **2,500 strategy profiles**. Each profile corresponds to a specific combination of:

- A **VIX spike threshold range** (e.g., 18–19)
- A **sell strike level** (from 10 to 60)
- A **bear put spread configuration**

This profiling system is designed to explore the performance of the strategy across a **broad volatility and strike space**, capturing edge cases and robust zones.

---

## 🔁 Systematic Profile Generation

The backtest script iterates over:
- **50 VIX threshold bands** from 10 to 60 (1-point intervals)
- **50 sell strike levels** from 10 to 60 (1-point intervals)


Each profile is saved as a separate `.csv` file in a folder structure based on the sell strike, and contains detailed trade-by-trade data for that configuration.

---

## 📊 Aggregated Metrics and Statistical Enrichment

Once the raw trade data is saved, I compute **summary statistics** per profile to guide future signal generation. These statistics include:

- **Total Return** over the entire period
- **Number of Trades**
- **Winrate (%)**
- **Max Drawdown**
- **Average Spread Cost** (i.e., average premium received at entry)
- **Average Expiry Value** (i.e., average value of the spread at expiration)
- **Quartiles (Q1, Q3)** of expiry values  
  This gives insight into the **distribution** of outcomes and allows for modeling:
  - **Entry points**: When the premium received is unusually high (above Q3)
  - **Exit points**: When expected loss becomes statistically significant (below Q1)

---

## 🗂️ Sample Output Structure

Each row in the aggregated `.csv` output example:

![Example of row data output](/img/outputex2.png)
![Example of summarized data output](/img/exsummary.png)

---

## 🎯 Why It Matters

These enriched statistics are critical to:
- **Identifying high-probability configurations**
- **Optimizing real-time trade selection**
- **Creating thresholds for when to enter or avoid trades**
- **Designing forward-tested entry/exit logic using statistical boundaries**

The final goal is to use these profiles as a **map** to navigate live trading decisions with context-aware triggers derived from historical probabilities and payout distributions.