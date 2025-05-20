---
sidebar_position: 1
---

# GitHub & Vercel

To enable real-time updates and automated documentation, I connected this project to both **GitHub** and **Vercel**, allowing seamless deployment of trading dashboards and forward-testing logs.

---

## 🔗 GitHub Integration

The full Docusaurus documentation, including all strategy insights, data pipelines, and forward-testing tools, is hosted on GitHub:

👉 [View Repository](https://github.com/BenjiFaccin/VIX_trading_strategy)

This repository:
- Contains the Docusaurus config and all `.md` pages
- Tracks every change to strategy logic and documentation
- Allows rollback and version control

---

## 🚀 Vercel Hosting

The GitHub project is directly linked to **Vercel**, which enables **automatic deployment** every time a commit is pushed. This is especially useful for:

- **Publishing new pages or edits instantly**
- Syncing real-time log updates (e.g., live trade results)
- Preparing the ground for **dynamic dashboards** (next page)

🔗 [View Vercel Deployment](https://vercel.com/benjis-projects-c3cba0f9/vix-trading-strategy/deployments)

---

## 🧠 Use Case in Automation Loops

This setup integrates smoothly with my trading automation system:

- `loop_entry.py` and `loop_exit.py` run continuously during US market hours
- At every cycle, trade logs (`entry_trades.csv`, `exit_trades.csv`) are updated
- These logs can be committed and pushed to GitHub automatically
- Vercel picks up the update and redeploys the site within seconds

✅ This means I can **monitor forward-tested strategies** live from anywhere, without needing direct server access.

---
