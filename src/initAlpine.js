// initAlpine.js
// Import the Alpine JS framework
import Alpine from 'alpinejs'

// import widget template
import widgetHTMLpro from './../widget.html';
import widgetHTMLlist from './../widget-list.html';
import widgetHTMLcarousel from './../widget-carousel.html';

///////////////////////
///////////////////////  initAlpine.js continued
///////////////////////

const initAlpine = () => {
  
    const kapp = document.getElementById("slogkoledarapp");
                                        
    if(!kapp){

        const bdy = document.body
        var appdiv = document.createElement("div");
        appdiv.setAttribute("id", "slogkoledarapp");
        
        bdy.insertAdjacentElement("afterbegin", appdiv);
    }
    
    Alpine.data('eventCal', () => {
        var loadingcycles = 0;
       
        return {
            // other default properties
            isLoading: true,
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

             kklocations: false,
             kkevents: false,
             kkorganizers: false,


            // EVENT DATA SL & AT(DE) 
            /*
             *  we need two different dataset because of the not necessarilly existing translation
             *  there for we cannot gurantee that the same events are shown on the language switch
             *  therefor we need to scroll the sliderjs to the first slide on langswitch 
             */
                       
            events: null,   // we get all Events but then split it here because it is like it is
            eventssl: null,
            eventsat: null,

            async getAllLocations() {
                let response = await fetch('https://www.koledar.at/v1/locations?includeChildren=true')
                return await response.json();
            },
            async getAllOrganizers() {
                let response = await fetch('https://www.koledar.at/v1/organizers?offset=0&limit=200')
                return await response.json();
            },
            async getEvents(limit) {
                let response = await fetch('https://www.koledar.at/v1/events?limit='+limit+'&offset=0')
                return await response.json();
            },

            async fetchEventList() {
                
                
                kscript = document.querySelector('script[src*=app]');
                var limit = kscript.getAttribute('kk-data-amount');  
                
                loadingcycles=loadingcycles+1;
                
                if(kscript.getAttribute('kk-style') == "list" && (kscript.getAttribute('kk-chunksize')*2 >= kscript.getAttribute('kk-data-amount'))){
                    limit=kscript.getAttribute('kk-chunksize')*2+1;
                }

                
                this.kklocations  = (await this.getAllLocations()).items;
                this.kkorganizers = (await this.getAllOrganizers()).items;
                this.kkevents     = (await this.getEvents(limit)).items;
             
                
                this.isLoading = false;
                        
                let evsl = new Array();
                let evat = new Array();
                
                this.kkevents.forEach((event,index) => {
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
                    

                    if(event.title_sl!=""){
                        evsl.push(event);
                    }
                    if(event.title_de!=""){
                        evat.push(event);

                        if(event.day == 24){
                            
                        }
                    }

                    if(event.day == 24){
                    }
                    
                });
                
            
                const chunkSize = parseInt(kscript.getAttribute('kk-chunksize'));
                var chunksl = new Array;
                var chunkat = new Array;
                for (let i = 0; i < evsl.length; i += chunkSize) {
                    chunksl.push(evsl.slice(i, i + chunkSize));
                }
                for (let j = 0; j < evat.length; j += chunkSize) {
                    chunkat.push(evat.slice(j, j + chunkSize));
                }
               
                this.eventssl = chunksl;
                this.eventsat = chunkat;
                    console.log(chunkat);
           
                
            },
            fetchAddEventList() {
                console.log("reloadstuff")
                this.isLoading = true;
                var kscript = document.querySelector('script[src*=app]');
                var limit = kscript.getAttribute('kk-data-amount');
                var offset = limit *loadingcycles;
                loadingcycles=loadingcycles+1;


                let evsl = new Array();
                let evat = new Array();

                fetch('https://www.koledar.at/v1/events?limit='+limit+'&offset='+offset)
                .then(res => res.json())
                .then(data => {
                    
                    this.isLoading = false;
                    let actdate = new Date(data.starting_on);

                    let ev = new Array()

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
                    

                    if(event.title_sl!=""){
                        evsl.push(event);
                    }
                    if(event.title_de!=""){
                        evat.push(event);

                        if(event.day == 24){
                            
                        }
                    }

                    if(event.day == 24){
                    }


                    });

                    
                    (this.kkevents).push(...ev);
                    
                    const chunkSize = parseInt(kscript.getAttribute('kk-chunksize'));
                    var chunksl = new Array;
                    var chunkat = new Array;
                    for (let i = 0; i < evsl.length; i += chunkSize) {
                        chunksl.push(evsl.slice(i, i + chunkSize));
                    }
                    for (let j = 0; j < evat.length; j += chunkSize) {
                        chunkat.push(evat.slice(j, j + chunkSize));
                    }
                   
                    this.eventssl.push(...chunksl); 
                    this.eventsat.push(...chunkat); 


                    
                });
            },
            getLocationforSlug(locationslug,venueslug) {
                let ret = false;
               
                 
                this.kklocations.forEach((locobj,index) => {
                    
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
             
                this.kkorganizers.forEach((orgaslug,i)=>{
                    this.kkorganizers.forEach((orga,index) => {
                       
                        if(orgaslug===orga.organizer_key){
                            ret.push(orga);
                        }
                    });
                });
                
                return ret;
            },
            showDialog(ev) {
                
                const dialog = document.getElementById("kkdialog"+ev);
                
                
                dialog.showModal();
                
                dialog.scrollTop=0;
            },
            hideDialog(ev) {
                const dialog = document.getElementById("kkdialog"+ev);
                dialog.close();
                
            },

            showDialogat(ev) {
                
                const dialog = document.getElementById("kkdialogat"+ev);
                
                
                dialog.showModal();
                
                dialog.scrollTop=0;
            },
            hideDialogat(ev) {
                const dialog = document.getElementById("kkdialogat"+ev);
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
                    if((this.kkevents.length - (this.nxtslides*parseInt(kscript.getAttribute('kk-chunksize'))))<parseInt(kscript.getAttribute('kk-chunksize'))+2){
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


            showNextat() {
                const slide = document.querySelector(".slideat");
                const slidesContainer = document.getElementById("slides-containerat");
                
                const slideWidth = slide.clientWidth;
                slidesContainer.scrollLeft += slideWidth;

                if((kscript.getAttribute('kk-style') != "list") && (slidesContainer.clientWidth - 300 < slidesContainer.scrollLeft)){
                    this.fetchAddEventList();
                }
                
                this.nxtslides++;
                if(kscript.getAttribute('kk-style') == "list"){
                    if((this.kkevents.length - (this.nxtslides*parseInt(kscript.getAttribute('kk-chunksize'))))<parseInt(kscript.getAttribute('kk-chunksize'))+2){
                        this.fetchAddEventList();
                    };
                }
            },

            showPrevat() {
                const slide = document.querySelector(".slideat");
                const slidesContainer = document.getElementById("slides-containerat");

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
