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

    

    
    Alpine.data('eventCal', () => {
        var loadingcycles = 0;
        return {
            // other default properties
            isLoading: false,
            events: null,
            actevent: null,
            listview: true,
            detailview: false,
            showbutton: true,
            opendesc: true,
            opendescmargin: false,
            mobopen: false,
            
            lngorg: false,


            fetchEventList() {
                this.isLoading = true;
                var kscript = document.querySelector('script[src*=app]');
                var limit = kscript.getAttribute('data-amount');  
                var offset = limit *loadingcycles;
                loadingcycles=loadingcycles+1;
                

                fetch('https://koledar.ntoljic.com/v1/events?limit='+limit+'&offset=0')
                .then(res => res.json())
                .then(data => {
                    
                    this.isLoading = false;
                    
                

                    let ev = new Array()

                    data.items.forEach((event,index) => {
                        let actdate = new Date(event.starting_on);
                        let enddate = new Date(event.ending_on);
                        
                        if(enddate!="Invalid Date"){
                            event.enddate = enddate.toLocaleDateString();
                            event.enddate = event.enddate.replaceAll("/", ".");
                        }

                        let daynumber = actdate.getDate();
                        
                        if(daynumber.toString().length==1){
                            daynumber = "0"+daynumber;
                        }
                        event.day = daynumber

                        
                        const months = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];
                        const monthsde = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
                        event.month = months[actdate.getMonth()];
                        event.monthde = monthsde[actdate.getMonth()];
                        
                        if(event.attachments == null){
                            event.attachments = [];
                        };
                        
                        if(event.links == null){
                            event.links = [];
                        };
                        
                        if(event.organizers == null){
                            event.organizers = [];
                        };

                        ev.push(event);

                    });

                    

                    
                    this.events = ev;

                    
                });
            },
            fetchAddEventList() {
                this.isLoading = true;
                var kscript = document.querySelector('script[src*=app]');
                var limit = kscript.getAttribute('data-amount');  
                var offset = limit *loadingcycles;
                loadingcycles=loadingcycles+1;

                fetch('https://koledar.ntoljic.com/v1/events?limit='+limit+'&offset='+offset)
                .then(res => res.json())
                .then(data => {
                    
                    this.isLoading = false;
                    let actdate = new Date(data.starting_on);

                    let ev = new Array()

                    data.items.forEach((event,index) => {
                        let actdate = new Date(event.starting_on);
                        
                        let daynumber = actdate.getDate();
                        
                        if(daynumber.toString().length==1){
                            daynumber = "0"+daynumber;
                        }
                        event.day = daynumber

                        const months = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];
                        const monthsde = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
                        event.month = months[actdate.getMonth()];
                        event.monthde = monthsde[actdate.getMonth()];
                        
                        if(event.attachments == null){
                            event.attachments = [];
                        };
                        
                        if(event.links == null){
                            event.links = [];
                        };
                        
                        if(event.organizers == null){
                            event.organizers = [];
                        };

                        ev.push(event);

                    });

                    

                    
                    (this.events).push(...ev);

                    
                });
            },

            showDetail(ev) {
                this.listview=false;
                this.detailview=true;
                this.actevent = ev;
                this.showbutton = false;
                
            },
            hideDetail() {
                this.actevent = null;
                this.open=false;
                this.listview=true;
                this.detailview=false;
                this.showbutton = true;
                this.opendesc = true;
                this.opendescmargin = false;
                
            },


            showAllText(ev) {
                this.sat=false;
            },

            hastStateSat(ev) {
                return this.sat;
            },
        }
    });

    Alpine.start();

    // #app is a div that we're going to inject our markup into
    document.getElementById("slogkoldearapp").innerHTML = widgetHTML;
    
    

}

export default initAlpine;
