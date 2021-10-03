// Importation des Modules.
const custombar = require("custom-electron-titlebar");
const ipc = require("electron").ipcRenderer;
const iziToast = require('izitoast');

// Variables Globales.
let inputPseudo = document.getElementById("pseudo");
let inputMdp = document.getElementById("mdp");
let LoginMojang = document.getElementById("LoginMojang");
let LoginMicrosoft = document.getElementById("LoginMicrosoft");
// Title Bar.
let bar = new custombar.Titlebar({
  menu: null,
  backgroundColor: custombar.Color.TRANSPARENT,
});

// Lorsque l'utilisateur clique sur le bouton Microsoft.
LoginMicrosoft.addEventListener("click", () => {
  LoginMojang.classList.add('buttonLoading');
  ipc.send("LoginMicrosoft");
});
// Lorsque l'utilisateur tente de se connecter avec Mojang.
LoginMojang.addEventListener("click",() => {
  LoginMojang.classList.add('buttonLoading');
  if(inputPseudo.value && inputMdp.value) {
    LoginMojang.disabled = true;
    ipc.send("LoginMojang", {
      user: inputPseudo.value,
      pass: inputMdp.value
   });
  };
  if(!inputPseudo.value && !inputMdp.value) {
    LoginMojang.disabled = false,
    setTimeout(()=> {
      iziToast.info({
        message: "Veuillez entrer vos identifiants",
        transitionIn: "fadeInDown",
      });
      LoginMojang.classList.remove("buttonLoading");
    }, 500);
  };
});
ipc.on("err", (event, errorMessage) => {
  setTimeout(() => {
    iziToast.error({
      id: "error",
      title: "Erreur",
      message: errorMessage,
      position: "bottomRight",
    });
      LoginMojang.classList.remove("buttonLoading");
    }, 1200);
    LoginMojang.disabled = false;
  });
  ipc.on("msg", (event, Message) => {
    iziToast.info({
      title: Message,
      iconUrl: '../images/logo.png',
      color: "#161616",
      titleColor: "#faa81a",
      iconColor: "iconColor",
      close: false
      });
});
  if(localStorage.getItem('user')) {
    // Login Mojang avec les tokens.
    ipc.send('LoginMojangToken', JSON.parse(localStorage.getItem('user')));
  };