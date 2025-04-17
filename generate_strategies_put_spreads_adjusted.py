import os
import pandas as pd
import numpy as np

# Define directories
base_dir = "C:/Users/33698/Desktop/VIX_Trading_Strategy/Historical_EoD_VIX_Cleaned_Data_2010_to_2023_adjusted"
output_dir = "C:/Users/33698/Desktop/VIX_Trading_Strategy/VIX_put_spread_strategies_maturity_adjusted"
os.makedirs(output_dir, exist_ok=True)  # Ensure the main directory exists

# Define VIX spike threshold ranges (13 to 60, step 1)
vix_threshold_ranges = [(x, x + 1) for x in np.arange(13, 60, 1)]

# Define sell strikes (13 to 60, step 0.5)
sell_strikes = np.arange(13, 61, 1)

# Calculate total number of profiles to be backtested
total_profiles = len(vix_threshold_ranges) * len(sell_strikes)
tested_profiles = 0  # Counter for tested profiles

# Interactive Brokers fee per contract
IB_FEE_PER_CONTRACT = 0.85  # Per leg
TOTAL_FEES_PER_SPREAD = IB_FEE_PER_CONTRACT * 2  # Two legs (buy & sell)

# Function to process files and backtest put spread strategy
# Function to process files and backtest put spread strategy
def process_vix_data(base_dir, vix_threshold_low, vix_threshold_high, sell_strike):
    results = []
    
    for year in os.listdir(base_dir):
        year_path = os.path.join(base_dir, year)
        if not os.path.isdir(year_path):
            continue
        
        for file in os.listdir(year_path):
            if file.endswith(".xlsx"):
                file_path = os.path.join(year_path, file)
                try:
                    df = pd.read_excel(file_path)

                    # Filter options where HIGH is within the defined threshold range
                    vix_spikes = df[(df['HIGH'] > vix_threshold_low) & (df['HIGH'] <= vix_threshold_high)]
                    unique_dtes = vix_spikes['DTE'].unique()
                    
                    for dte in unique_dtes:
                        dte_df = df[df['DTE'] == dte]  
                        if dte_df.empty:
                            continue
                        
                        # Ensure ATM strike is within the predefined range
                        atm_candidates = dte_df[(dte_df['HIGH'] > vix_threshold_low) & 
                                                (dte_df['HIGH'] <= vix_threshold_high) & 
                                                (dte_df['STRIKE'] >= vix_threshold_low) & 
                                                (dte_df['STRIKE'] <= vix_threshold_high)]
                        if atm_candidates.empty:
                            continue
                        
                        # Select first available ATM strike in range
                        atm_option = atm_candidates.iloc[0]
                        atm_strike = atm_option['STRIKE']

                        # Ensure sell strike is strictly equal to the predefined level
                        sell_candidates = dte_df[dte_df['STRIKE'] == sell_strike]
                        if sell_candidates.empty:
                            continue
                        
                        sell_option = sell_candidates.iloc[0]

                        # Retrieve put options
                        atm_put = dte_df[dte_df['STRIKE'] == atm_strike]
                        sell_put = dte_df[dte_df['STRIKE'] == sell_strike]
                        
                        if atm_put.empty or sell_put.empty:
                            continue
                        
                        # Ensure bid and ask prices are valid before calculating mid-price
                        atm_put_mid = atm_put.iloc[0]['P_ASK'] if atm_put.iloc[0]['P_ASK'] > 0 else (
                            atm_put.iloc[0]['P_LAST'] if atm_put.iloc[0]['P_LAST'] > 0 else (atm_put.iloc[0]['P_BID'] + atm_put.iloc[0]['P_ASK']) / 2
                        )

                        sell_put_mid = sell_put.iloc[0]['P_BID'] if sell_put.iloc[0]['P_BID'] > 0 else (
                            sell_put.iloc[0]['P_LAST'] if sell_put.iloc[0]['P_LAST'] > 0 else (sell_put.iloc[0]['P_BID'] + sell_put.iloc[0]['P_ASK']) / 2
                        )

                        # ✅ Spread Cost / Profit Adjustment
                        spread_difference = (sell_put_mid - atm_put_mid) * 100  # Compute the difference

                        # ✅ Expiry price calculation: Use LOW_DTE_BUY for ATM option and LOW_DTE_SELL for sell option
                        expiry_low_atm = atm_put.iloc[0]['LOW_DTE_BUY']  # Expiry price for ATM option
                        expiry_low_sell = sell_put.iloc[0]['LOW_DTE_SELL']  # Expiry price for sell option

                        # ✅ Compute expiry value correctly for each option
                        atm_expiry_value = max(0, atm_strike - expiry_low_atm) * 100  # Long put intrinsic value
                        sell_expiry_value = max(0, sell_strike - expiry_low_sell) * 100  # Short put intrinsic value (loss)

                        # ✅ Net expiry value of the spread
                        expiry_value = atm_expiry_value - sell_expiry_value

                        # ✅ Adjust return based on spread difference
                        if spread_difference > 0:
                            # If positive, it's a profit → add to the return
                            spread_return = (expiry_value + spread_difference) - TOTAL_FEES_PER_SPREAD  
                        else:
                            # If negative, it's a cost → deduct from the return
                            spread_return = (expiry_value - abs(spread_difference)) - TOTAL_FEES_PER_SPREAD
                        
                        if atm_strike < sell_strike:
                            max_profit = spread_difference
                        else: 
                            max_profit = ((atm_strike - sell_strike) * 100) + spread_difference
                        
                        results.append({
                            'DATE': atm_put.iloc[0]['DATE'],
                            'VIX_HIGH': atm_put.iloc[0]['HIGH'],
                            'DTE': dte,
                            'ATM_STRIKE': atm_strike,
                            'SELL_STRIKE': sell_strike,
                            'SPREAD_COST': spread_difference,
                            'MAX_PROFIT': max_profit,
                            'EXPIRY_VALUE': expiry_value,
                            'RETURN': spread_return
                        })
                except Exception as e:
                    print(f"Error processing file {file}: {e}")
    
    return pd.DataFrame(results)

