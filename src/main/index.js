import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";

// Create the main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon:
      process.platform === "linux" || is.dev
        ? join(__dirname, "../../resources/icon.png")
        : undefined,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  // Show window when ready
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Load remote URL in dev, local file in prod
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// App ready event
app.whenReady().then(() => {
  // Set correct app ID (important for Windows notifications & update metadata)
  electronApp.setAppUserModelId("com.hawkdotdev.muninn");

  // Enable dev shortcuts in development
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Example IPC test
  ipcMain.on("ping", () => console.log("pong"));

  // startNetworkMonitorWS(); // ← Start your network monitor server

  // Create the main window
  createWindow();

  // macOS: Re-create window on dock click if none are open
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit the app when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// You can place additional main-process code below or import from separate files.
