// initAlpine.js
// Import the Alpine JS framework
import Alpine from 'alpinejs'

// If you abstracted your Alpine component logic, you'd import that here
//import widget from './widget.js'

// import widget template
import widgetHTMLpro from './../widget.html';
import widgetHTMLlist from './../widget-list.html';
import widgetHTMLcarousel from './../widget-carousel.html';

///////////////////////
///////////////////////  initAlpine.js continued
///////////////////////

const initAlpine = () => {
  
    /**
     *  If you're abstracting your component logic into a JS file (imported above), 
     * you would register your component with Alpine like this:
     *  Alpine.data('widget', widget); 
     */


    const kapp = document.getElementById("slogkoledarapp");
                                        
    if(!kapp){

        const bdy = document.body
        var appdiv = document.createElement("div");
        appdiv.setAttribute("id", "slogkoledarapp");
        //appdiv.classList.add("sloghideme");
        
        bdy.insertAdjacentElement("afterbegin", appdiv);
    }
    
    Alpine.data('eventCal', () => {
        var loadingcycles = 0;
        return {
            // other default properties
            isLoading: false,
            events: null,
            eventssplitted: null,
            actevent: null,
            listview: true,
            detailview: false,
            showbutton: true,
            opendesc: true,
            opendescmargin: false,
            mobopen: false,
            nxtslides: 0,
            
            lngorg: false,

            locations: false,
            orgas: false,


            fetchEventList() {
                this.isLoading = true;
                kscript = document.querySelector('script[src*=app]');
                var limit = kscript.getAttribute('kk-data-amount');  
                
                var offset = limit *loadingcycles;
                loadingcycles=loadingcycles+1;
                
                if(kscript.getAttribute('kk-style') == "list" && (kscript.getAttribute('kk-chunksize')*2 >= kscript.getAttribute('kk-data-amount'))){
                    limit=kscript.getAttribute('kk-chunksize')*2+1;
                }


                fetch('https://www.koledar.at/v1/locations?includeChildren=true')
                .then(res => res.json())
                .then(data => {
                    this.locations = data.items;

                    fetch('https://www.koledar.at/v1/organizers?offset=0&limit=200')
                    .then(res => res.json())
                    .then(data => {
                        this.organizers = data.items;

                        fetch('https://www.koledar.at/v1/events?limit='+limit+'&offset=0')
                        .then(res => res.json())
                        .then(data => {
                            
                            this.isLoading = false;
                            
                            let ev = new Array();
    
                            data.items.forEach((event,index) => {
                                event.index = index
                                let actdate = new Date(event.starting_on);
                                let enddate = new Date(event.ending_on);
                                
                                if(enddate!="Invalid Date"){
                                    event.enddate = enddate.toLocaleDateString();
                                    event.enddate = event.enddate.replaceAll("/", ".");
                                }
    
                                let enddaynumber = enddate.getDate();
                                if(enddaynumber.toString().length==1){
                                    enddaynumber = "0"+enddaynumber;
                                }
                                event.endday = enddaynumber
    
                                let daynumber = actdate.getDate();
                                
                                if(daynumber.toString().length==1){
                                    daynumber = "0"+daynumber;
                                }
                                event.day = daynumber
    
                                let endyear = enddate.getFullYear();
                                let year = actdate.getFullYear();
                                let ddetail = daynumber+"."+(actdate.getMonth()+1)+"."+year;
                                
                                if(enddaynumber){
                                    ddetail= ddetail +" - "+ enddaynumber+"."+(enddate.getMonth()+1)+"."+endyear
                                }
                                event.datedetail = ddetail;
                                
                                const months = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];
                                const monthsde = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
                                event.month = months[actdate.getMonth()];
                                event.monthde = monthsde[actdate.getMonth()];
    
                                const day = ["Ned","Pon", "Tor", "Sre", "Čet", "Pet", "Sob" ];
                                const dayde = [ "Son","Mon", "Die", "Mit", "Don", "Fre", "Sam"];
                                
                                event.daytext = day[actdate.getDay()];
                                event.daytextde = dayde[actdate.getDay()];
                                
                                event.datedm = actdate.getDate()+"."+(actdate.getMonth()+1)+".";
                            
                                
                                if(event.attachments == null){
                                    event.attachments = [];
                                };
                                
                                if(event.links == null){
                                    event.links = [];
                                };
                                
                                if(event.organizers == null){
                                    event.organizers = [];
                                };
    
                                let gdate = actdate.getFullYear()+actdate.getMonth()+actdate.getDay();
                                
                                var startdategcal;
                                var enddategcal;
                                if(event.starting_at){
                                    startdategcal = actdate.getFullYear()+""+(actdate.getMonth()+1)+""+actdate.getDate()+"T"+(event.starting_at).replace(":","")+"00";
                                }
    
                                if(typeof enddate !== "undefined"){
                                    enddategcal = enddate.getFullYear()+""+(enddate.getMonth()+1)+""+enddate.getDate()+"T"+enddate.getHours()+""+enddate.getMinutes()+"00";
                                }
    
                                if(startdategcal){
                                    if(!enddategcal){
                                        enddategcal="";
                                    }else{
                                        enddategcal = "/"+enddategcal
                                    }
                                    event.gcallink = "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+event.title_sl+"&dates="+startdategcal+enddategcal;
                                }
    
                                event.loc = this.getLocationforSlug(event.location,event.venue);
                                event.orga = this.getOrgas(event.organizers);
                                
                                
                                ev.push(event);
                            });
                            
                        
                            const chunkSize = parseInt(kscript.getAttribute('kk-chunksize'));
                            var chunk = new Array;
                            for (let i = 0; i < ev.length; i += chunkSize) {
                                chunk.push(ev.slice(i, i + chunkSize));
                            }
                            this.eventssplitted = chunk;
                            this.events = ev;
                            console.log(ev);
                            
                        });
                    });

                    
                });

                
            },
            fetchAddEventList() {
                this.isLoading = true;
                var kscript = document.querySelector('script[src*=app]');
                var limit = kscript.getAttribute('kk-data-amount');
                var offset = limit *loadingcycles;
                loadingcycles=loadingcycles+1;


                fetch('https://www.koledar.at/v1/events?limit='+limit+'&offset='+offset)
                .then(res => res.json())
                .then(data => {
                    
                    this.isLoading = false;
                    let actdate = new Date(data.starting_on);

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

                        const day = ["Ned","Pon", "Tor", "Sre", "Čet", "Pet", "Sob" ];
                        const dayde = [ "Son","Mon", "Die", "Mit", "Don", "Fre", "Sam"];
                        event.daytext = day[actdate.getDate()];
                        event.daytextde = dayde[actdate.getDate()];
                        
                        if(event.attachments == null){
                            event.attachments = [];
                        };
                        
                        if(event.links == null){
                            event.links = [];
                        };
                        
                        if(event.organizers == null){
                            event.organizers = [];
                        };

                        event.gcallink = "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+event.title_sl+"&dates="+event.starting_on+" "+event.starting_at;

                        ev.push(event);


                    });

                    
                    (this.events).push(...ev);
                    
                    const chunkSize = parseInt(kscript.getAttribute('kk-chunksize'));
                    var chunk = new Array;
                    for (let i = 0; i < this.events.length; i += chunkSize) {
                        chunk.push(this.events.slice(i, i + chunkSize));
                    }
                    this.eventssplitted = chunk;


                    
                });
            },
            getLocationforSlug(locationslug,venueslug) {
                let ret = false;
                
                this.locations.forEach((locobj,index) => {
                    
                    if(locationslug===locobj.location_key){
                       
                        locobj.venues.forEach((vobj,index) => {
                            if(venueslug===vobj.venue_key){
                                locobj.venuename_de = vobj.name_de;
                                locobj.venuename_sl = vobj.name_sl;
                            }
                        });

                        ret = locobj
                    }
                });
                
                return ret;
            },
            getOrgas(orgs) {
               
                let ret = new Array();
                orgs.forEach((orgaslug,i)=>{
                    this.organizers.forEach((orga,index) => {
                        console.log()
                        if(orgaslug===orga.organizer_key){
                            ret.push(orga);
                        }
                    });
                });
                console.log(ret);
                
                return ret;
            },
            showDialog(ev) {
                
                const dialog = document.getElementById("kkdialog"+ev);
                dialog.showModal();
            },
            hideDialog(ev) {
                console.log(ev);
                const dialog = document.getElementById("kkdialog"+ev);
                dialog.close();
                
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
            handleScroll(theEl){
               
                let sk = document.getElementById("slogkoldear");
              
                if (Math.abs(sk.scrollHeight - sk.clientHeight - sk.scrollTop) < 300) {
                    this.fetchAddEventList();
                }
                
            },


            showAllText(ev) {
                this.sat=false;
            },

            hastStateSat(ev) {
                return this.sat;
            },
            

            showNext() {
                const slide = document.querySelector(".slide");
                const slidesContainer = document.getElementById("slides-container");
                
                const slideWidth = slide.clientWidth;
                slidesContainer.scrollLeft += slideWidth;

                if((kscript.getAttribute('kk-style') != "list") && (slidesContainer.clientWidth - 300 < slidesContainer.scrollLeft)){
                    this.fetchAddEventList();
                }
                
                this.nxtslides++;
                if(kscript.getAttribute('kk-style') == "list"){
                    if((this.events.length - (this.nxtslides*parseInt(kscript.getAttribute('kk-chunksize'))))<parseInt(kscript.getAttribute('kk-chunksize'))+2){
                        this.fetchAddEventList();
                    };
                }
            },

            showPrev() {
                const slide = document.querySelector(".slide");
                const slidesContainer = document.getElementById("slides-container");

                const slideWidth = slide.clientWidth;
                slidesContainer.scrollLeft -= slideWidth;
            },


        }
    });

    Alpine.start();

    var kscript = document.querySelector('script[src*=app]');
    var kkstyle = kscript.getAttribute('kk-style');  

    // #app is a div that we're going to inject our markup into
    if(kkstyle=="list"){
        document.getElementById("slogkoledarapp").innerHTML = widgetHTMLlist;
    }else if(kkstyle=="carousel"){
        document.getElementById("slogkoledarapp").innerHTML = widgetHTMLcarousel;


    }else{
        document.getElementById("slogkoledarapp").innerHTML = widgetHTMLpro;
    }
    
    
    
    

}

export default initAlpine;
