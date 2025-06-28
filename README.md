# Muninn

**Muninn** is a real-time, cross-platform network monitoring desktop application built with Electron and React.  
It helps you visualise active network connections, monitor traffic, and detect unusual activity — all securely, 100% locally.

## Features

- Monitor network traffic, active connections, and open ports  
- Real-time bandwidth graphs and interface statistics  
- OS notifications for suspicious activity  
- 100% local — no telemetry, no data collection, no internet required  
- Manual update checks via GitHub Releases  
- Cross-platform: **macOS**, **Windows**, **Linux**

## Tech Stack

- **React** (UI built with [Vite](https://vitejs.dev/))  
- **Electron** (cross-platform desktop shell)  
- [`systeminformation`](https://www.npmjs.com/package/systeminformation), [`cap`](https://www.npmjs.com/package/cap) (for network stats)  
- [`electron-builder`](https://www.electron.build/) (packaging and publishing)  
- Native notifications via Electron

## Getting Started (Development)

```bash
    git clone https://github.com/HawkdotDev/muninn.git
    cd muninn
    npm install
    npm run dev
````

This will launch the app in development mode using Vite + Electron.

## Privacy

Muninn is a **100% local application**.

* No usage data is collected or transmitted
* No background network connections
* All monitoring is performed locally, on-device
* Users can **manually check for updates** — the app will never auto-update or phone home

## Manual Update Checks

You can check for updates by clicking **“Check for Updates”** in the app.
Muninn will query [GitHub Releases](https://github.com/HawkdotDev/muninn/releases) and notify you if a new version is available — no updates are ever downloaded silently.

## Build for Production

To build the app for distribution:

```bash
    npm run build
```

The build artifacts will be located in the `dist/` folder (renderer) and packaged via `electron-builder`.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.
