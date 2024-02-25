// app.js
import initAlpine from './initAlpine';



import injectCSS from './injectCSS';

const bdy = document.body

bdy.classList.add("flex");


var appdiv = document.createElement("div");
appdiv.setAttribute("id", "slogkoldearapp");

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

