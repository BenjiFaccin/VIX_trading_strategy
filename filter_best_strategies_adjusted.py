import os
import pandas as pd
import numpy as np

def calculate_metrics(file_path):
    if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
        print(f"Skipping {file_path}: File is empty or missing.")
        return None
    
    try:
        df = pd.read_csv(file_path)
        required_columns = {'RETURN', 'DTE', 'SPREAD_COST', 'EXPIRY_VALUE'}
        
        if not required_columns.issubset(df.columns):
            print(f"Skipping {file_path}: Required columns missing.")
            return None
        
        df['DTE'] = df['DTE'].round()  # Round DTE to nearest integer
        
        # Apply filtering criteria
        filtered_dte = df.groupby('DTE').filter(lambda x: x['RETURN'].sum() > 0 and (x['RETURN'] > 0).mean() >= 0.6)
        
        if filtered_dte.empty:
            print(f"Skipping {file_path}: No DTE values meet criteria.")
            return None
        
        num_trades = len(filtered_dte)
        total_return = filtered_dte['RETURN'].sum()
        max_drawdown = filtered_dte[filtered_dte['RETURN'] < 0]['RETURN'].sum()  # Sum of negative drawdowns
        risk_reward_ratio = total_return / abs(max_drawdown) if max_drawdown != 0 else np.nan
        winrate = (filtered_dte['RETURN'] > 0).sum() / num_trades * 100
        dte_list = '; '.join(map(str, sorted(filtered_dte['DTE'].unique())))  # List of unique DTE values
        spread_cost_interval = f"{filtered_dte['SPREAD_COST'].min()} to {filtered_dte['SPREAD_COST'].max()}"

        # Calculate additional statistics for each DTE
        dte_stats = filtered_dte.groupby('DTE').agg(
            Avg_Spread_Cost=('SPREAD_COST', 'mean'),
            Q1_Spread_Cost=('SPREAD_COST', lambda x: np.percentile(x, 25)),
            Q3_Spread_Cost=('SPREAD_COST', lambda x: np.percentile(x, 75)),
            Avg_Expiry_Value=('EXPIRY_VALUE', 'mean'),
            Q1_Expiry_Value=('EXPIRY_VALUE', lambda x: np.percentile(x, 25)),
            Q3_Expiry_Value=('EXPIRY_VALUE', lambda x: np.percentile(x, 75))
        ).reset_index()

        # Remove any previously added DTE statistics to prevent duplicates
        columns_to_remove = [col for col in df.columns if col.startswith('Avg_Spread_Cost') or col.startswith('Q1_Spread_Cost') or col.startswith('Q3_Spread_Cost') or col.startswith('Avg_Expiry_Value') or col.startswith('Q1_Expiry_Value') or col.startswith('Q3_Expiry_Value')]
        df.drop(columns=columns_to_remove, inplace=True)

        # Now, merge the new DTE statistics into the DataFrame
        df = df.merge(dte_stats, on='DTE', how='left')

        # Save the updated file
        df.to_csv(file_path, index=False)
        print(f"Updated file saved with DTE statistics: {file_path}")

        filename = os.path.basename(file_path)
        try:
            parts = filename.split("_threshold_")[1].split("_strike_")
            threshold_part = parts[0]
            sell_strike = float(parts[1].replace(".csv", ""))
        except Exception as e:
            print(f"Error extracting details from filename {filename}: {e}")
            return None
        
        return {
            'File': filename,
            'VIX_Threshold': threshold_part,
            'Sell_Strike': sell_strike,
            'Number of Trades': num_trades,
            'Total Return': total_return,
            'Max Drawdown': max_drawdown,
            'Risk/Reward Ratio': risk_reward_ratio,
            'Winrate (%)': winrate,
            'DTE': dte_list,
            'Spread_Cost_Interval': spread_cost_interval
        }
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def filter_best_strategies(directory):
    best_strategies_folder = os.path.join(directory, "Best_New_Strategies")
    os.makedirs(best_strategies_folder, exist_ok=True)
    
    best_results = []
    
    for subdir, _, files in os.walk(directory):
        for file in files:
            if file.startswith("vix_put_spread_results") and file.endswith(".csv"):
                file_path = os.path.join(subdir, file)
                
                metrics = calculate_metrics(file_path)
                if metrics:
                    df = pd.DataFrame([metrics])
                    
                    best_strategies = df[(df['Winrate (%)'] > 60) & (df['Total Return'] > 0) & (df['Number of Trades'] >= 26)]
                    
                    if not best_strategies.empty:
                        best_results.append(best_strategies)
                        
                        # Add "Summary" prefix to individual best strategy file names
                        best_file_name = "Summary_" + file
                        best_file_path = os.path.join(best_strategies_folder, best_file_name)
                        
                        best_strategies.to_csv(best_file_path, index=False)
                        print(f"Saved best strategies for {file} at {best_file_path}")
                    else:
                        print(f"No best strategies found for {file}")
    
    if best_results:
        best_summary_df = pd.concat(best_results, ignore_index=True)
        
        # Remove the 'File' column from the summary DataFrame
        best_summary_df.drop(columns=['File'], inplace=True, errors='ignore')
        
        # Save the summary file
        best_summary_file = os.path.join(best_strategies_folder, "VIX_Best_Strategy_Summary.csv")
        best_summary_df.to_csv(best_summary_file, index=False)
        print(f"Best strategies summary saved at {best_summary_file}")

# Example usage:
directory = r"C:\Users\33698\Desktop\VIX_Trading_Strategy\VIX_put_spread_strategies_maturity_adjusted"
filter_best_strategies(directory)
