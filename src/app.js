// app.js
import initAlpine from './initAlpine';
import injectCSS from './injectCSS';

const bdy = document.body

classList.add("flex");

var appdiv = document.createElement("div");
appdiv.setAttribute("id", "app");
appdiv.style.display = "none";
bdy.insertAdjacentElement("afterbegin", appdiv);

initAlpine();
injectCSS();