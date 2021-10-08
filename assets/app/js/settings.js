// Importation des Modules.
const custombar = require("custom-electron-titlebar");
const ipc = require("electron").ipcRenderer;
const iziToast = require('izitoast');

// Ram & Version
function getRam() {
    let ramlist = document.getElementById('ram')
    let ramselect = ramlist.options[ramlist.selectedIndex].text
    localStorage.setItem('ram', ramselect);
};
function getVersion() {
    let versionlist = document.getElementById('version')
    let versionselect = versionlist.options[versionlist.selectedIndex].text
    localStorage.setItem('version', versionselect);
};
// Save.
document.getElementById("save").addEventListener("click", () => {
    ipc.send("SavedSettings");
  });
// Title Bar.
let bar = new custombar.Titlebar({
  menu: null,
  backgroundColor: custombar.Color.TRANSPARENT,
  maximizable: false
});