# Function to create subdirectories for each strike level
def create_subdirectory(strike):
    strike_folder = os.path.join(output_dir, f"Strike_{strike:.1f}")
    os.makedirs(strike_folder, exist_ok=True)
    return strike_folder

# Run the backtest for multiple thresholds and strikes
for vix_threshold_low, vix_threshold_high in vix_threshold_ranges:
    for atm_strike in sell_strikes:  # ATM strike follows the same logic as sell strike
        for sell_strike in sell_strikes:
            tested_profiles += 1  
            
            # Create folder for this strike level
            strike_folder = create_subdirectory(sell_strike)

            # Construct file name with range-based threshold
            file_name = os.path.join(strike_folder, 
                f"vix_put_spread_results_threshold_{vix_threshold_low}-{vix_threshold_high}_strike_{sell_strike:.1f}.csv")
            
            # **Skip processing if the file already exists**
            if os.path.exists(file_name):
                print(f"Skipping {file_name}, already exists.")
                continue  # Move to the next iteration

            print(f"Backtesting profile {tested_profiles} out of {total_profiles}... "
                  f"(Threshold: {vix_threshold_low}-{vix_threshold_high}, Strike: {sell_strike})")
            
            # Process the data only if the file doesn't exist
            results_df = process_vix_data(base_dir, vix_threshold_low, vix_threshold_high, sell_strike)
            
            # Save results to CSV
            results_df.to_csv(file_name, index=False)

print("All backtests completed and results saved.")

# Function to calculate strategy metrics
def calculate_metrics(file_path):
    df = pd.read_csv(file_path)
    
    if 'RETURN' not in df.columns:
        print(f"Skipping {file_path}: 'RETURN' column missing.")
        return None
    
    num_trades = len(df)
    total_return = df['RETURN'].sum()
    cumulative_returns = df['RETURN'].cumsum()
    max_drawdown = cumulative_returns.min()
    winrate = (df['RETURN'] > 0).sum() / num_trades * 100

    # Extract values from filename
    filename = os.path.basename(file_path)
    try:
        threshold_part = filename.split("_threshold_")[1].split("_ATM_")[0]
        atm_strike = float(filename.split("_ATM_")[1].split("_strike_")[0])
        sell_strike = float(filename.split("_strike_")[1].split(".csv")[0])
    except Exception as e:
        print(f"Error extracting details from filename {filename}: {e}")
        return None

    return {
        'File': filename,
        'VIX_Threshold': threshold_part,  # Keep as string since it's a range (e.g., "15.0-16.0")
        'ATM_Strike': atm_strike,
        'Sell_Strike': sell_strike,
        'Number of Trades': num_trades,
        'Total Return': total_return,
        'Max Drawdown': max_drawdown,
        'Winrate (%)': winrate
    }