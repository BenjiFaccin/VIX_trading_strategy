from ib_insync import *
from datetime import datetime, timedelta
import os
import re
import pandas as pd

# === 0. Path to strategy files ===
strategy_dir = r"C:\Users\33698\Desktop\VIX_Trading_Strategy\Selected_Strategies"

# === 1. Connect to IBKR ===
ib = IB()
ib.connect('127.0.0.1', 7497, clientId=1)

from pytz import timezone
from pandas.tseries.holiday import USFederalHolidayCalendar
from pandas.tseries.offsets import CustomBusinessDay

import csv

def log_trade_to_csv(data):
    csv_file = r"C:\Users\33698\Desktop\VIX_Trading_Strategy\Forwardtesting Paper Account\entry_trades.csv"
    file_exists = os.path.isfile(csv_file)

    headers = [
        "Date", "Option expiration date", "Strike short put", "Strike long put", "DTE",
        "Spread Cost", "Commission Sell", "Commission Buy", "Total Commissions", "Status",
        "VIX underlying price at trade", "Qty Sell", "Qty Buy",
        "Bid Sell", "Ask Sell", "Bid Buy", "Ask Buy",
        "Price Sold", "Price Paid", "Effective Spread Cost", "Total Costs"
    ]

    with open(csv_file, mode='a', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        if not file_exists:
            writer.writeheader()
        writer.writerow(data)

# === 2. Set market data type to Delayed (15-minute delay) ===
ib.reqMarketDataType(3)

# === 3. Define VIX index and qualify contract ===
vix = Index('VIX')
ib.qualifyContracts(vix)

# === 4. Get current VIX price ===
ticker = ib.reqMktData(vix, '', snapshot=True, regulatorySnapshot=False)
ib.sleep(2)
vix_price = 25
print(f"Current VIX price: {vix_price:.2f}")

# === 5. Determine VIX threshold range ===
vix_floor = int(vix_price)
vix_ceil = vix_floor + 1
price_range = f"{vix_floor}-{vix_ceil}"
print(f"Searching strategy files for threshold: {price_range}")

# === 6. Find matching Excel file ===
matching_files = [
    f for f in os.listdir(strategy_dir)
    if f.startswith("Selected_vix_put_spread_results_threshold_") and f"threshold_{price_range}_" in f
]

if not matching_files:
    print("No strategy file matches current VIX threshold.")
    ib.disconnect()
    exit()

# === 7. Load matching strategy Excel file ===
for filename in matching_files:
    filepath = os.path.join(strategy_dir, filename)
    xls = pd.ExcelFile(filepath)
    available_sheets = xls.sheet_names
    dte_sheets = [s for s in available_sheets if s.startswith("DTE_") and s != "DTE_0"]

    print(f"\nLoaded strategy file: {filename}")
    print(f"Available DTE sheets: {dte_sheets}")

    match = re.search(r"strike_(\d+(?:\.\d+)?)", filename)
    if not match:
        print("⚠ Could not extract strike from filename.")
        continue

    target_strike = float(match.group(1))
    lower_bound_strike = float(vix_floor)

    option_chains = ib.reqSecDefOptParams(vix.symbol, '', vix.secType, vix.conId)

    today = datetime.now()
    max_dte = timedelta(days=31)
    valid_expirations = sorted({
        datetime.strptime(exp, "%Y%m%d")
        for chain in option_chains
        for exp in chain.expirations
        if (datetime.strptime(exp, "%Y%m%d") - today) < max_dte
    })

    if not valid_expirations:
        print("No options with <31 DTE found.")
        ib.disconnect()
        exit()

    # === Get current open positions ===
    open_positions = ib.positions()
    open_options = [
        (p.contract.lastTradeDateOrContractMonth, p.contract.strike, p.position)
        for p in open_positions
        if isinstance(p.contract, Option) and p.contract.right == 'P' and p.contract.symbol == 'VIX'
    ]

    # === 8. Iterate through valid expirations ===
    for expiration in valid_expirations:
        exp_str = expiration.strftime("%Y%m%d")
        dte = (expiration - today).days
        if dte in [0, 1, 2, 3, 4]:
            continue  # Skip DTE_0 to DTE_4
        
        dte_key = f"DTE_{dte}"

        strikes = set()
        for chain in option_chains:
            if exp_str in chain.expirations:
                strikes.update(chain.strikes)

        contracts = []
        for strike in sorted(strikes):
            contract = Option('VIX', exp_str, strike, 'P', 'SMART')
            ib.qualifyContracts(contract)
            contracts.append(contract)

        tickers = []
        for contract in contracts:
            ticker = ib.reqMktData(contract, '', snapshot=True, regulatorySnapshot=False)
            tickers.append(ticker)

        ib.sleep(2)

        if dte_key in dte_sheets and dte_key != "DTE_0":
            print(f"\n✔ Correspondance found for expiration {exp_str} (DTE: {dte}) in '{dte_key}' for threshold {price_range}")

            spread_values = {'target_bid': None, 'lower_ask': None}

            def display_metrics_for_strike(strike_val, label):
                for ticker, contract in zip(tickers, contracts):
                    if float(contract.strike) != strike_val:
                        continue

                    bid = ticker.bid if ticker.bid is not None else float('nan')
                    ask = ticker.ask if ticker.ask is not None else float('nan')
                    spread = (ask - bid) if (bid and ask) else float('nan')

                    greeks = ticker.modelGreeks
                    delta = greeks.delta if greeks and greeks.delta is not None else float('nan')
                    gamma = greeks.gamma if greeks and greeks.gamma is not None else float('nan')
                    vega = greeks.vega if greeks and greeks.vega is not None else float('nan')
                    theta = greeks.theta if greeks and greeks.theta is not None else float('nan')

                    print(f"\n▶ {label} STRIKE: {contract.strike}")
                    print(f"Expiration: {exp_str} | DTE: {dte} days")
                    print(f"Bid-Ask: {bid*100:.2f} - {ask*100:.2f} | Spread: {spread*100:.2f}")
                    print(f"Delta: {delta:.3f}, Gamma: {gamma:.3f}, Vega: {vega:.3f}, Theta: {theta:.3f}")

                    if label == "TARGET":
                        spread_values['target_bid'] = bid
                    elif label == "LOWER BOUND":
                        spread_values['lower_ask'] = ask

                    return True
                return False

            found_target = display_metrics_for_strike(target_strike, "TARGET")
            found_lower = display_metrics_for_strike(lower_bound_strike, "LOWER BOUND")

            if (
                found_target and found_lower and
                spread_values['target_bid'] is not None and
                spread_values['lower_ask'] is not None
            ):
                spread_cost = (spread_values['target_bid'] - spread_values['lower_ask']) * 100
                print(f"\n💸 Spread Cost (Target Bid - Lower Bound Ask): {spread_cost:.2f}")
                # === More realistic spread cost based on execution-side prices
                target_bid = next((t.bid for t, c in zip(tickers, contracts) if float(c.strike) == target_strike), None)
                target_ask = next((t.ask for t, c in zip(tickers, contracts) if float(c.strike) == target_strike), None)
                lower_bid = next((t.bid for t, c in zip(tickers, contracts) if float(c.strike) == lower_bound_strike), None)
                lower_ask = next((t.ask for t, c in zip(tickers, contracts) if float(c.strike) == lower_bound_strike), None)
                
                if target_ask is not None and lower_bid is not None:
                    spread_cost_execution = ((target_ask + target_bid) / 2 - (lower_ask + lower_bid) / 2) * 100
                    print(f"📉 Execution-Side Spread Cost (Sell at Ask - Buy at Bid): {spread_cost_execution:.2f}")
                else:
                    spread_cost_execution = float('nan')
                    print("⚠ Could not calculate execution-side spread cost for logging.")

            else:
                print("\n⚠ Spread Cost could not be calculated.")
                continue

            sheet = xls.parse(dte_key, header=None)
            q3_threshold = sheet.iloc[7, 1]
            print(f"📊 Q3 Spread Cost Threshold: {q3_threshold:.2f}")

            if spread_cost >= q3_threshold:
                print(f"✅ Spread cost {spread_cost:.2f} is BELOW threshold — ready to place trade")

                target_contract = None
                lower_contract = None
                for contract in contracts:
                    if float(contract.strike) == target_strike:
                        target_contract = contract
                    elif float(contract.strike) == lower_bound_strike:
                        lower_contract = contract

                if target_contract and lower_contract:
                    # === Check each leg independently for status (open, pending, or partially filled) ===
                    # ✅ Allow placing orders even if the same strike & expiry was already traded earlier
                    # No blocking based on open positions or previous fills
                    # === Check if the exact put spread is already open ===
                    spread_already_open = (
                        any(pos for pos in open_options if pos[0] == exp_str and pos[1] == target_strike and pos[2] < 0) and
                        any(pos for pos in open_options if pos[0] == exp_str and pos[1] == lower_bound_strike and pos[2] > 0)
                    )

                    if spread_already_open:
                        print("⛔ Duplicate spread already open — skipping this trade.")
                        continue  # Skip to the next loop iteration (next expiration or next strategy)

                    target_leg_active = False
                    lower_leg_active = False

                    # Place the trade using LIMIT orders at bid/ask

                    sell_price = (target_bid + target_ask) / 2 if target_bid is not None and target_ask is not None else None
                    buy_price = (lower_bid + lower_ask) / 2 if lower_bid is not None and lower_ask is not None else None

                    if sell_price is None or buy_price is None:
                        print("⚠ Cannot place trade — missing bid/ask data.")
                        continue

                    # === Check if there is already a pending order for either leg ===
                    pending_orders = ib.openOrders()

                    def is_pending(contract):
                        return any(
                            trade.contract.conId == contract.conId and
                            trade.orderStatus.status in ('Submitted', 'PreSubmitted')
                            for trade in ib.trades()
                        )
                    if is_pending(target_contract) or is_pending(lower_contract):
                        print(f"⏸ Skipping trade — pending order already exists for one or both contracts.")
                        continue

                    # === Place new limit orders ===
                    # Slightly improve fill chance by using buffer
                    sell_price = round(sell_price - 0.01, 2) if sell_price else None
                    buy_price = round(buy_price + 0.01, 2) if buy_price else None

                    # Submit only missing legs
                    trade1 = None
                    trade2 = None

                    if not target_leg_active:
                        sell_order = LimitOrder('SELL', 1, sell_price)
                        trade1 = ib.placeOrder(target_contract, sell_order)
                        print(f"📤 Submitted SELL for target PUT @ {sell_price:.2f}")

                    if not lower_leg_active:
                        buy_order = LimitOrder('BUY', 1, buy_price)
                        trade2 = ib.placeOrder(lower_contract, buy_order)
                        print(f"📥 Submitted BUY for lower PUT @ {buy_price:.2f}")

                   # === Monitor and dynamically adjust orders per leg, with Q3 ceiling & cancel logic ===
                    # === Monitor and dynamically adjust orders per leg, with correct total cost calculation ===
                    max_attempts = 100
                    attempt = 0
                    qty_sell = 1
                    qty_buy = 1
                    commission_threshold = 1.5  # per contract

                    # Initial prices
                    current_sell_price = sell_price
                    current_buy_price = buy_price

                    while attempt < max_attempts:
                        ib.sleep(5)
                        ib.waitOnUpdate(timeout=10)

                        # Check fill status
                        target_filled = bool(trade1 and trade1.fills)
                        lower_filled = bool(trade2 and trade2.fills)

                        # Commissions
                        commission1 = trade1.fills[0].commissionReport.commission if trade1 and target_filled else 0
                        commission2 = trade2.fills[0].commissionReport.commission if trade2 and lower_filled else 0
                        commission_per_contract = ((commission1 or 0) + (commission2 or 0)) / (qty_sell + qty_buy)

                        if commission_per_contract > commission_threshold:
                            print(f"🚫 Skipping trade — Commission per contract too high (${commission_per_contract:.2f} > $1.50)")
                            break

                        # Exit if both legs are filled
                        if target_filled and lower_filled:
                            print("✅ Both legs filled.")
                            break

                        # Correct total cost: (credit - debit - 2x commissions)
                        total_cost = (current_sell_price - current_buy_price) * 100 - 2 * commission_per_contract
                        print(f"🔁 Attempt {attempt+1}: Total cost (credit - debit - 2×comm): {total_cost:.2f} vs Q3: {q3_threshold:.2f}")

                        # Cancel both if both still pending AND total cost is worse than Q3
                        if not target_filled and not lower_filled and abs(total_cost) > abs(q3_threshold):
                            print("❌ Total cost exceeds Q3 while both legs pending — cancelling both orders.")
                            if trade1 is not None:
                                ib.cancelOrder(trade1.order)
                                print("⛔ Cancelled unfilled SELL leg.")
                            else:
                                print("⚠ trade1 is None — no SELL order to cancel.")

                            if trade2 is not None:
                                ib.cancelOrder(trade2.order)
                                print("⛔ Cancelled unfilled BUY leg.")
                            else:
                                print("⚠ trade2 is None — no BUY order to cancel.")
                            break

                        # Reprice SELL leg if still pending
                        if not target_filled:
                            if current_sell_price > 0.01:
                                proposed_sell = round(current_sell_price - 0.01, 2)
                                temp_cost = (proposed_sell - current_buy_price) * 100 - 2 * commission_per_contract
                                if abs(temp_cost) <= abs(q3_threshold):
                                    ib.cancelOrder(trade1.order)
                                    ib.sleep(2)  # Wait to ensure cancellation OR last-minute fill is processed
                                    ib.waitOnUpdate(timeout=5)

                                    # 🧠 Only re-submit if not already filled
                                    if not trade1.fills:
                                        current_sell_price = proposed_sell
                                        trade1 = ib.placeOrder(target_contract, LimitOrder('SELL', qty_sell, current_sell_price))
                                        print(f"↩️ Updated SELL order to {current_sell_price:.2f}")
                                    else:
                                        print("✅ SELL leg filled right before reprice — no new order placed.")

                                else:
                                    print("⚠️ Skipping SELL reprice — would breach Q3 limit.")
                            else:
                                print("⚠️ Cannot reduce SELL price below 0.01 — keeping as is.")

                        # Reprice BUY leg if still pending
                        if not lower_filled:
                            proposed_buy = round(current_buy_price + 0.01, 2)
                            temp_cost = (current_sell_price - proposed_buy) * 100 - 2 * commission_per_contract
                            if abs(temp_cost) <= abs(q3_threshold):
                                ib.cancelOrder(trade2.order)
                                ib.sleep(2)
                                ib.waitOnUpdate(timeout=5)

                                if not trade2.fills:
                                    current_buy_price = proposed_buy
                                    trade2 = ib.placeOrder(lower_contract, LimitOrder('BUY', qty_buy, current_buy_price))
                                    print(f"↩️ Updated BUY order to {current_buy_price:.2f}")
                                else:
                                    print("✅ BUY leg filled right before reprice — no new order placed.")
                            else:
                                print("⚠️ Skipping BUY reprice — would breach Q3 limit.")

                        attempt += 1

                    # Final check after loop
                    target_filled = bool(trade1 and trade1.fills)
                    lower_filled = bool(trade2 and trade2.fills)

                    if not target_filled:
                        ib.cancelOrder(trade1.order)
                        print("⛔ Max attempts reached — cancelled unfilled SELL leg.")
                    if not lower_filled:
                        ib.cancelOrder(trade2.order)
                        print("⛔ Max attempts reached — cancelled unfilled BUY leg.")

                    # === Monitor and dynamically adjust orders per leg, with Q3 ceiling & cancel logic ===
                    max_attempts = 100
                    attempt = 0
                    qty_sell = 1
                    qty_buy = 1
                    commission_threshold = 1.5

                    # Start with initial prices
                    current_sell_price = sell_price
                    current_buy_price = buy_price

                    while attempt < max_attempts:
                        ib.sleep(5)
                        ib.waitOnUpdate(timeout=10)

                        target_filled = bool(trade1 and trade1.fills)
                        lower_filled = bool(trade2 and trade2.fills)

                        # Commissions
                        commission1 = trade1.fills[0].commissionReport.commission if trade1 and target_filled else 0
                        commission2 = trade2.fills[0].commissionReport.commission if trade2 and lower_filled else 0
                        total_commission = commission1 + commission2
                        commission_per_contract = total_commission / (qty_sell + qty_buy)

                        if commission_per_contract > commission_threshold:
                            print(f"🚫 Skipping trade — Commission per contract too high (${commission_per_contract:.2f} > $1.50)")
                            break

                        # If both filled, break
                        if target_filled and lower_filled:
                            print("✅ Both legs filled.")
                            break

                        # Calculate new spread cost
                        spread_cost = (current_sell_price - current_buy_price) * 100 + total_commission
                        print(f"🔁 Attempt {attempt+1}: Adjusted spread cost (with commission): {spread_cost:.2f} vs Q3: {q3_threshold:.2f}")

                        # Cancel immediately if Q3 threshold exceeded AND both legs still pending
                        if not target_filled and not lower_filled and abs(spread_cost) >= abs(q3_threshold):
                            print("❌ Spread cost exceeds Q3 while both legs pending. Cancelling both orders.")
                            ib.cancelOrder(trade1.order)
                            ib.cancelOrder(trade2.order)
                            break

                        # Reprice SELL leg if still not filled
                        if not target_filled:
                            current_sell_price = round(current_sell_price - 0.01, 2)
                            if abs((current_sell_price - current_buy_price) * 100 + total_commission) <= abs(q3_threshold):
                                ib.cancelOrder(trade1.order)
                                trade1 = ib.placeOrder(target_contract, LimitOrder('SELL', qty_sell, current_sell_price))
                                print(f"↩️ Updated SELL order to {current_sell_price:.2f}")
                            else:
                                print("⚠️ Skipping SELL reprice — would breach Q3 limit.")

                        # Reprice BUY leg if still not filled
                        if not lower_filled:
                            current_buy_price = round(current_buy_price + 0.01, 2)
                            if abs((current_sell_price - current_buy_price) * 100 + total_commission) <= abs(q3_threshold):
                                ib.cancelOrder(trade2.order)
                                trade2 = ib.placeOrder(lower_contract, LimitOrder('BUY', qty_buy, current_buy_price))
                                print(f"↩️ Updated BUY order to {current_buy_price:.2f}")
                            else:
                                print("⚠️ Skipping BUY reprice — would breach Q3 limit.")

                        attempt += 1

                    # Final check after max attempts
                    target_filled = bool(trade1 and trade1.fills)
                    lower_filled = bool(trade2 and trade2.fills)

                    if not target_filled:
                        ib.cancelOrder(trade1.order)
                        print("⛔ Max attempts reached — cancelled unfilled SELL leg.")
                    if not lower_filled:
                        ib.cancelOrder(trade2.order)
                        print("⛔ Max attempts reached — cancelled unfilled BUY leg.")

                                        # === Log trade attempt ===
                    trade_data = {
                        "Date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "Option expiration date": expiration.strftime("%Y-%m-%d"),
                        "Strike short put": target_strike,
                        "Strike long put": lower_bound_strike,
                        "DTE": dte,
                        "Spread Cost": round(spread_cost, 2),
                        "Commission Sell": round(commission1, 2) if trade1 and target_filled else 0,
                        "Commission Buy": round(commission2, 2) if trade2 and lower_filled else 0,
                        "Total Commissions": round((commission1 or 0) + (commission2 or 0), 2),
                        "Status": "Filled" if target_filled and lower_filled else "Partial/Cancelled",
                        "VIX underlying price at trade": vix_price,
                        "Qty Sell": qty_sell,
                        "Qty Buy": qty_buy,
                        "Bid Sell": round(target_bid or 0, 2),
                        "Ask Sell": round(target_ask or 0, 2),
                        "Bid Buy": round(lower_bid or 0, 2),
                        "Ask Buy": round(lower_ask or 0, 2),
                        "Price Sold": round(trade1.fills[0].execution.price, 2) if trade1 and trade1.fills else 0,
                        "Price Paid": round(trade2.fills[0].execution.price, 2) if trade2 and trade2.fills else 0,
                        "Effective Spread Cost": round((trade1.fills[0].execution.price - trade2.fills[0].execution.price) * 100, 2) if trade1.fills and trade2.fills else 0,
                        "Total Costs": round(((trade1.fills[0].execution.price - trade2.fills[0].execution.price) * 100 - ((commission1 or 0) + (commission2 or 0))), 2) if trade1.fills and trade2.fills else 0
                    }

                    log_trade_to_csv(trade_data)

            else:
                print(f"❌ Spread cost {spread_cost:.2f} is ABOVE threshold — no trade.")
        else:
            print(f"✘ No matching DTE sheet for {dte_key}")

# === 12. Disconnect ===
ib.disconnect()