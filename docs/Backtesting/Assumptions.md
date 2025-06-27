---
sidebar_position: 1
---

# Assumptions

This page outlines the **core assumptions** and logic used during the backtesting phase of the VIX Bear Put Spread strategy. All simulations were based on the **cleaned historical EoD options data** from 2010 to 2023 and implemented using a custom-built Python script.

---

## 📊 Strategy Setup

Each backtest simulates a **bear put spread** built when the VIX reached certain spike levels. The key structural elements of each test include:

- **Sell put strike levels**: Ranged from 10 to 60 with a step of 1.
- **VIX spike thresholds**: Backtests were segmented by daily high VIX values between 10 and 60, in 1-point bands (e.g., 15–16).
- **ATM (at-the-money) puts**: Chosen dynamically from the options available in the filtered dataset per day.
- **Max Days to Expiration (DTE)**: Only trades with DTE ≤ 30 were considered.

---

## ⚙️ Simulation Logic

Each trading scenario followed these steps:

1. **File and Year Looping**:  
   All cleaned `.xlsx` files were processed year by year.

2. **Trigger Condition**:  
   The strategy activates when the **daily VIX high** falls within a defined threshold band (e.g., between 18 and 19).

3. **Option Filtering**:  
   - Puts are filtered based on volume and DTE.
   - The strategy selects both a sell leg (fixed strike) and a dynamically identified ATM leg.

4. **Price Calculation**:  
   - The **ATM (buy) leg is entered at the ask price** — assuming worst-case slippage.
   - The **Sell leg is entered at the bid price** — again assuming conservative pricing.
   - If either quote is missing or zero, the script falls back to the last traded price, and if needed, the average of bid/ask.
   - This ensures **no optimistic mid-price fills**, and better reflects **realistic execution under live market conditions**.

5. **Return Calculation**:  
   - Option expiry prices are based on **LOW_DTE_BUY** and **LOW_DTE_SELL** (historical lows during holding period).
   - The strategy computes net spread return:  
     `spread_return = (expiry value ± spread difference) - fees`

6. **Fee Assumption**:  
   - **Interactive Brokers fees**: $0.85 per contract, i.e., $1.70 per spread. Note that it should be a little bit higher ($1.35) per trade, as I regurlarly see on my forwardtesting.

7. **Profit Capping**:  
   - Profit is bounded based on max intrinsic value of the spread: `(ATM strike – Sell strike) × 100`

---

## 📁 Output Format

Each backtest result is saved as a `.csv` file named according to:
<div class="extra-space"></div>
vix_put_spread_results_threshold_`low-high`strike`sell_strike`.csv

Each file contains:

- Trade date  
- VIX high that triggered the trade  
- DTE and strike levels  
- Spread cost and max profit  
- Expiry value and final return

---

## 📈 Metrics Computation

A separate function computes performance metrics per profile:

- **Total return**
- **Max drawdown** (from cumulative return series)
- **Winrate (%)**
- **Number of trades**

Only files with a valid `'RETURN'` column are used in metric calculations.

---

## 🧠 Key Assumptions Summary

| Assumption                             | Value/Rule                                 |
|----------------------------------------|--------------------------------------------|
| VIX data range                         | 2010–2023                                   |
| Strike intervals                       | 10 to 60, step 1                            |
| Threshold range (VIX High)             | 10 to 60, step 1                            |
| DTE max                                | 30 days                                     |
| Put volume filter                      | Minimum 75 contracts                        |
| Fee per spread (IB)                    | $1.70                                       |
| Trade exit price basis                 | Historical LOW (intraday low during DTE)    |
| Execution fill logic                   | Uses P_BID, P_ASK, P_LAST fallback hierarchy|

---

This framework forms the **foundation of all forward testing** and signal analysis done in the strategy. Every parameter can be modified for scenario analysis or sensitivity testing.
