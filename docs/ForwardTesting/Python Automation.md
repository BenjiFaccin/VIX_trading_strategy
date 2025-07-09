---
sidebar_position: 2
---

# Python Automation

To bring the strategy to life, I developed a fully automated real-time execution pipeline that runs through **Interactive Brokers (IBKR)** using the `ib_insync` API. This section outlines the architecture, scheduling logic, and integration choices — **without disclosing proprietary entry or exit signals** to preserve the confidentiality of the trading strategy.

---

## 🚫 Confidentiality Notice

The **exact logic behind entry and exit signals will not be disclosed**, as it constitutes proprietary intellectual property critical to the strategy’s alpha. However, I describe here the **technical orchestration** and **automation design** that powers the forward testing.

---

## 🕰️ Scheduling Logic

All execution is constrained to **global US trading hours**, specifically:
- **09:30–16:00 ET**, Monday to Friday
- Avoids extended hours where liquidity is lower and bid/ask spreads widen

This ensures **better fills**, **tighter execution**, and more **accurate market exposure**.

---

## ⚙️ Core Files Overview

### 📥 `entry_trades.py`

This script:
- Connects to IBKR
- Loads the selected strategy profile based on the **current live VIX price**
- Qualifies available options with < 31 DTE
- Checks bid/ask conditions to **filter valid spreads**
- Dynamically submits **limit orders** to IBKR
- Monitors partial fills and **reprices** within limits
- Logs all actions in a dedicated `entry_trades.csv` file

✅ Trades are only placed if put spread meets defined requirements (undisclosed).

---

### 📤 `exit_trades.py`

This file monitors existing positions:
- Pulls filled trades from `entry_trades.csv`
- Re-evaluates their **current market value** based on live bid/ask
- Compares value to the **expected expiry value (from backtest Q3)**
- Places limit orders to **exit the long leg** of the spread
- Tracks and updates the outcome in `exit_trades.csv`

✅ Exits are only triggered when market pricing meets or exceeds predefined requirements (undisclosed).

---

## 🔁 Continuous Execution

To automate both entry and exit logic on a rolling basis throughout the day, I built two looped scripts:

### `loop_entry.py`
- Executes `entry_trades.py` every 60 seconds
- Pushes updated logs to Git for live portfolio monitoring

### `loop_exit.py`
- Executes `exit_trades.py` every 60 seconds
- Ensures exits are checked frequently as market evolves

---

## 📊 Exercised Leg Processing

### `exercisedlong.py`

This script:
- Reviews `entry_trades.csv` and marks filled spreads as **Exercised** once the expiration date has passed
- Extracts exercised long-leg trades and adds them to a dedicated `longleg_trades.csv`
- Uses **CBOE data scraping** to retrieve the **VIX settlement price**
- Calculates the **final payoff** of the long leg
- Logs processed trades to both internal and public-facing CSVs

✅ Helps compute realistic P&L based on true VIX expiration levels.

---

### `exercisedshort.py`

This script:
- Identical scheduling to `exercisedlong.py`, but focused on the **short leg** of spreads
- Tracks **Exercised/Exited** short legs and appends them to `shortleg_trades.csv`
- Uses VIX settlement pricing from CBOE to estimate actual payoff
- Records both **return** and **settlement value** in final logs

✅ This allows evaluating whether the short leg expired worthless or was exercised against.

---

## 🧠 Central Coordinator: `runtrader.py`

This is the main control script. It:
- Launches `loop_entry.py` and `loop_exit.py` in parallel threads
- Starts a **third thread** to monitor **Paris time** (UTC+1)
- Coordinates all automation logic to ensure consistent performance

This ensures 24/7 automation during US market hours while maintaining logs and alerts.

---

## ✅ Summary

| Component            | Purpose                                      |
|----------------------|----------------------------------------------|
| `entry_trades.py`    | Trade selection + execution engine           |
| `exit_trades.py`     | Monitors and exits profitable trades         |
| `loop_entry.py`      | Repeats entry script every minute            |
| `loop_exit.py`       | Repeats exit script every minute             |
| `exercisedlong.py`   | Calculates payoff on long legs post-expiry   |
| `exercisedshort.py`  | Calculates payoff on short legs post-expiry  |
| `runtrader.py`       | Master loop: runs both + scheduler           |

This architecture provides a **robust and fully autonomous forward-testing environment**, while keeping all sensitive strategy logic protected and isolated.
