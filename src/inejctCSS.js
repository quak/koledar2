const injectCSS = () => {
    // Create a <link> element
    var link = document.createElement("link");
  
    // Set the link type to and rel attributes
    link.type = "text/css";
    link.rel = "stylesheet";
    
    if (process.env.NODE_ENV  == 'production') {
      // A CDN link to your production CSS
      link.href = "https://cdn.jsdelivr.net/gh/joseph-farruggio/js-widget@1.0/dist/styles.css";
    } else {
      // Your local CSS for local development
      link.href = "./../dist/styles.css";
    }
  
    // Append the stylesheet to the <head> of the DOM
    var head = document.head;
    head.appendChild(link);
  }
  
  export default injectCSS;