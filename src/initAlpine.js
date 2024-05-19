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

        //const bdy = document.body
        //var appdiv = document.createElement("div");
        //appdiv.setAttribute("id", "slogkoledarapp");
        
        //bdy.insertAdjacentElement("afterbegin", appdiv);
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
             kkcategories:false,


            // EVENT DATA SL & AT(DE) 
            /*
             *  we need two different dataset because of the not necessarilly existing translation
             *  there for we cannot gurantee that the same events are shown on the language switch
             *  therefor we need to scroll the sliderjs to the first slide on langswitch 
             */
                       
            events: null,   // we get all Events but then split it here because it is like it is
            eventssl: null,
            eventsat: null,


            async getAllCategories() {
                let response = await fetch('https://admin.koledar.at/v1/categories?includeChildren=true')
                return await response.json();
            },


            async getAllLocations() {
                let response = await fetch('https://admin.koledar.at/v1/locations?includeChildren=true')
                return await response.json();
            },
            async getAllOrganizers() {
                let response = await fetch('https://admin.koledar.at/v1/organizers?offset=0&limit=200')
                return await response.json();
            },
            async getEvents(limit,datestr,kkcat) {

                let catquery="";
                if(kkcat!="" && kkcat != null){
                    catquery="&subcategories="+kkcat;
                }
                let response = await fetch('https://admin.koledar.at/v1/events?limit='+limit+'&offset=0&from='+datestr+catquery)

                return await response.json();
            },

            async fetchEventList() {

                let actdateforq = new Date();
                let qday = (actdateforq.getDate()).toString();
                let qmonth = (actdateforq.getMonth()+1).toString();;
                let qyear = actdateforq.getFullYear();
                if(qday.length==1){
                    qday = "0"+qday;
                }
                
                if(qmonth.length==1){
                    qmonth = "0"+qmonth;
                }
                let datestr = qyear + "-" + qmonth + "-"+ qday;
           
                
                
                kscript = document.querySelector('script[src*=app]');
                var limit = kscript.getAttribute('kk-data-amount');  
                var kkcat = kscript.getAttribute('kk-cat');  


                
                
                this.loadColors();
                
                loadingcycles=loadingcycles+1;
                
                if(kscript.getAttribute('kk-style') == "list" && (kscript.getAttribute('kk-chunksize')*2 >= kscript.getAttribute('kk-data-amount'))){
                    limit=kscript.getAttribute('kk-chunksize')*2+1;
                }

                
                this.kklocations  = (await this.getAllLocations()).items;
                this.kkcategories  = (await this.getAllCategories()).items;
                this.kkorganizers = (await this.getAllOrganizers()).items;
                this.kkevents     = (await this.getEvents(limit,datestr,kkcat)).items;
             
                
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
                    event.cat = this.getCat(event.subcategory);
                    

                    if(event.title_sl!=""){
                        evsl.push(event);
                    }
                    if(event.title_de!=""){
                        evat.push(event);
                    }

                   
                    
                });
                
             
                if(kscript.getAttribute('kk-style')=="list"){
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
                }else{
                    this.eventssl = evsl;
                    this.eventsat = evat;
                }
                console.log(this.eventssl);
                console.log(this.eventsat);
                
           
                
            },
            fetchAddEventList() {


                let actdateforq = new Date();
                let qday = (actdateforq.getDate()).toString();
                let qmonth = (actdateforq.getMonth()+1).toString();;
                let qyear = actdateforq.getFullYear();
                if(qday.length==1){
                    qday = "0"+qday;
                }
                
                if(qmonth.length==1){
                    qmonth = "0"+qmonth;
                }
                let datestr = qyear + "-" + qmonth + "-"+ qday;
                
                this.isLoading = true;
                var kscript = document.querySelector('script[src*=app]');
                var limit = kscript.getAttribute('kk-data-amount');
                var offset = limit *loadingcycles;
                loadingcycles=loadingcycles+1;


                let evsl = new Array();
                let evat = new Array();

                fetch('https://admin.koledar.at/v1/events?limit='+limit+'&offset='+offset+'&from='+datestr)
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
                    
                    if(kscript.getAttribute('kk-style')=="list"){
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
                    }
                    else{
                        this.eventssl.push(...evsl); 
                        this.eventsat.push(...evat); 
                    }
                    
                   


                    
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

                orgs.forEach((orgaslug,i)=>{
                    this.kkorganizers.forEach((orga,index) => {
                       
                        if(orgaslug===orga.organizer_key){
                            ret.push(orga);
                        }
                    });
                });
                
                return ret;
            },
            getCat(cat) {
               
                let ret = false;
             
                this.kkcategories.forEach((mastercat,i)=>{
                    mastercat.subcategories.forEach((subcat,index) => {

                        if(cat===subcat.subcategory_key){
                            ret = subcat;
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

            loadColors() {

                var kkcolorschema = kscript.getAttribute('kkc-schema');  

                var kklangcolor = "";

                var kkcolorbg = "";
                var kkcolorbgdate = "";
                var kkcolordatetext = "";
                var kkcolorplacetext = "";
                var kkcolortitletext = "";
                var kkcicon = "";

                var kkcddatetext = "";
                var kkcdtitletext = "";
                var kkcdinfotext = "";
                var kkcdinfoicon = "";
                var kkcdbacktext = "";
                var kkcdbgcattext = "";
                var kkcdcattext = "";
                var kkcdcatdesctext = "";
                var kkcdbgcal= "";
                var kkcdcaltext = "";
                var kkcdbg= "";
                var kkcdtext = "";

                var kkcddldesc = "";
                var kkcddlbg= "";
                var kkcddltext = "";



                if(kkcolorschema=="dark"){
                    
                    kklangcolor ="#000";

                    kkcolorbg = "#272727";
                    kkcolorbgdate = "#B0C2A7";
                    kkcolordatetext = "#fff";
                    kkcolorplacetext = "#ece0c6";
                    kkcolortitletext = "#fff";
                    kkcicon = "#1a7a91";

                    kkcddatetext = "#96264C";
                    kkcdtitletext = "000";
                    kkcdinfotext = "#E8A273";
                    kkcdinfoicon = "#000";
                    kkcdbacktext = "#cbcbcb";

                    kkcdbgcattext = "#B0C2A7";
                    kkcdcattext = "#fff";
                    kkcdcatdesctext = "#007A91";

                    kkcdbgcal= "#F0DCCD";
                    kkcdcaltext = "#000";

                    kkcdbg= "#fff";
                    kkcdtext = "#000";

                    kkcddldesc= "#007A91";
                    kkcddlbg= "#b0c2a7";
                    kkcddltext = "#000";
                }else{

                    kklangcolor ="#000";

                    kkcolorbg = "#fff";
                    kkcolorbgdate = "#B0C2A7";
                    kkcolordatetext = "#fff";
                    kkcolorplacetext = "#952a5a";
                    kkcolortitletext = "#000";
                    kkcicon = "#1a7a91";

                    kkcddatetext = "#96264C";
                    kkcdtitletext = "000";
                    kkcdinfotext = "#E8A273";
                    kkcdinfoicon = "#000";
                    kkcdbacktext = "#cbcbcb";

                    kkcdbgcattext = "#B0C2A7";
                    kkcdcattext = "#fff";
                    kkcdcatdesctext = "#007A91";

                    kkcdbgcal= "#F0DCCD";
                    kkcdcaltext = "#000";

                    kkcdbg= "#fff";
                    kkcdtext = "#000";

                    kkcddldesc= "#007A91";
                    kkcddlbg= "#b0c2a7";
                    kkcddltext = "#000";
                }


                var kklangcolor_overwrite = kscript.getAttribute('kkc-lang');
                if(kklangcolor_overwrite != null){
                    kklangcolor = kklangcolor_overwrite;
                }
                document.documentElement.style.setProperty('--kkclang', kklangcolor); 

                /***COLORS OVERVIEW Start */
                var kkcolorbg_overwrite = kscript.getAttribute('kkc-bg');
                if(kkcolorbg_overwrite != null){
                    kkcolorbg = kkcolorbg_overwrite;
                }
                document.documentElement.style.setProperty('--kkcolorbg', kkcolorbg);  

                var kkcolorbgdate_overwrite = kscript.getAttribute('kkc-bgdate');
                if(kkcolorbgdate_overwrite != null){
                    kkcolorbgdate = kkcolorbgdate_overwrite;
                }
                document.documentElement.style.setProperty('--kkcolorbgdate', kkcolorbgdate); 

                var kkcolordatetext_overwrite = kscript.getAttribute('kkc-datetext');
                if(kkcolordatetext_overwrite != null){
                    kkcolordatetext = kkcolordatetext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcolordatetext', kkcolordatetext); 

                var kkcolorplacetext_overwrite = kscript.getAttribute('kkc-placetext');
                if(kkcolorplacetext_overwrite != null){
                    kkcolorplacetext = kkcolorplacetext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcolorplacetext', kkcolorplacetext); 

                var kkcolortitletext_overwrite = kscript.getAttribute('kkc-titletext');
                if(kkcolortitletext_overwrite != null){
                    kkcolortitletext = kkcolortitletext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcolortitletext', kkcolortitletext); 

                var kkcicon_overwrite = kscript.getAttribute('kkc-icon');
                if(kkcicon_overwrite != null){
                    kkcicon = kkcicon_overwrite;
                }
                document.documentElement.style.setProperty('--kkcicon', kkcicon); 

                /***COLORS OVERVIEW END */

                /***COLORS DIALOG START */
                var kkcddatetext_overwrite = kscript.getAttribute('kkcd-datetext');
                if(kkcddatetext_overwrite != null){
                    kkcddatetext = kkcddatetext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcddatetext', kkcddatetext);  
                
                var kkcdtitletext_overwrite = kscript.getAttribute('kkcd-titletext');
                if(kkcdtitletext_overwrite != null){
                    kkcdtitletext = kkcdtitletext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcdtitletext', kkcdtitletext);  

                var kkcdinfotext_overwrite = kscript.getAttribute('kkcd-infotext');
                if(kkcdinfotext_overwrite != null){
                    kkcdinfotext = kkcdinfotext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcdinfotext', kkcdinfotext);  

                var kkcdinfoicon_overwrite = kscript.getAttribute('kkcd-infoicon');
                if(kkcdinfoicon_overwrite != null){ 
                    kkcdinfoicon = kkcdinfoicon_overwrite;
                }
                document.documentElement.style.setProperty('--kkcdinfoicon', kkcdinfoicon);

                var kkcdbacktext_overwrite = kscript.getAttribute('kkcd-backtext');
                if(kkcdbacktext_overwrite != null){
                    kkcdbacktext = kkcdbacktext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcdbacktext', kkcdbacktext); 
                
                var kkcdbgcat_overwrite = kscript.getAttribute('kkcd-bgcat');
                if(kkcdbgcat_overwrite != null){
                    kkcdbgcattext = kkcdbgcat_overwrite;
                }
                document.documentElement.style.setProperty('--kkcdbgcattext', kkcdbgcattext);  

                var kkcdcattext_overwrite = kscript.getAttribute('kkcd-cattext');
                if(kkcdcattext_overwrite != null){
                    kkcdcattext = kkcdcattext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcdcattext', kkcdcattext); 

                var kkcdcatdesctext_overwrite = kscript.getAttribute('kkcd-catdesctext');
                if(kkcdcatdesctext_overwrite != null){
                    kkcdcatdesctext = kkcdcatdesctext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcdcatdesctext', kkcdcatdesctext); 

                var kkcdbgcal_overwrite = kscript.getAttribute('kkcd-bgcal');
                if(kkcdbgcal_overwrite != null){
                    kkcdbgcal = kkcdbgcal_overwrite;
                }
                document.documentElement.style.setProperty('--kkcdbgcal', kkcdbgcal); 

                var kkcdcaltext_overwrite = kscript.getAttribute('kkcd-caltext');
                if(kkcdcaltext_overwrite != null){
                    kkcdcaltext = kkcdcaltext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcdcaltext', kkcdcaltext); 

               

                var kkcdbg_overwrite = kscript.getAttribute('kkcd-bg');
                if(kkcdbg_overwrite != null){
                    kkcdbg = kkcdbg_overwrite;
                }
                document.documentElement.style.setProperty('--kkcdbg', kkcdbg); 
                

                var kkcdtext_overwrite = kscript.getAttribute('kkcd-text');
                if(kkcdtext_overwrite != null){
                    kkcdtext = kkcdtext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcdtext', kkcdtext); 
                /***** */

                var kkcddldesc_overwrite = kscript.getAttribute('kkcd-dldesc');
                if(kkcddldesc_overwrite != null){
                    kkcddldesc = kkcddldesc_overwrite;
                }
                document.documentElement.style.setProperty('--kkcddldesc', kkcddldesc); 

                var kkcdtdlbg_overwrite = kscript.getAttribute('kkcd-dlbg');
                if(kkcdtdlbg_overwrite != null){
                    kkcddlbg = kkcdtdlbg_overwrite;
                }
                document.documentElement.style.setProperty('--kkcddlbg', kkcddlbg); 

                var kkcddltext_overwrite = kscript.getAttribute('kkcd-dltext');
                if(kkcddltext_overwrite != null){
                    kkcddltext = kkcddltext_overwrite;
                }
                document.documentElement.style.setProperty('--kkcddltext', kkcddltext); 
                /***COLORS DIALOG END */
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
