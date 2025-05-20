---
sidebar_position: 1
---

# Collecting Data

For this project, I collected **End of Day (EoD) historical daily data** for VIX options in order to build and validate the trading strategy.

The data was sourced from **[OptionsDX](https://www.optionsdx.com/product/vix-option-chains/)** — a platform that provides free downloadable VIX option chains.

### 📅 Time Period Covered

- **Start:** January 2010  
- **End:** December 2023  
- This corresponds to **14 years of historical data**, covering multiple market regimes and volatility cycles.

### 📁 File Format and Structure

The dataset is composed of **168 monthly files**, each in **`.txt` format**, with one file per calendar month.

Each file contains daily end-of-day option chain data, including:

- Strike prices  
- Expiration dates  
- Bid/ask prices  
- Implied volatility  
- Option type (call/put)  
- Volume and open interest  
- Underlying VIX value at close

