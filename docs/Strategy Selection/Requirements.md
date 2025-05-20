---
sidebar_position: 1
---

# Requirements

After generating over **2,500 strategy profiles** through backtesting, I implemented a filtering system to identify the most promising and robust configurations based on performance criteria.

This page outlines the **selection process** and **metrics** used to evaluate each strategy file and compile a shortlist of "best" strategies.

---

## 🎯 Filtering Logic

The script recursively scans all `.csv` output files from the backtesting phase. For each profile, it calculates a set of performance metrics and applies **three key requirements**:

1. **Winrate ≥ 60%**  
   The strategy must have a positive return in at least 60% of its trades.

2. **Total Return > 0**  
   Only strategies with a net profit over the backtest period are kept.

3. **At least 26 trades**  
   Ensures the result is statistically meaningful and not driven by outliers or rare events.

---

## 📊 Calculated Metrics

For each qualifying strategy, the following metrics are extracted and used for evaluation:

- **Number of Trades**  
- **Total Return**
- **Max Drawdown** (sum of negative returns)
- **Risk/Reward Ratio** (Total Return / |Drawdown|)
- **Winrate (%)**
- **List of DTE values** that passed the internal filters
- **Spread Cost Interval** (min to max value)
- **DTE-Level Quartiles**:
  - `Avg_Spread_Cost`, `Q1_Spread_Cost`, `Q3_Spread_Cost`
  - `Avg_Expiry_Value`, `Q1_Expiry_Value`, `Q3_Expiry_Value`

These additional quartiles will be reused later for:
- **Entry triggers** (e.g. spreads trading above Q3)
- **Exit triggers** (e.g. expiry value approaching Q1)

---

## 📁 Output and Folder Structure

For every strategy that met the requirements:
- A **summary CSV** is saved in a folder called `Best_New_Strategies/`
- The filename is prefixed with `Summary_` to distinguish it from raw results

At the end of the filtering, a **global summary file** is created:
![Example of summarized best strategies output](/img/exstrat.png)
