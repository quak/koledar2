const injectCSS = () => {
    // Create a <link> element
    var link = document.createElement("link");
  
    // Set the link type to and rel attributes
    link.type = "text/css";
    link.rel = "stylesheet";
    var environment = 'production';
    //if (process.env.NODE_ENV  == 'production') {
    if (environment  == 'production') {
      // A CDN link to your production CSS
      link.href = "https://cdn.jsdelivr.net/gh/quak/koledar2@main/dist/styles-pro.css";
      link.href = "https://cdn.jsdelivr.net/gh/quak/koledar2/dist/styles-pro.css";
    } else {
      // Your local CSS for local development
      link.href = "./../dist/styles-pro.css";
    }
  
    // Append the stylesheet to the <head> of the DOM
    var head = document.head;
    head.appendChild(link);

    
  }
  
  export default injectCSS;