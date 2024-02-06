// initAlpine.js
// Import the Alpine JS framework
import Alpine from 'alpinejs'

// If you abstracted your Alpine component logic, you'd import that here
//import widget from './widget.js'

// import widget template
import widgetHTML from './../widget.html';

///////////////////////
///////////////////////  initAlpine.js continued
///////////////////////

const initAlpine = () => {
  
    /**
     *  If you're abstracting your component logic into a JS file (imported above), 
     * you would register your component with Alpine like this:
     *  Alpine.data('widget', widget); 
     */

    
    Alpine.data('pokeSearch', () => {
        return {
            // other default properties
            isLoading: false,
            events: null,
            fetchPokemon() {
                this.isLoading = true;
                fetch('https://koledar.ntoljic.com/v1/events?limit=20&offset=0')
                .then(res => res.json())
                .then(data => {
                    this.isLoading = false;
                    this.events = data;

                    
                });
            },

            fetchPokemon2() {
                this.isLoading = true;
                fetch('https://koledar.ntoljic.com/v1/events?limit=20&offset=0')
                .then(res => res.json())
                .then(data => {
                    this.isLoading = false;
                    this.events = data;
                });
            }
        }
    });

    Alpine.start();

    // #app is a div that we're going to inject our markup into
    document.getElementById("app").innerHTML = widgetHTML;

}

export default initAlpine;
