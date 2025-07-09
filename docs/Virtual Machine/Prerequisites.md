---
sidebar_position: 1
---

# Prerequisites

## Contabo Virtual Machine Setup

To establish a stable and always-on environment for running my automated trading system, I opted for a **Cloud VPS 10 SSD** from **Contabo**, configured with **Windows Server 2022 Datacenter Edition (64-bit)**. The selection of the VPS provider and operating system was a critical decision due to compatibility, control, and automation requirements.

Initially, I considered using a Linux-based VPS setup. However, during testing, it became clear that **running IB Gateway in headless mode on Linux** introduced numerous complications, particularly regarding graphical dependencies and session persistence. The application would fail to launch or behave unpredictably without a stable GUI environment, even when attempting to use solutions like XVFB or other virtual display managers. Due to these limitations, I transitioned to a **Windows Server environment**, which provided a more reliable and straightforward platform for managing IB Gateway sessions without the same compatibility concerns.

This Windows-based setup allowed me to manage services with native compatibility and gave me the flexibility to use GUI-based applications without needing to manage complex workarounds.

## Session Configuration and Persistent Access

One of the core goals of this virtual machine setup was to create a **fully automated system** that would not require manual intervention or frequent logins to keep running. To meet this requirement, I had to take additional steps beyond the default Windows VPS configuration.

I created a **secondary user account** within the Windows Server environment. This user was configured with administrative privileges but designed specifically for **persistent access without active supervision**. The main reason for doing this was to **detach the automated session from the main user**, which allowed me to:

- Log out of the VPS remotely without terminating running tasks.
- Ensure that scripts and background processes tied to that user continue to run indefinitely.
- Avoid scenarios where the session is forcefully closed or interrupted due to RDP timeouts or policy restrictions.

This approach is ideal when deploying headless or background processes that are **expected to run for extended periods** (days or weeks) without requiring input. It replicates a local-machine-like behavior in the cloud and maximizes uptime for sensitive tasks like trading, which require constant market monitoring.

## Tools and Software Environment Reconstruction

Once the environment was secured and the new user session was configured, I proceeded with a **complete reinstallation and environment rebuild** to ensure that all dependencies were correctly aligned. This included downloading and reinstalling the full stack of software required for my trading automation system.

The applications installed on the new Windows Server user environment included:

- **IB Gateway**: The official interface for connecting to the Interactive Brokers TWS system. This is the core bridge between my scripts and the brokerage services.
- **Visual Studio Code (VSC)**: My main code editor for reviewing, editing, and maintaining scripts. VSC also integrates well with version control and Python environments.
- **Python**: The programming language in which all automation scripts are written. I ensured that all required libraries and packages were reinstalled and that environment variables were properly configured.
- **Git Bash**: For command-line control, repository management, and project versioning. Git Bash provides Unix-like command-line tools within Windows, making it easier to execute scripts and manage the codebase.

In addition to reinstalling these applications, I had to **migrate my project directories and code folders** into the new user's file system. This included:

- Manually copying all scripts, modules, and configuration files.
- Updating all internal **path references** within scripts to reflect their new locations.
- Ensuring that dependencies and external data links (e.g., environment variables, config files, secrets) were re-established correctly.

These tasks were necessary to **restore the full functionality** of my trading system under the new setup and to make sure that all automation could run **without manual intervention or repeated troubleshooting**.

This preparation ensures the virtual machine is fully equipped for live, unattended deployment, allowing me to focus on development and strategy improvement rather than infrastructure maintenance.
