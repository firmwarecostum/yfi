dojo.provide('chilli.Ui');
dojo.require('chilli.Json');
dojo.require('chilli.Format');

dojo.require('chilli.QElements');
dojo.require('chilli.Translator');
dojo.require('chilli.Settings')
dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.ProgressBar');
dojo.require('dijit.form.Form');

if(!dojo._hasResource["chilli.Ui"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
(function(){

    //Some 'global' variables (Module wide)
    var cu          = chilli.Ui;
    var divContent  = dojo.byId('CoovaFeedback');

    cu.lang         = chilli.Settings.lang
    var lang        = cu.lang;
    var tr          = chilli.Translator;
    var urlLanguages= chilli.Settings.languages;
    var pbTime;                 //Progressbar Time
    var pbData;                 //Progressbar Data
    var divTime;                //Feedback div for Time
    var divData;                //Feedback div for Data
    var pop_up      = true;     //Default pop-up


    //___ Wait screen ___
    cu.wait         = function(wait_string){
         _clearContent();
        console.log("Please wait");
        (wait_string ==undefined)&&(wait_string = "<br><b>"+tr.tr({'module': 'Chilli','phrase':'Working - Please wait','lang':lang})+"</b>");
        var divWait         = document.createElement("div");
            var imgLogo     = new Image();
            imgLogo.src     = "img/logo.jpg";
        dojo.place(imgLogo,divWait);
            var imgBusy     = new Image();
            imgBusy.src     = "img/loading/busy.gif";
        dojo.place(imgBusy,divWait);
            var spanNhs     = document.createElement('span');
            spanNhs.innerHTML = "<br><b>"+wait_string+"</b>";
        dojo.place(spanNhs,divWait);
        dojo.place(divWait,divContent);
    }

    //___ Error screen ___
    cu.error        = function(error){
        _clearContent();
        var divError          = document.createElement("div");
            var imgError      = new Image();
            imgError.src      = "img/uam_json/error.png";
        dojo.place(imgError,divError);
            var spanError     = document.createElement('span');
            spanError.innerHTML = "<b>  "+error.dojoType+": </b>"+error.message;
        dojo.place(spanError,divError);
        dojo.place(divError,divContent);
    }

    //___ Not a hotspot ___
    cu.notHotspot   = function(){
        _clearContent();
        console.log("Not a Hotspot Screen");
        var divNhs          = document.createElement("div");
            var imgNhs      = new Image();
            imgNhs.src      = "img/uam_json/not_hotspot.png";
        dojo.place(imgNhs,divNhs);
            var spanNhs     = document.createElement('span');
            spanNhs.innerHTML = "<b>"+tr.tr({'module': 'Chilli','phrase':'Not a Hotspot','lang':lang})+"</b>";
        dojo.place(spanNhs,divNhs);
        dojo.place(divNhs,divContent);
    }

    //___ Login screen ___
    cu.logIn           = function(response){
        _clearContent();
        console.log("New Login screen");

        var frmLogin    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            var divLogInFeedback = document.createElement("div");
	        divLogInFeedback.id  = 'componentLoginLightFeedback';
	        (response.message)&&(divLogInFeedback.innerHTML = response.message);
            dojo.place(divLogInFeedback,frmLogin.domNode);
            chilli.QElements.addPair({label:"Username",divToAdd:  frmLogin.domNode,inpName:'Username',inpRequired:true, isLast:false, id:'componentLoginLightUsername',focus:true});
            chilli.QElements.addPair({label:"Password",divToAdd:  frmLogin.domNode,inpName:'Password',inpRequired:true, isLast:false, pw:true});
            if(window.name == ''){ //Only show option if not in a pop-up 
            chilli.QElements.addComboBox({ label:"Language",url:urlLanguages+lang, divToAdd: frmLogin.domNode,inpName:'language',inpRequired:true, isLast:false, searchAttr:'name',value: lang, id :'componentLoginLightLanguage'});
                chilli.QElements.addCheckPair({label:'Feedback in pop-up', divToAdd: frmLogin.domNode,inpName:'pop_up', inpRequired:true,checked: 'checked',value: 'on',isLast: true,id:'chilliPopUp'});
                dojo.connect(dijit.byId('chilliPopUp'),'onChange', function(new_val){
                    pop_up = new_val;
                });
            }else{
                chilli.QElements.addComboBox({ label:"Language",url:urlLanguages+lang, divToAdd: frmLogin.domNode,inpName:'language',inpRequired:true, isLast:true,searchAttr:'name',value: lang, id :'componentLoginLightLanguage'});

            }
            var btnOk = new dijit.form.Button({style:"margin:10px; margin-left:1px;",label:"Connect",iconClass:"connectIcon"},document.createElement("div"));
            dojo.connect(btnOk,"onClick",function(e){
		        if(frmLogin.validate()){        //Validate the form
                 	var frmObj = dojo.formToObject(frmLogin.domNode);                       //Convert the Form to an object
                    chilli.Json.logIn(frmObj.Username,frmObj.Password,response.challenge); //Try and log the user in
 		        }
            });

        dojo.place(btnOk.domNode,frmLogin.domNode);
        dojo.place(frmLogin.domNode,divContent);

        //Catch the Enter key
        dojo.connect(divContent, 'onkeypress', function(evt) {
            key = evt.keyCode;
            if (key == dojo.keys.ENTER){
                if(frmLogin.validate()){
                    var frmObj = dojo.formToObject(frmLogin.domNode);                       //Convert the Form to an object
                    chilli.Json.logIn(frmObj.Username,frmObj.Password,response.challenge); //Try and log the user in
                }
            }
        });


        //---Language-----
        dijit.byId('componentLoginLightLanguage').attr('intermediateChanges',true);
        dojo.connect(dijit.byId('componentLoginLightLanguage'),'onChange',
            function(newValue){
                lang = newValue;    //Change the language setting
                cu.lang = newValue;
                var list = dojo.query('label',divContent).forEach(function(l){       //Query and Change the labels
                    console.log(l.innerHTML);
                    l.innerHTML = tr.tr({'module': 'Chilli','phrase':l.en,'lang':lang});
                });
                btnOk.attr('label',tr.tr({'module': 'Chilli','phrase':btnOk.en,'lang':lang}));
                var store           = new dojo.data.ItemFileReadStore({url:urlLanguages+lang});
                dijit.byId('componentLoginLightLanguage').attr('store',store);  //Change tha language of the dropdown
                dijit.byId('componentLoginLightLanguage').attr('value',lang);  //Change tha language of the dropdown
            });

        //-----------------------------------------------------------------------------------
        //--We have to set an attribute on the labels in order to know their english phrase--
        //--We then translate them to the selected language----------------------------------
        //-----------------------------------------------------------------------------------
        var list = dojo.query('label',divContent).forEach(function(l){       //Query and Change the labels
            l.en = l.innerHTML;
            l.innerHTML = tr.tr({'module': 'Chilli','phrase':l.en,'lang':lang});
        });
        btnOk.attr('en','Connect');
        btnOk.attr('label',     tr.tr({'module': 'Chilli','phrase':btnOk.en,'lang':lang}));
        //---------------------------------------------------------------------------------
        //---END Language-----
        dijit.byId('componentLoginLightUsername').focus();
    }

    //___ Status screen ___
    cu.new_status           = function(response){
        _clearContent();
        console.log("New Status screen");
	console.log(response.redir.originalURL);
	if((window.name == '')&(pop_up == true)){
		window.open(location.href+'&lang='+lang,'YFi_Hotspot','width=450,height=350,status=no,resizable=yes,location=no'); //Open a pop-up
		if(response.redir.redirectionURL == ''){
			window.location = chilli.Settings.url_default;  //The originalURL can be problematic / rather use a default value
		}else{
			window.location = response.redir.redirectionURL;    //If redirection is specifies use that instead of the default
		}
		return; 
	}else{
		var loc = document.location;
		l	= loc.search.replace(/.+&lang=/,'');
		if(l != ''){
                        cu.lang = l;
			lang = l;
		}
	}	


        var tcWorkarea      = new dijit.layout.TabContainer({
                tabPosition: "top",
                style : "width:100%;height:100%; background-color: #cbd5cb;"
        },document.createElement("div"));

            var usage = new dijit.layout.ContentPane({ title:tr.tr({'module': 'Chilli','phrase':'Usage','lang':lang}),iconClass:'usageTab'});
            tcWorkarea.addChild(usage);
            var stats = new dijit.layout.ContentPane({ title:tr.tr({'module': 'Chilli','phrase':'Stats','lang':lang}),iconClass:'statsTab'});
            tcWorkarea.addChild(stats);
            //----------
                pbTime = new  dijit.ProgressBar({'progress':'0%','style':'width:380px;font-size:18px;'},document.createElement("div"));
                var h1 = document.createElement("h2");
                h1.innerHTML = tr.tr({'module': 'Chilli','phrase':'Time Used','lang':lang});
                dojo.place(h1,usage.domNode);
                divTime = document.createElement("div");
                dojo.place(divTime,usage.domNode)
                dojo.place(pbTime.domNode,usage.domNode);

                pbData = new  dijit.ProgressBar({'progress':'0%','style':'width:380px;font-size:18px;'},document.createElement("div"));
                var h2 = document.createElement("h2");
                h2.innerHTML = tr.tr({'module': 'Chilli','phrase':'Data Used','lang':lang});
                dojo.place(h2,usage.domNode);
                divData = document.createElement("div");
                dojo.place(divData,usage.domNode)
                dojo.place(pbData.domNode,usage.domNode);

                var btnDisconnect = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'Chilli','phrase':'Disconnect','lang':lang}),iconClass:"disconnectIcon"},document.createElement("div"));
                dojo.place(btnDisconnect.domNode,usage.domNode);
                dojo.connect(btnDisconnect,"onClick",function(e){
			        chilli.Ui.disconnect();
                });

                //'prime' the status tab
		        stats.domNode.innerHTML = _returnStatusString(response);
                //Shall we 'prime' our usage here by calling a JSON function which will call cu.refreshUsage on success? I think so
                chilli.Json.getUsage();

                dojo.query(".dijitProgressBarTile", pbTime.domNode).addClass("green");  //Start off green
                dojo.query(".dijitProgressBarTile", pbData.domNode).addClass("green");
            //------------
        dojo.place(tcWorkarea.domNode,divContent);

        tcWorkarea.startup();
        tcWorkarea.layout();
    }

    cu.refreshUsage = function(summary){

        if(summary.type == 'voucher'){
                //Time
		if(summary.time_avail == 'NA'){
                	divTime.innerHTML = '<b>'+tr.tr({'module': 'Chilli','phrase':'Used','lang':lang})+' </b>'+chilli.Format.time(summary.time_used);
                	dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("green");
			pbTime.update({"indeterminate":true});
		}else{
			var time_total     = summary.time_used + summary.time_avail;
			var pers_time_used = (summary.time_used / time_total) * 100;
                        if((pers_time_used > chilli.Settings.orange)&(pers_time_used < chilli.Settings.red)){
                            dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("green");
                            dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("red");
                            dojo.query(".dijitProgressBarTile", pbTime.domNode).addClass("orange");
                          };
                       if(pers_time_used > chilli.Settings.red){
                           dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("green");
                           dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("orange");
                           dojo.query(".dijitProgressBarTile", pbTime.domNode).addClass("red");
                       };
                      if(pers_time_used < chilli.Settings.orange){
                           dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("red");
                           dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("orange");
                           dojo.query(".dijitProgressBarTile", pbTime.domNode).addClass("green");
                      };
			        pbTime.update({'progress':pers_time_used+'%'});
            		divTime.innerHTML = '<b>'+tr.tr({'module': 'Chilli','phrase':'Used','lang':lang})+' </b>'+chilli.Format.time(summary.time_used)+'<b> '+tr.tr({'module': 'Chilli','phrase':'Available','lang':lang})+' </b>'+chilli.Format.time(summary.time_avail);
		}

                //Data
		if(summary.data_avail == 'NA'){
                	divData.innerHTML = '<b>'+tr.tr({'module': 'Chilli','phrase':'Used','lang':lang})+' </b>'+chilli.Format.bytes(summary.data_used);
                	dojo.query(".dijitProgressBarTile", pbData.domNode).removeClass("green");
			pbData.update({"indeterminate":true});
		}else{
			var data_total     = summary.data_used + summary.data_avail;
			var pers_data_used = (summary.data_used / data_total) * 100;
                        if((pers_time_used > chilli.Settings.orange)&(pers_time_used < chilli.Settings.red)){
                            dojo.query(".dijitProgressBarTile", pbData.domNode).removeClass("green");
                            dojo.query(".dijitProgressBarTile", pbData.domNode).removeClass("red");
                            dojo.query(".dijitProgressBarTile", pbData.domNode).addClass("orange");
                          };
                       if(pers_time_used > chilli.Settings.red){
                           dojo.query(".dijitProgressBarTile", pbData.domNode).removeClass("green");
                           dojo.query(".dijitProgressBarTile", pbData.domNode).removeClass("orange");
                           dojo.query(".dijitProgressBarTile", pbData.domNode).addClass("red");
                       };
			            pbData.update({'progress':pers_data_used+'%'});
                        divData.innerHTML = '<b>'+tr.tr({'module': 'Chilli','phrase':'Used','lang':lang})+' </b>'+chilli.Format.bytes(summary.data_used)+'<b> '+tr.tr({'module': 'Chilli','phrase':'Available','lang':lang})+' </b>'+chilli.Format.bytes(summary.data_avail);
		}
        }

	if(summary.type == 'permananet'){

                //Time
		if(summary.time_avail == 'NA'){
                	divTime.innerHTML = '<b>'+tr.tr({'module': 'Chilli','phrase':'Used','lang':lang})+' </b>'+chilli.Format.time(summary.time_used);
                	dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("green");
			pbTime.update({"indeterminate":true});
		}else{
			var time_total     = summary.time_used + summary.time_avail;
			var pers_time_used = (summary.time_used / time_total) * 100;
                        if((pers_time_used > chilli.Settings.orange)&(pers_time_used < chilli.Settings.red)){
                            dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("green");
                            dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("red");
                            dojo.query(".dijitProgressBarTile", pbTime.domNode).addClass("orange");
                          };
                       if(pers_time_used > chilli.Settings.red){
                           dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("green");
                           dojo.query(".dijitProgressBarTile", pbTime.domNode).removeClass("orange");
                           dojo.query(".dijitProgressBarTile", pbTime.domNode).addClass("red");
                       };
			        pbTime.update({'progress':pers_time_used+'%'});
            		divTime.innerHTML = '<b>'+tr.tr({'module': 'Chilli','phrase':'Used','lang':lang})+' </b>'+chilli.Format.time(summary.time_used)+'<b> '+tr.tr({'module': 'Chilli','phrase':'Available','lang':lang})+' </b>'+chilli.Format.time(summary.time_avail);
		}

                //Data
		if(summary.data_avail == 'NA'){
                	divData.innerHTML = '<b>'+tr.tr({'module': 'Chilli','phrase':'Used','lang':lang})+' </b>'+chilli.Format.bytes(summary.data_used);
                	dojo.query(".dijitProgressBarTile", pbData.domNode).removeClass("green");
			pbData.update({"interminate":true});
		}else{
			var data_total     = summary.data_used + summary.data_avail;
			var pers_data_used = (summary.data_used / data_total) * 100;
                        if((pers_time_used > chilli.Settings.orange)&(pers_time_used < chilli.Settings.red)){
                            dojo.query(".dijitProgressBarTile", pbData.domNode).removeClass("green");
                            dojo.query(".dijitProgressBarTile", pbData.domNode).removeClass("red");
                            dojo.query(".dijitProgressBarTile", pbData.domNode).addClass("orange");
                          };
                       if(pers_time_used > chilli.Settings.red){
                           dojo.query(".dijitProgressBarTile", pbData.domNode).removeClass("green");
                           dojo.query(".dijitProgressBarTile", pbData.domNode).removeClass("orange");
                           dojo.query(".dijitProgressBarTile", pbData.domNode).addClass("red");
                       };
			            pbData.update({'progress':pers_data_used+'%'});
                        divData.innerHTML = '<b>'+tr.tr({'module': 'Chilli','phrase':'Used','lang':lang})+' </b>'+chilli.Format.bytes(summary.data_used)+'<b> '+tr.tr({'module': 'Chilli','phrase':'Available','lang':lang})+' </b>'+chilli.Format.bytes(summary.data_avail);
		}
	}

    }

    //___ Status screen ___
    cu.status       = function(response){
        //If we just need to repaint the screen, we call _repaintStatus(response)
        //Else we start from scratch
        if(dojo.query(".chilliValue",divContent).length > 0){
            console.log("A refresh of screen please");
            _repaintStatus(response);
            return;
        }
        cu.new_status(response);
    }


    //Disconnect the user
    cu.disconnect   = function() {
        if (confirm(tr.tr({'module': 'Chilli','phrase':'Are you sure you want to disconnect','lang':lang})+'?')) {
            chilli.Json.logOff();
        }
        return false;
    }

    //========Private Functions=================

    //---- Switching from one screen to the other requires that we need to first clear some content----
    function _clearContent(){
        console.log("Clear Content Called");
         //----Clean up first----------
        if(dijit.byId('componentLoginLightUsername') != undefined){
            dijit.byId('componentLoginLightUsername').destroyDescendants(true);
            dijit.byId('componentLoginLightUsername').destroy(true);
        }
         if(dijit.byId('componentLoginLightLanguage') != undefined){
            dijit.byId('componentLoginLightLanguage').destroyDescendants(true);
            dijit.byId('componentLoginLightLanguage').destroy(true);
        }
	if(dijit.byId('chilliPopUp') != undefined){
            dijit.byId('chilliPopUp').destroyDescendants(true);
            dijit.byId('chilliPopUp').destroy(true);
	}

        //----------------------------
        //Get a list of all the children and remove them
        dojo.query('*',divContent).orphan();
    }

    //--Returns a string containing the contents of the status table----
    function _returnStatusString(response){

        var startTime =new Date(response.session.startTime * 1000);

        var strSt = '<table border="0" id="statusTable" style="padding-top:4px;font-size:70%">'+
                    '<tr id="connectRow">'+
                    '<td id="statusMessage" class="chilliLabel">'+tr.tr({'module': 'Chilli','phrase':'Connected','lang':lang})+'</td>'+
                    '<td class="chilliValue"><a href="#" onClick="chilli.Ui.disconnect();">'+tr.tr({'module': 'Chilli','phrase':'logout','lang':lang})+'</a></td>'+
                    '</tr>'+
                    '<tr id="sessionIdRow" class="chilliRow">'+
                    '<td id="sessionIdLabel" class="chilliLabel">'+tr.tr({'module': 'Chilli','phrase':'Session ID','lang':lang})+'</td>'+
                    '<td id="sessionId" class="chilliValue">'+
                        (response.session.sessionId ? response.session.sessionId : tr.tr({'module': 'Chilli','phrase':'Not available','lang':lang}))+
                    '</td>'+
                    '</tr>'+
                    '<tr id="sessionTimeoutRow">'+
                    '<td id="sessionTimeoutLabel" class="chilliLabel">'+tr.tr({'module': 'Chilli','phrase':'Max Session Time','lang':lang})+'</td>'+
                    '<td id="sessionTimeout" class="chilliValue">'+
                         chilli.Format.time(response.session.sessionTimeout, tr.tr({'module': 'Chilli','phrase':'unlimited','lang':lang}))+
                    '</td>'+
                    '</tr>'+
                    '<tr id="idleTimeoutRow" class="chilliRow">'+
                    '<td id="idleTimeoutLabel" class="chilliLabel">'+tr.tr({'module': 'Chilli','phrase':'Max Idle Time','lang':lang})+'</td>'+
                    '<td id="idleTimeout" class="chilliValue">'+
                        chilli.Format.time(response.session.idleTimeout, tr.tr({'module': 'Chilli','phrase':'unlimited','lang':lang}))+
                    '</td>'+
                    '</tr>'+
                    '<tr id="startTimeRow">'+
                    '<td id="startTimeLabel" class="chilliLabel">'+tr.tr({'module': 'Chilli','phrase':'Start Time','lang':lang})+'</td>'+
                    '<td id="startTime" class="chilliValue">'+
                        (startTime ? startTime : tr.tr({'module': 'Chilli','phrase':'Not available','lang':lang}))+
                    '</td>'+
                    '</tr>'+
                    '<tr id="sessionTimeRow" class="chilliRow">'+
                    '<td id="sessionTimeLabel" class="chilliLabel">'+tr.tr({'module': 'Chilli','phrase':'Session Time','lang':lang})+'</td>'+
                    '<td id="sessionTime" class="chilliValue">'+
                        chilli.Format.time(response.accounting.sessionTime)+
                    '</td>'+
                    '</tr>'+
                    '<tr id="idleTimeRow">'+
                    '<td id="idleTimeLabel" class="chilliLabel">'+tr.tr({'module': 'Chilli','phrase':'Idle Time','lang':lang})+'</td>'+
                    '<td id="idleTime" class="chilliValue">'+
                        chilli.Format.time(response.accounting.idleTime)+
                    '</td>'+
                    '</tr>'+
                    '<tr id="inputOctetsRow" class="chilliRow">'+
                    '<td id="inputOctetsLabel" class="chilliLabel">'+tr.tr({'module': 'Chilli','phrase':'Downloaded','lang':lang})+'</td>'+
                    '<td id="inputOctets" class="chilliValue">'+
                        chilli.Format.bytes(response.accounting.inputOctets)+
                    '</td>'+
                    '</tr>'+
                    '<tr id="outputOctetsRow">'+
                    '<td id="outputOctetsLabel" class="chilliLabel">'+tr.tr({'module': 'Chilli','phrase':'Uploaded','lang':lang})+'</td>'+
                    '<td id="outputOctets" class="chilliValue">'+
                        chilli.Format.bytes(response.accounting.outputOctets)+
                    '</td>'+
                    '</tr>'+
                    '<tr id="originalURLRow" class="chilliRow">'+
                    '<td id="originalURLLabel" class="chilliLabel">'+tr.tr({'module': 'Chilli','phrase':'Original URL','lang':lang})+'</td>'+
                    '<td id="originalURL" class="chilliValue">'+'<a target="_blank" href="'+
                        response.redir.originalURL+'">'+response.redir.originalURL+
                    '</a></td>'+
                    '</tr>'+
                    '</table>';

        return strSt;
    }


    function _repaintStatus(response){
       
        //setElementValue('sessionTime',chilli.Format.time(response.accounting.sessionTime));
        setElementValue("sessionTime", chilli.Format.time(response.accounting.sessionTime));
        setElementValue("idleTime", chilli.Format.time(response.accounting.idleTime));
        setElementValue("inputOctets", chilli.Format.bytes(response.accounting.inputOctets));
        setElementValue("outputOctets", chilli.Format.bytes(response.accounting.outputOctets));
        return true;

    }

    function setElementValue(elem, val, forceHTML) {

        var e = dojo.byId(elem);
        if (e != null) {
        var node = e;
            if (!forceHTML && node.firstChild) {
                node = node.firstChild;
                node.nodeValue = val;
            } else {
                node.innerHTML = val;
            }
        }
    }

     cu.dummy_status           = function(){
        _clearContent();
         var tcWorkarea      = new dijit.layout.TabContainer({
                tabPosition: "top",
                style : "width:100%;height:100%; background-color: #cbd5cb;"
        },document.createElement("div"));

            var usage = new dijit.layout.ContentPane({ title:tr.tr({'module': 'Chilli','phrase':'Usage','lang':lang}),iconClass:'usageTab'});
            tcWorkarea.addChild(usage);
            var stats = new dijit.layout.ContentPane({ title:tr.tr({'module': 'Chilli','phrase':'Stats','lang':lang}),iconClass:'statsTab'});
            tcWorkarea.addChild(stats);
        dojo.place(tcWorkarea.domNode,divContent);

        tcWorkarea.startup();
        tcWorkarea.layout();
    }

 })();//(function(){
}

