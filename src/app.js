// app.js
import initAlpine from './initAlpine';



import injectCSS from './injectCSS';

const bdy = document.body

bdy.classList.add("flex");

const kapp = document.getElementById("slogkoledarapp");
if(!kapp){
  var appdiv = document.createElement("div");
  appdiv.setAttribute("id", "slogkoldearapp");
  appdiv.classList.add("sloghideme");
  
  bdy.insertAdjacentElement("afterbegin", appdiv);
}


initAlpine();


var styles = `
    
  .overw{
    /*all: initial;*/
  }
  
    
    #slogkoldearapp::-webkit-scrollbar{
        display:none;
    }
    #slogkoldearapp{
        height: 100vh;
        overflow-y: scroll;
        position: fixed;
        -ms-overflow-style:none;
        scrollbar-width: none;
        eight: 100vh;
        /* overflow-y: scroll; */
        /* position: fixed; */
        -ms-overflow-style: none;
        /* scrollbar-width: none; */
        display: block;
        width: 240px;
        position: relative;
    }
`;

var styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


injectCSS();

