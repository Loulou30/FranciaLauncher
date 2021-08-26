// Importation des Modules
const DiscordRichPresence = require('discord-rich-presence')('872877401279987812');
const { app, ipcMain, BrowserWindow} = require("electron");
const ipc = require("electron").ipcRenderer
const path = require("path");
const { Client, Authenticator } = require("minecraft-launcher-core");
const Launcher = new Client();
const fs = require("fs");
const msmc = require("msmc");
const fetch = require("node-fetch");

// Création de la fenêtre principale
let mainWindow;
let appdata = app.getPath("appData")
function ShowApp() {
  mainWindow.show()
  SplashStart.close();
}
// Loading Page (Pour les personnes qui en ont besoin)
function loading() {
  mainWindow.loadFile(path.join(__dirname, 'assets/app/html/loading.html'));
}
function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Spectre Launcher",
    icon: path.join(__dirname, "/assets/app/images/logo.png"),
    width: 980,
    maxWidth: 980,
    minWidth: 980,
    height: 530,
    maxHeight: 530,
    minHeight: 530,
    show: false,
    titleBarStyle: "hidden",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadFile(path.join(__dirname, "assets/app/html/login.html")).then(() => {
    console.log("- The mainWindow has been created");
  });
  // Création du Splash Screen
  SplashStart = new BrowserWindow({width: 300, icon: path.join(__dirname, "/assets/app/images/logo.png") ,height: 400, frame: false, alwaysOnTop: true, transparent: true});
  SplashStart.loadFile(path.join(__dirname, 'assets/app/html/splash.html'));
  console.log("- The Splash sreen has been created");
  mainWindow.once('ready-to-show', () => {
   setTimeout(ShowApp, 2900);
  });
};
// Activation de la Discord Rich Presence
DiscordRichPresence.updatePresence({
  state: 'En Ligne',
  largeImageKey: 'large',
  instance: true,
  });
  console.log("- DiscordRichPresence - Enabled")
  app.whenReady().then(() => {
    createWindow();
  app.on("activate", function () {
    if(BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
  app.on("window-all-closed", function () {
    if(process.platform !== "darwin") app.quit();
  });
  // Login Mojang avec les Identifiants
  ipcMain.on('LoginMojang',(evt,data) => {
    Authenticator.getAuth(data.user, data.pass)
    .then((user) => {
      mainWindow.loadFile(path.join(__dirname, 'assets/app/html/app.html')).then(() => {
        mainWindow.webContents.send('user', user);
        console.log('\nPseudo - ' + user.name + "\n")
        ipcMain.on('PlayMojang', (evt, data) => {
          let OptionsMojang = {
            clientPackage: null,
            authorization: Authenticator.refreshAuth(data.access_token, data.client_token),
            root: `${appdata}/.spectrelauncher/`,
            version: {
                number: "1.14.4",
                type: "release"
            },
            memory: {
                max: "4G",
                min: "1G"
            },
            window: {
              width: "854",
              height: "480"
            },
        };
        Launcher.launch(OptionsMojang)
        .catch(() => {
          evt.sender.send("err", "Erreur lors du lancement")
        });
        evt.sender.send("msg", "Minecraft・Lancement du Jeu en cours.")
        Launcher.on('debug', (e) => console.log(e))
        Launcher.on('data', (e) => console.log(e));
      });
      });
    }).catch(() => { 
      evt.sender.send('err', 'Mauvais identifiants');
    });
});
  ipcMain.on('LoginMojangToken', (evt, data) => {
    Authenticator.getAuth(data.access_token, data.client_token)
    .then((user) => {
      mainWindow.loadFile(path.join(__dirname, 'assets/app/html/app.html')).then(() => {
        mainWindow.webContents.send('user', user);
        console.log('\nPseudo - ' + user.name + "\n")
      });
    }).catch(() => { 
      evt.sender.send('err', 'Tokens expirés');
    });
  });
  ipcMain.on('LoginMicrosoft', (evt, data) => {
    msmc.setFetch(fetch)
    msmc.fastLaunch("electron", (update) => {
      console.log(update)
    }).then(call => {
      if(msmc.errorCheck(call)) {
        evt.sender.send("err", "Erreur lors de la connexion") 
        return;
      };
      var accessToken = call.access_token;
      var profile = call.profile;
      mainWindow.loadFile(path.join(__dirname, 'assets/app/html/app.html')).then(() => {
        let user = {
          name:profile.name,
          skin:profile.skins[0].url
        };
        mainWindow.webContents.send('profile', user);
        console.log('\nPseudo - ' + user.name + "\n");
        ipcMain.on('PlayMicrosoft', (evt, data) => {
              let OptionsMicrosoft = {
                clientPackage: null,
                authorization: msmc.getMCLC().getAuth(call),
                root: `${appdata}/.spectrelauncher/`,
                version: {
                  number: "1.14.4",
                  type: "release"
              },
              memory: {
                  max: "1G",
                  min: "1G",
              },
              window: {
                width: "854",
                height: "480"
              },
          };
        Launcher.launch(OptionsMicrosoft)
        .catch(() => {
          evt.sender.send("err", "Erreur lors du lancement")
        });
          evt.sender.send("msg", "Minecraft・Lancement du Jeu en cours.")
          Launcher.on('debug', (e) => console.log(e))
          Launcher.on('data', (e) => console.log(e));
      });
    });
});
  });


// Déconnexion
ipcMain.on('logout', (evt, user) => {
  mainWindow.loadFile(path.join(__dirname, 'assets/app/html/login.html'))
    .catch(() => {});
    evt.sender.send('err', 'Erreur lors de la déconnexion')
  });

