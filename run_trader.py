import threading
import subprocess

# Define paths to each script
entry_script = r"C:\Users\33698\Desktop\VIX_Trading_Strategy\loop_entry.py"
exit_script = r"C:\Users\33698\Desktop\VIX_Trading_Strategy\loop_exit.py"

def run_entry():
    print("🚀 Starting ENTRY loop script...")
    subprocess.run(["python", entry_script])

def run_exit():
    print("🎯 Starting EXIT loop script...")
    subprocess.run(["python", exit_script])

# Start both threads (they will run indefinitely on their own)
entry_thread = threading.Thread(target=run_entry)
exit_thread = threading.Thread(target=run_exit)

entry_thread.start()
exit_thread.start()

entry_thread.join()
exit_thread.join()
