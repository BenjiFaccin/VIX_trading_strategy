import os
import pandas as pd

# Directory to search for the .txt files
root_dir = r'C:\Users\33698\Desktop\VIX_Trading_Strategy\Historical_EoD_VIX_Row_Data_2010_to_2023'

# Function to convert txt to xlsx and ensure correct delimiter splitting
def convert_txt_to_xlsx(txt_file_path):
    # Try reading the txt file with different common delimiters
    try:
        # Attempt to read with comma separator first
        df = pd.read_csv(txt_file_path, delimiter=',')
    except:
        try:
            # If comma fails, attempt to read with tab separator
            df = pd.read_csv(txt_file_path, delimiter='\t')
        except:
            # If both fail, try with spaces as a delimiter
            df = pd.read_csv(txt_file_path, delimiter=r'\s+')

    # Create the new file path with .xlsx extension
    xlsx_file_path = txt_file_path.replace('.txt', '.xlsx')

    # Save the dataframe to .xlsx
    df.to_excel(xlsx_file_path, index=False)

    # Delete the original txt file after conversion
    os.remove(txt_file_path)
    print(f"Converted and deleted: {txt_file_path}")

# Walk through all subdirectories and files to convert .txt files to .xlsx
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.txt'):
            txt_file_path = os.path.join(root, file)
            convert_txt_to_xlsx(txt_file_path)


# Now execute the second part (after txt-to-xlsx conversion)
# Set base paths (Modify this according to your system)
base_path = r"C:\Users\33698\Desktop\VIX_Trading_Strategy"
eod_data_path = os.path.join(base_path, "Historical_EoD_VIX_Row_Data_2010_to_2023")
vix_history_path = os.path.join(base_path, "VIX_History.csv")
cleaned_data_path = os.path.join(base_path, "Historical_EoD_VIX_Cleaned_Data_2010_to_2023_adjusted")

# Ensure output directory exists
os.makedirs(cleaned_data_path, exist_ok=True)

# Load VIX History Data (OHLC Data)
vix_history_df = pd.read_csv(vix_history_path)

# Convert DATE column in VIX history to datetime safely
vix_history_df["DATE"] = pd.to_datetime(vix_history_df["DATE"], format="%m/%d/%Y", errors="coerce")

# Check if DATE conversion was successful
if not pd.api.types.is_datetime64_any_dtype(vix_history_df["DATE"]):
    raise ValueError("Error: vix_history_df['DATE'] is not in datetime format.")

# Extract only the date part (remove time)
vix_history_df["DATE"] = vix_history_df["DATE"].dt.date

