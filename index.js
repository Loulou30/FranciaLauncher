const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const { Client, Authenticator } = require("minecraft-launcher-core");
const {autoUpdate} = require('electron-auto-update');
 
autoUpdate();

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Spectre Client",
    icon: path.join(__dirname, "/assets/app/images/logo.png"),
    width: 980,
    maxWidth: 980,
    minWidth: 980,
    height: 530,
    maxHeight: 530,
    minHeight: 530,
    titleBarStyle: "hidden",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(path.join(__dirname, "assets/app/login.html"));
}
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
ipcMain.on("login", (evt, data) =>{
  Authenticator.getAuth(data.user,data.pass)
  .then((user) => {
    mainWindow.loadURL(path.join(__dirname, "assets/app/app.html")).then(() => {
      mainWindow.webContents.send("user", user);
      mainWindow.webContents.send("user", user.uuid);

    });
  }).catch(() => {
    evt.sender.send("err", "Identifiants invalides");
  });
});
ipcMain.on("loginToken", (evt, data) =>{
  Authenticator.getAuth(data.access_token, data.client_token)
  .then((user) => {
    mainWindow.loadURL(path.join(__dirname, "assets/app/app.html")).then(() => {
      mainWindow.webContents.send("user", user)
      mainWindow.webContents.send("user", user.uuid);
    
    });
 
  }).catch(() => {
    evt.sender.send("err", "Token expiré");
  });
});
ipcMain.on('logout', (evt, user) => {
  mainWindow.loadURL(path.join(__dirname, 'assets/app/login.html')).then(() => {
  }).catch(() => {
      evt.sender.send("err", "Erreur lors de la déconnexion");
    });
  });




