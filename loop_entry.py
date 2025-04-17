import time
import subprocess

# Path to your entry strategy script
script_path = r"C:\Users\33698\Desktop\VIX_Trading_Strategy\entry_trades.py"

while True:
    print("🚀 Launching ENTRY strategy script...")

    # Run the strategy as a subprocess
    process = subprocess.run(['python', script_path])

    # Countdown after script finishes
    wait_time = 30
    print(f"\n✅ Entry script completed. Waiting {wait_time} seconds before restarting...")

    for remaining in range(wait_time, 0, -1):
        print(f"⏳ Restarting ENTRY in {remaining} seconds...", end="\r")
        time.sleep(1)

    print("\n🔁 Restarting entry script...\n")