# Process each VIX EoD file in the folder (including subfolders)
for folder_name, subfolders, file_names in os.walk(eod_data_path):  # Traverse through all subfolders
    for file_name in file_names:
        if file_name.endswith(".xlsx"):  # Only process .xlsx files
            file_path = os.path.join(folder_name, file_name)
            
            # Load VIX EoD Data from Excel file
            vix_eod_df = pd.read_excel(file_path)

            # Clean column names (strip spaces and remove brackets)
            vix_eod_df.columns = vix_eod_df.columns.str.strip().str.replace("[", "").str.replace("]", "")

            # Convert QUOTE_DATE column to datetime
            vix_eod_df.rename(columns={"QUOTE_DATE": "DATE"}, inplace=True)
            vix_eod_df["DATE"] = pd.to_datetime(vix_eod_df["DATE"], errors="coerce")

            # Check if DATE conversion was successful
            if not pd.api.types.is_datetime64_any_dtype(vix_eod_df["DATE"]):
                print(f"⚠️ Error: DATE column is not in datetime format for {file_name}. Skipping file.")
                continue

            # Clean: Convert numeric columns
            numeric_columns = [
                'UNDERLYING_LAST', 'EXPIRE_DATE', 'EXPIRE_UNIX', 'DTE', 'C_DELTA', 'C_GAMMA', 
                'C_VEGA', 'C_THETA', 'C_RHO', 'C_IV', 'C_VOLUME', 'C_LAST', 'C_SIZE', 'C_BID', 
                'C_ASK', 'STRIKE', 'P_BID', 'P_ASK', 'P_SIZE', 'P_LAST', 'P_DELTA', 'P_GAMMA', 
                'P_VEGA', 'P_THETA', 'P_RHO', 'P_IV', 'P_VOLUME', 'STRIKE_DISTANCE', 'STRIKE_DISTANCE_PCT'
            ]
            
            # Convert each column to numeric (coerce errors to NaN)
            for col in numeric_columns:
                vix_eod_df[col] = pd.to_numeric(vix_eod_df[col], errors='coerce')

            # Keep only required columns (DATE, DTE, STRIKE, P_BID, P_ASK, P_LAST, P_IV, P_VOLUME)
            required_columns = [
                "DATE", "DTE", "STRIKE", "P_BID", "P_ASK", "P_LAST", "P_IV", "P_VOLUME"
            ]
            vix_eod_df = vix_eod_df[required_columns]

            # Filter DTE <= 30
            vix_eod_df = vix_eod_df[vix_eod_df["DTE"] <= 30]

            # Remove rows where P_VOLUME < 75
            vix_eod_df = vix_eod_df[vix_eod_df["P_VOLUME"] >= 75]

            # Extract only the date (removing time)
            vix_eod_df["DATE"] = vix_eod_df["DATE"].dt.date

            # Merge VIX OHLC data with EoD data (including OPEN, HIGH, LOW, CLOSE columns)
            vix_merged_df = vix_eod_df.merge(vix_history_df[["DATE", "OPEN", "HIGH", "LOW", "CLOSE"]], on="DATE", how="left")

            # Add 4 more columns for OHLC corresponding to the DTE date
            vix_merged_df["DATE_PLUS_DTE"] = vix_merged_df["DATE"] + pd.to_timedelta(vix_merged_df["DTE"], 'D')

            for index, row in vix_merged_df.iterrows():
                start_date = row["DATE"] + pd.Timedelta(days=1)  # DATE + 1
                end_date = row["DATE_PLUS_DTE"]  # DATE + DTE
                target_date = row["DATE_PLUS_DTE"]
                target_ohlc = vix_history_df[vix_history_df["DATE"] == target_date]

                # Filter vix_history_df for the date range (DATE+1 to DATE+DTE)
                period_data = vix_history_df[(vix_history_df["DATE"] >= start_date) & (vix_history_df["DATE"] <= end_date)]

                if not period_data.empty:
                    vix_merged_df.at[index, "LOW_DTE_BUY"] = period_data["LOW"].min()  # ✅ Take MIN LOW in the period

                    # Fix: Only assign values if target_ohlc is not empty
                    if not target_ohlc.empty:
                        vix_merged_df.at[index, "LOW_DTE_SELL"] = target_ohlc["LOW"].values[0]
                        vix_merged_df.at[index, "OPEN_DTE"] = target_ohlc["OPEN"].values[0]
                        vix_merged_df.at[index, "HIGH_DTE"] = target_ohlc["HIGH"].values[0]
                        vix_merged_df.at[index, "CLOSE_DTE"] = target_ohlc["CLOSE"].values[0]
                    else:
                        print(f"⚠️ Warning: No data found for DATE_PLUS_DTE {target_date}")

            # ✅ Remove rows where DATE_PLUS_DTE has no corresponding data
            vix_merged_df = vix_merged_df.dropna(subset=["OPEN_DTE", "HIGH_DTE", "LOW_DTE_SELL", "CLOSE_DTE"])

            # Debug: Check if merging was successful
            if vix_merged_df.empty:
                print(f"⚠️ Warning: {file_name} has no valid dates after merging. Skipping file.")
                continue

            # Ensure that the subfolder structure in cleaned data path exists
            relative_path = os.path.relpath(folder_name, eod_data_path)
            output_subfolder = os.path.join(cleaned_data_path, relative_path)
            os.makedirs(output_subfolder, exist_ok=True)

            # Save cleaned files per trading day
            unique_dates = vix_merged_df["DATE"].unique()

            for date in unique_dates:
                daily_df = vix_merged_df[vix_merged_df["DATE"] == date]
                cleaned_file_path = os.path.join(output_subfolder, f"VIX_Cleaned_{date}.xlsx")  # Save as .xlsx
                daily_df.to_excel(cleaned_file_path, index=False)

            print(f"✅ {len(unique_dates)} cleaned files created for {file_name} in folder {relative_path}.")

print("🎉 All files processed successfully!")
