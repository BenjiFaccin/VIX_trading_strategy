---
sidebar_position: 2
---

# Selected Strategies

After applying strict performance filters to the 2,500 backtested strategy profiles, I retained a highly selective set of **38 strategies**, representing just **1.52%** of the total.

These strategies were chosen based on:
- **Winrate ≥ 60%**
- **Positive total return**
- **Minimum 26 trades**

---

## 📊 Key Metrics of Selected Profiles

**Total number of transactions backtested**: **21,480**  
**VIX spike intervals analyzed**: **[10.00 – 60.00]**  
**Strategies selected**: **38 out of 2,500** (**1.52%**)

**Average Winrate** across selected strategies: **92.29%**  
**Average Risk/Reward Ratio**: **89.41**

---

## 📈 Visual Insights

### 🔁 Cumulative Return

A smooth and consistently increasing return curve based on deploying **1 contract per leg** for every trade across all selected profiles (2010–2023).  
*Execution assumption: Buying at ask, selling at bid (worst-case scenario)*

![Cumulative Return Chart](/img/cumreturn.png)

---

### 📊 Winrate Distribution

All selected strategies have **winrates well above 75%**, with many reaching close to **100%** reliability.

![Winrate by Strategy](/img/winrate.png)

---

### 📉 Risk/Reward Ratio Distribution

The majority of strategies exhibit **positive asymmetry**, and several offer exceptional **risk-adjusted returns** (R/R > 200).

![Risk/Reward Ratios](/img/rr.png)

---

### 🔻 Cumulative Max Drawdown

The drawdowns were tightly contained even across different market conditions, confirming the defensive nature of the selected spreads.

![Max Drawdown Chart](/img/cummaxdrawdown.png)

---

## ✅ Next Steps

These 38 strategies form the **core base** for:
- Signal generation
- Forward testing
- Live deployment under monitored execution environments

Each strategy will be further evaluated in terms of **regime behavior**, **volatility clustering**, and **time-series dependency** to fine-tune real-time filters.
