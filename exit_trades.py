from ib_insync import *
from datetime import datetime
import pandas as pd
import os
import re
import time

# === Setup IBKR connection ===
ib = IB()
ib.connect('127.0.0.1', 7497, clientId=2)
ib.reqMarketDataType(3)  # 3 = delayed-frozen

# === Load entry trades ===
entry_trades_path = r"C:\Users\33698\Desktop\VIX_Trading_Strategy\Forwardtesting Paper Account\entry_trades.csv"
exit_trades_path = r"C:\Users\33698\Desktop\VIX_Trading_Strategy\Forwardtesting Paper Account\exit_trades.csv"

# Read entry and exit trades
df = pd.read_csv(entry_trades_path)
df.columns = df.columns.str.strip()  # Clean column names
filled_df = df[df['Status'] == 'Filled']

if os.path.exists(exit_trades_path):
    exit_df = pd.read_csv(exit_trades_path)
else:
    exit_df = pd.DataFrame()

# === Load VIX strategy Excel ===
strategy_dir = r"C:\Users\33698\Desktop\VIX_Trading_Strategy\Selected_Strategies"
vix_price = 25  # Replace with live price if needed
vix_floor = int(vix_price)
vix_ceil = vix_floor + 1
price_range = f"{vix_floor}-{vix_ceil}"

strategy_file = next(
    (f for f in os.listdir(strategy_dir)
     if f.startswith("Selected_vix_put_spread_results_threshold_") and f"threshold_{price_range}_" in f),
    None
)

if not strategy_file:
    print("❌ No matching strategy file for current VIX threshold.")
    ib.disconnect()
    exit()

xls = pd.ExcelFile(os.path.join(strategy_dir, strategy_file))

# === Get valid VIX index contract for option parameters ===
vix = Index('VIX', 'CBOE')
ib.qualifyContracts(vix)
option_chain = ib.reqSecDefOptParams(vix.symbol, '', vix.secType, vix.conId)[0]

# === Loop through filled trades ===
for idx, row in filled_df.iterrows():
    exp_str = datetime.strptime(row['Option expiration date'], "%m/%d/%Y").strftime('%Y%m%d')
    long_strike = float(row['Strike long put'])
    dte = int(row['DTE'])
    total_costs = float(row['Total Costs'])

    dte_key = f"DTE_{dte}"
    if dte_key not in xls.sheet_names:
        print(f"✘ DTE sheet {dte_key} not found in strategy file.")
        continue

    # Setup long put contract
    long_put = Option('VIX', exp_str, long_strike, 'P', 'SMART')
    ib.qualifyContracts(long_put)
    ticker = ib.reqMktData(long_put, '', snapshot=True, regulatorySnapshot=False)
    ib.sleep(2)

    bid = ticker.bid or 0
    ask = ticker.ask or 0
    midpoint = round((bid + ask) / 2, 2) if bid and ask else 0
    sell_price = round(midpoint - 0.01, 2)

    if midpoint == 0:
        print(f"⚠️ No market data for long put {long_strike}, skipping.")
        continue

    expected_return = 460
    sheet = xls.parse(dte_key, header=None)
    avg_expiry_value = sheet.iloc[9, 1]  # AVG Expiry Value

    print(f"\n🎯 Long Put {long_strike} | Midpoint: {midpoint} | Expected Return: {expected_return:.2f} | AVG Threshold: {avg_expiry_value:.2f}")

    if expected_return >= avg_expiry_value:
        print(f"✅ Exiting long leg @ {sell_price:.2f}")
        order = LimitOrder('SELL', 1, sell_price)
        trade = ib.placeOrder(long_put, order)

        while True:
            ib.sleep(5)
            ib.waitOnUpdate(timeout=5)

            if trade.fills:
                print("✅ Order filled.")
                df.at[idx, 'Status'] = 'Long Exit done'

                exit_row = row.copy()
                exit_row['Date'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                exit_row['Expiry Value'] = avg_expiry_value
                exit_row['Current Value of sell leg'] = 0
                exit_row['Expected return'] = avg_expiry_value - 0
                exit_df = pd.concat([exit_df, pd.DataFrame([exit_row])], ignore_index=True)
                break

            new_price = round(sell_price - 0.01, 2)
            new_expected_return = 458

            if new_expected_return >= avg_expiry_value:
                print(f"🔁 Adjusting order to {new_price:.2f} (Return: {new_expected_return:.2f})")
                ib.cancelOrder(order)
                ib.sleep(2)
                sell_price = new_price
                order = LimitOrder('SELL', 1, sell_price)
                trade = ib.placeOrder(long_put, order)
            else:
                print(f"🛑 Skipping further reductions — return {new_expected_return:.2f} below AVG threshold.")
                break
    else:
        print("⏸ Return below AVG threshold — no exit.")

# === Save updated CSVs ===
df.to_csv(entry_trades_path, index=False)
exit_df.to_csv(exit_trades_path, index=False)

# === Disconnect ===
ib.disconnect()
