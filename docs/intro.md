---
sidebar_position: 1
---

# VIX Trading Strategy

Discover an automated algorithmic **Bear Put-spread Strategy** on the VIX index, executed through **Interactive Brokers** via a virtual machine.

---

## Overview

This VIX Trading strategy is based on selling lower strike put and buying higher strike put on the VIX index using historical data analysis, backtesting, and fully automated execution.

![Example bear put spread strat](/img/bear.png)

### Key Features

- **3300+ End of Day (EoD) Files**  
  3315 historical daily End of Day data points from the VIX options chain (2010–2023), used to analyze market behavior and volatility.

- **2500+ Backtested Profiles**  
  The strategy tests combinations of 50 different VIX price levels (50² = 2500) to find optimal put-spread parameters with strong risk-adjusted returns.

- **Automated Algorithmic Trading**  
  Built with over 20 scripts and 5000+ lines of code, this system is fully automated using a 24/7 virtual machine. Trades are placed and managed via **Interactive Brokers**, leveraging AI agents to optimize execution.

---

## Why Trade VIX Put Spreads?

The VIX index typically spikes during market turmoil and mean-reverts over time. This behavior makes it ideal for structured strategies like bear put spreads, which profit from elevated implied volatility and controlled risk exposure.

---

### ⚠️ Disclaimer

This strategy and its implementation are not financial advice and are presented for informational purposes only. All trading involves risk, and past performance does not guarantee future results.




---
<div class="extra-space"></div>


# Context and Motivation

This project was initiated after successfully completing my master degree in financial markets area and completing the **CFA Level I exam**. Following years of academic study, I felt the need to adopt a more **hands-on and applied approach** to financial strategy—especially to learn how to **automate trading strategies** and evaluate them through **forward testing**, rather than staying limited to theoretical models or backtesting results. Academic frameworks often lack the practical nuance required for real-world trading, and this project was an effort to close that gap.

<div class="extra-space"></div>

The goal was also to **learn how to automate trading strategies in a concrete**, real-world way, moving beyond academic concepts that often fall short when applied to live markets. Forward testing was chosen as a core focus because it allows strategies to be tested against actual market conditions, accounting for real-world issues like execution errors, slippage, technical constraints, and dynamic risk management.

<div class="extra-space"></div>

# Key Concerns and Limitations

While building and forward-testing this VIX bear put spread strategy, I’ve identified a few **critical concerns** that are essential to acknowledge for anyone applying or analyzing the approach. These insights came from both practical testing and lessons learned during system development.

---

### **Look-Ahead Bias from VIX Close Timestamp**

One of the biggest pitfalls I encountered relates to the **timing mismatch between the VIX index close and the ETF/option market close**. The VIX officially closes at **4:15 PM**, while SPY, VXX, and most US ETFs/options close at **4:00 PM**. If I were to use the **VIX daily close** as a signal and act on it at the same day’s market close, I’d be **inadvertently using future information**, introducing a **look-ahead bias** into my results.

This might seem like a minor detail, but when dealing with **momentum-based or intraday-sensitive strategies**, it can heavily **inflate backtest performance**. To avoid this, I’ve either:
- Used **intraday VIX data around 4:00 PM**, or
- Generated signals around **3:45 PM** with assumed **Market-on-Close execution**, or
- For daily data, assumed **execution at next day’s open**

Always double-check timestamps — the **devil really is in the details**.

---

### **Liquidity and Slippage on Far OTM Legs**

Another major issue comes from the **execution side** — specifically, with the **deep out-of-the-money (OTM)** put options used to build the spreads. In backtests, it's easy to assume smooth fills at midpoint prices. In practice, **bid/ask spreads widen significantly**, especially on far OTM strikes with low open interest.

For this reason, any **paper results must be discounted** to account for **slippage, liquidity constraints, and delayed fills**. In live trading, I’ve observed that:
- Wide spreads can cause **unexpected losses on entry/exit**
- Scaling trades becomes harder without **moving the market**
- Execution under stress (e.g., during volatility spikes) is far from ideal

Accounting for **realistic fills** and using **conservative slippage assumptions** is a must.

---

### **Signal/Instrument Mismatch from VIX Futures Structure**

Lastly, there’s a structural mismatch between the **VIX spot**, which I use for signal generation, and the **VIX options**, which are priced off **VIX futures**. This can lead to inconsistencies, especially:
- Near **options expiration**
- When the **futures curve shifts** (e.g., from contango to backwardation)

Because the pricing of the options doesn’t always reflect spot VIX, the signal’s predictive power can **deteriorate at specific times**, especially in fast-moving markets or around macro events.

To mitigate this, I pay close attention to:
- **Term structure dynamics** of VIX futures
- Timing the strategy to avoid **last-day decays**
- Aligning trade logic with how the **options are truly priced**

---

These three areas — **timestamp accuracy**, **realistic execution**, and **instrument alignment** — are where most of the risk hides in this strategy. I've integrated safeguards into my automation to account for them, but they remain **core limitations** of the approach.