// app.js
import initAlpine from './initAlpine';



import injectCSS from './injectCSS';

const bdy = document.body

bdy.classList.add("flex");

var appdiv = document.createElement("div");
appdiv.setAttribute("id", "app");
appdiv.classList.add("overw");
appdiv.classList.add("hover:w-80");
appdiv.classList.add("w-60");
appdiv.classList.add("duration-500");
bdy.insertAdjacentElement("afterbegin", appdiv);

initAlpine();


var styles = `
    
  .overw{
    /*all: initial;*/
  }
  
    
    #stuhudicev::-webkit-scrollbar{
        display:none;
    }
    #stuhudicev{
        height: 100vh;
        overflow-y: scroll;
        position: fixed;
        -ms-overflow-style:none;
        scrollbar-width: none;
    }
`

var styleSheet = document.createElement("style")
styleSheet.innerText = styles
document.head.appendChild(styleSheet)


injectCSS();

