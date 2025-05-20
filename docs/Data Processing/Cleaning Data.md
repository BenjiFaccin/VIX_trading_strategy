---
sidebar_position: 2
---

# Cleaning Data

After collecting over **160 monthly End of Day `.txt` files** from OptionsDX, the next step was to **clean, transform, and structure** the raw data to prepare it for analysis and strategy testing.

The entire cleaning process was handled through a custom Python script, which I designed to handle format inconsistencies, filter out low-quality data, and align everything with historical VIX OHLC data.

---

## Step 1: Converting `.txt` to `.xlsx`

The raw data was delivered in `.txt` format with **inconsistent delimiters** (comma, tab, or space). I wrote a converter function that:
- Automatically detects the correct delimiter
- Loads the content into a DataFrame
- Saves the result as an `.xlsx` file
- Deletes the original `.txt` file once converted

This helped standardize the dataset before processing.

---

## Step 2: Preprocessing VIX Historical OHLC

I separately loaded a `.csv` file containing **daily VIX OHLC data** (Open, High, Low, Close) and:
- Parsed the date column into a consistent `datetime.date` format
- Cleaned up any malformed entries
- Used this dataset to **enrich the options data** later

---

## Step 3: Cleaning and Filtering Options Chain Data

For each `.xlsx` options file, the following transformations were applied:

- **Column Cleanup:** Renamed and stripped extra characters from headers
- **Date Parsing:** Converted the `QUOTE_DATE` to a usable `DATE` field
- **Type Conversion:** Coerced numeric columns (e.g., bid/ask, IV, volume) into proper numeric format
- **Filtering:**
  - Only kept **Put options**
  - Selected options with **DTE (Days to Expiry) ≤ 30**
  - Excluded rows with **Put Volume < 75** to focus on liquid contracts

---

## Step 4: Merging with VIX OHLC Data

To model and simulate realistic price paths:
- I merged each options entry with the corresponding **daily VIX OHLC data**
- Calculated the date **DTE days ahead** and fetched:
  - `OPEN`, `HIGH`, `LOW`, `CLOSE` on that target date
  - The **minimum LOW between trade date +1 and target DTE date** for stop-loss or drawdown analysis

Any row with missing price data for the `DTE`-targeted date was dropped to ensure data integrity.

---

## Step 5: Output Cleaned Files

Each cleaned file was:
- Saved **per trading day**
- Stored in an organized subfolder structure matching the original dataset
- Output as a separate `.xlsx` file named by the trading date (e.g., `VIX_Cleaned_2015-03-17.xlsx`)

This format made it easy to access and test the data for each trade setup individually.

---

## Result

The cleaned dataset is now:
- **Consistent and structured**
- **Filtered for liquidity and DTE constraints**
- **Enriched with historical VIX price context**


Here's an output example for the **first cleaned file generated** — corresponding to **January 1st, 2010**:
![Example of cleaned data output](/img/outputex.png)

This pipeline ensures all backtests and forward tests are based on **realistic**, **clean**, and **well-aligned data**, providing a robust foundation for strategy design and evaluation.