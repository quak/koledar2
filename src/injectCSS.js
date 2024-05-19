const injectCSS = () => {
    // Create a <link> element
    var link = document.createElement("link");

    var kscript = document.querySelector('script[src*=app]');
    var kkstyle = kscript.getAttribute('kk-style'); 
    
    // Set the link type to and rel attributes
    link.type = "text/css";
    link.rel = "stylesheet";
    var environment = 'productionX';
    

    if (environment  == 'production' && kkstyle == "list") {
      link.href = "https://cdn.jsdelivr.net/gh/quak/koledar2@main/dist/styles-list.css";
      link.href = "https://cdn.jsdelivr.net/gh/quak/koledar2/dist/styles-list.css";
    } 
    if (environment  != 'production' && kkstyle == "list") {
      link.href = "./../dist/styles-list.css";
    }

                                                    
    if (environment  == 'production' && kkstyle == "carousel") {
      link.href = "https://cdn.jsdelivr.net/gh/quak/koledar2@main/dist/styles-carousel.css";
      /*link.href = "https://cdn.jsdelivr.net/gh/quak/koledar2/dist/styles-carousel.css";*/
    } 
    if (environment  != 'production' && kkstyle == "carousel") {
      link.href = "./../dist/styles-carousel.css";
    }

    if (environment  == 'production' && kkstyle == "pro") {
      link.href = "https://cdn.jsdelivr.net/gh/quak/koledar2@main/dist/styles-pro.css";
      link.href = "https://cdn.jsdelivr.net/gh/quak/koledar2/dist/styles-pro.css";
    } 
    if (environment  != 'production' && kkstyle == "pro") {
      link.href = "./../dist/styles-pro.css";
    }
  
    // Append the stylesheet to the <head> of the DOM
    var head = document.head;
    head.appendChild(link);

    
  }
  
  export default injectCSS;;



 