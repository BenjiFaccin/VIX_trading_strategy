---
sidebar_position: 1
---

# List of independent variables used

The selection of independent variables was painstaking and reworked progressively during testing. The initial, non-exhaustive list included around twenty technical indicators, but the final version contains exactly seven. 

**All the indicators used come from TradingView**, with most being community-created indicators.

### Net Unrealized Profit and Loss (NUPL)
- **Description:** Net Unrealized Profit and Loss (NUPL) is a financial metric used to assess the overall profitability of holders of an asset by analyzing unrealized gains and losses. It calculates the difference between unrealized profits (when the asset's current price is higher than the purchase price) and unrealized losses (when the purchase price exceeds the current price), relative to the market capitalization. A positive NUPL indicates that the majority of holders are in profit, while a negative NUPL suggests most are at a loss. This metric is widely used to gauge market sentiment and identify potential trend reversals. High or low extremes in NUPL often signal overbought or oversold market conditions, respectively.
- **Credits:** [VanHe1sing](https://www.tradingview.com/u/VanHe1sing/)



### Spent Output Profit Ratio (SOPR)
- **Description:** Spent Output Profit Ratio (SOPR) is a financial metric that measures the profitability of coins moved on a blockchain. It is calculated as the ratio of the selling price (realized value) to the purchase price (cost basis) of spent outputs. A SOPR value above 1 indicates that holders are selling at a profit, while a value below 1 suggests sales are at a loss. This metric helps identify market sentiment, with high SOPR values signaling profit-taking phases and low values indicating capitulation or undervaluation. SOPR trends are often used to predict potential market reversals or confirm ongoing trends.
- **Credits:** [Pinnacle Investor](https://www.tradingview.com/u/Pinnacle_Investor/)


### Market Value to Realized Value Z-score (MVRV-Z)
- **Description:** The MVRV-Z Score is a blockchain metric used to assess whether an asset is overvalued or undervalued relative to its "fair value." It is calculated by comparing the Market Value (market capitalization) and Realized Value (the aggregate value based on purchase prices), with a Z-score standardization to highlight deviations. A high Z-score indicates overvaluation, often signaling market tops, while a low Z-score suggests undervaluation, potentially indicating market bottoms. This metric is particularly useful for spotting extremes in market sentiment and identifying potential buying or selling opportunities. It is widely used in cryptocurrency analysis for long-term trend evaluation.
- **Credits:** [Da Prof](https://www.tradingview.com/u/Da_Prof/)


### Cumulative Coin Value Days Destroyed (CVDD)
- **Description:** Coin Value Days Destroyed (CVDD) is a blockchain metric that measures the economic activity of spent coins by combining their value with the time they were held. It is calculated by multiplying the number of coins in a transaction by the number of days since they were last moved, effectively capturing the "weight" of long-term holders selling. Higher CVDD values suggest significant activity from long-term holders, which may indicate profit-taking or changes in market dynamics. This metric is often used to analyze holder behavior, assess market sentiment, and identify potential turning points in the market. It provides insights into the maturity and movement of assets over time.
Following indicator rebases the Cumulative Coin Value Days Destroyed with a shift bottom extension equals to 120% of original CVDD and a top extension approximatevely equals to 352% of original CVDD. Also, following CVDD was calculated with a denominator of 2.2*10e7, which is uncommon: either 6.0*10e6 or circulating supply are commonly used. 
- **Credits:** [Da Prof](https://www.tradingview.com/u/Da_Prof/)


### Simple Moving Averages 
- **Description:** The SMA20, SMA50, SMA100, and SMA200 are Simple Moving Averages calculated over 20, 50, 100, and 200 periods, respectively, and are widely used in technical analysis. These averages smooth out price data to identify trends and potential support or resistance levels. The SMA20 reflects short-term trends, the SMA50 highlights intermediate trends, the SMA100 indicates medium-term trends, and the SMA200 focuses on long-term trends. When shorter SMAs cross above longer ones (e.g., SMA20 crossing SMA200), it signals potential bullish momentum, while the reverse suggests bearish trends. Combining these SMAs provides a comprehensive view of market trends across different time horizons, aiding in better-informed trading decisions.
- **Credits:** TradingView own indicator


### Relative Strength Index (RSI-14EMA)
- **Description:** RSI 14EMA (Relative Strength Index with a 14-period Exponential Moving Average) is a momentum oscillator used to measure the speed and magnitude of price changes. It calculates the ratio of recent gains to losses over 14 periods and applies an Exponential Moving Average for smoother, more responsive signals. RSI values range from 0 to 100, with readings above 70 indicating overbought conditions and below 30 suggesting oversold conditions. The EMA adjustment makes it more sensitive to recent price movements, enhancing its utility for short-term analysis. RSI 14EMA is widely used to identify trend strength, potential reversals, and entry or exit points in trading.
- **Credits:** TradingView own indicator


### Bitcoin Difficulty Ratio (14EMA)
- **Description:** Bitcoin Difficulty Ratio (14EMA) is a metric that tracks the relationship between Bitcoin's current mining difficulty and its historical trends, smoothed using a 14-period Exponential Moving Average. It highlights changes in the computational effort required to mine blocks, reflecting network security and miner activity. A rising Difficulty Ratio often signals growing network strength and optimism, while a declining ratio may indicate reduced miner confidence or profitability. The 14EMA makes the metric more responsive to recent changes, aiding in short-term analysis. This ratio is commonly used to assess market health and potential shifts in miner sentiment or network dynamics.
- **Credits:** [gliderfund](https://www.tradingview.com/u/gliderfund/)


<div class="extra-space"></div>


To build the model, I had to export <u>all historical data on a daily and weekly basis from the first recorded value for each indicator</u>. However, this raises two issues regarding the long-term sustainability of my model:

- How can I update future data if the owner of an indicator decides to make it no longer publicly available or deletes it?
- How can I update future data if the API used by the indicator's owner, which is often subscription-based, becomes obsolete or if their subscription is canceled?

<div class="extra-space"></div>
For these reasons, after identifying all the required indicators that are both independent and essential for my model's performance, I decided to replicate them one by one using **[Python Replication](../Indicators/Python%20Replication)**!
