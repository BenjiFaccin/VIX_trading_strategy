import time
import subprocess

# Path to your exit strategy script
script_path = r"C:\Users\33698\Desktop\VIX_Trading_Strategy\exit_trades.py"

while True:
    print("🎯 Launching EXIT strategy script...")

    # Run the strategy as a subprocess
    process = subprocess.run(['python', script_path])

    # Countdown after script finishes
    wait_time = 30
    print(f"\n✅ Exit script completed. Waiting {wait_time} seconds before restarting...")

    for remaining in range(wait_time, 0, -1):
        print(f"⏳ Restarting EXIT in {remaining} seconds...", end="\r")
        time.sleep(1)

    print("\n🔁 Restarting exit script...\n")
