---
sidebar_position: 2
---

# Automation Program

This section details the automation system that manages the daily execution of my trading algorithm using **IB Gateway** and **Windows Task Scheduler** on a Contabo-hosted Windows VPS. It includes automatic restarts of IB Gateway, scheduled script launches and terminations, and a lightweight batch execution approach. The goal is to minimize manual intervention while staying fully aligned with U.S. stock market hours.

## 🔁 IB Gateway Auto-Restart

IB Gateway can become unstable over several days due to memory use or expired sessions. To prevent failures, I configured it to **restart automatically every day at 05:56 AM**, well before the market opens. This ensures the connection to IBKR is fresh and avoids silent crashes.

Settings used:
- **Mode**: Auto Restart
- **Time**: 05:56 AM
- **Frequency**: Daily

The restart occurs outside trading hours and allows for multi-day operation with minimal maintenance. Occasional manual login may still be needed due to IBKR's periodic authentication requirements.

Configuration path:  
**Configuration → Lock and Exit → Auto Restart**

![VM IB Gateway Config](/img/vm_program.png)

## 🛠️ Batch Script for Launching the Strategy

To streamline execution, I created a `.bat` file called `launch_trader.bat` to run the Python trading script:

```bat
@echo off
cd /d "C:\Users\ibuser\Desktop\VIX_Trading_Strategy"
python run_trader.py
```

This script:
- Suppresses command output
- Navigates to the correct folder
- Executes the trading code with Python

Benefits:
- Simple and reliable
- Works with Task Scheduler
- Easy to debug or expand later (e.g. with logs or error handling)

![Bat file for launching algo](/img/vm_program_bat.png)

## ⏱️ Task Scheduler Setup

Two scheduled tasks control the lifecycle of the algorithm. Both run under the secondary VPS user to stay independent of RDP sessions.

### ✅ Launch Task
- **Name**: Launch algo
- **Time**: Daily at 3:35 PM Paris / 9:30 AM NY
- **Action**: Runs `launch_trader.bat`
- **Extras**: Runs whether user is logged in or not, uses highest privileges

This ensures the bot starts at the exact U.S. market open, when most trading activity begins.

### ❌ Kill Task
- **Name**: Kill algo
- **Time**: Daily at 11:06 PM Paris time
- **Action**: Ends the CMD or Python process

This prevents the strategy from running outside trading hours and ensures a clean stop each day.

![Task schedulers configuration](/img/vm_program_task.png)


This whole configuration allow a fully operational automated algorithmic trading strategy, without human intervention (only one connection a week to do) and an overview automatically updated dashboards to follow it easily.