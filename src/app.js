// app.js
import initAlpine from './initAlpine';



import injectCSS from './injectCSS';

const bdy = document.body

bdy.classList.add("flex");

const kapp = document.getElementById("slogkoledarapp");
console.log(document);
                                      
if(!kapp){
  var appdiv = document.createElement("div");
  appdiv.setAttribute("id", "slogkoledarapp");
  appdiv.classList.add("sloghideme");
  
  bdy.insertAdjacentElement("afterbegin", appdiv);
}


initAlpine();


var styles = `
    
  .overw{
    /*all: initial;*/
  }
  
    
    #slogkoledarapp::-webkit-scrollbar{
        display:none;
    }
    #slogkoledarapp{
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

