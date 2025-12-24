const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, "icon.ico"), // Opcional: se tiver um ícone
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Permite que seu script rode sem problemas
    },
    autoHideMenuBar: true, // Esconde a barra de menu padrão (File, Edit...)
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
