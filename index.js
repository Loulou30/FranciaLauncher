const { app, ipcMain, BrowserWindow} = require("electron");
const path = require("path");
const { Client, Authenticator } = require("minecraft-launcher-core");
const Launcher = new Client();
const autoUpdater = require('electron-updater').autoUpdater
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

  mainWindow.loadFile(path.join(__dirname, "assets/app/login.html"));
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
ipcMain.on('login',(evt,data)=>{
  Authenticator.getAuth(data.user, data.pass)
    .then((user) => {
      mainWindow.loadFile(path.join(__dirname, 'assets/app/app.html')).then(() => {
        mainWindow.webContents.send('user', user);
        console.log('Pseudo : ' + user.name)
      })
    })
  .catch(() => {
  evt.sender.send('err', 'Mauvais identifiants');
 });
});
ipcMain.on('loginToken', (evt, data) => {
  Authenticator.refreshAuth(data.access_token, data.client_token)
    .then((user) => {
      mainWindow.loadFile(path.join(__dirname, 'assets/app/app.html')).then(() => {
        mainWindow.webContents.send('user', user);
        console.log('Pseudo : ' + user.name)
      });
    })
    .catch(() => {
      evt.sender.send('err', 'Tokens expirés');
    });
});
ipcMain.on('play', (evt, data )=> {
  let options = {
    clientPackage: null,
    authorization: Authenticator.refreshAuth(data.access_token, data.client_token),
    root: `C:/Users/${process.env.username || process.env.user}/AppData/Roaming/.spectreclient`,
    version: {
        number: "1.16.5",
        type: "release"
    },
    memory: {
        max: "2G",
        min: "1G"
    },
    window: {
      width: "854",
      height: "480"
    },
}
Launcher.launch(options).catch((err) => {
evt.sender.send('err', 'Erreur lors du lancement de Minecraft')
app.quit()
});
Launcher.on('debug', (e) => console.log(e))
Launcher.on('data', (e) => console.log(e));    
})
ipcMain.on('logout', (evt, user) => {
  mainWindow.loadFile(path.join(__dirname, 'assets/app/login.html'))
    .catch(() => {});
    evt.sender.send('err', 'Erreur lors de la déconnexion')
  });