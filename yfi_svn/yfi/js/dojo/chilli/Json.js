
dojo.require('dojo.io.script');
dojo.provide('chilli.Json');
dojo.require('chilli.Ui');
dojo.require('chilli.Settings');
dojo.require('chilli.Translator');

if(!dojo._hasResource["chilli.Json"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
(function(){

    var username;
    var statusIntervalID;
    var usageIntervalID;
    var usageRefreshRate    = chilli.Settings.usage_rate;
    var statusRefreshRate   = chilli.Settings.status_rate;

    var cj          = chilli.Json;
    var tr          = chilli.Translator;
    var timeOut     = chilli.Settings.timeout;
    var uam_jsonp   = chilli.Settings.uam_jsonp;
    var usage_jsonp = chilli.Settings.usage_jsonp;
    var queryObj    = new Object(); //How the page was called - Should be called with the following search sting:
                                    //?res=notyet&uamip=10.1.0.1&uamport=3660&challenge=ca91105b39c91d49cbfa61ef085a2488&mac=00-0C-F1-5F-58-0B&
                                    //ip=10.1.0.8&called=00-1D-7E-BC-02-AD&nasid=10.20.30.2&userurl=http%3a%2f%2f1.1.1.1%2f&md=50834AD406B33D3A2D771FF2B4C80499
    window.location.search.replace(new RegExp("([^?=&]+)(=([^&]*))?","g"), function($0,$1,$2,$3) { queryObj[$1] = $3; });
    
    //___STATUS___
    cj.getStatus    = function(url_string){

        clearInterval(statusIntervalID);  //Clear previous interval if it was set.
        //Not called through the hotspot - reflect on UI
        if(queryObj.res == undefined){
            chilli.Ui.notHotspot();
            //chilli.Ui.dummy_status();
            return;
        }

        //Build the URL from the queryObj's keys
        if(url_string != undefined){
            url_string = url_string+'';     //Somehow it gets called with a decimal for url_string when setInterval calls it - convert then to string
            (url_string.match(/http|s:/))||(url_string = "http://"+queryObj.uamip+':'+queryObj.uamport+'/json/status');
        }else{
             url_string = 'http://'+queryObj.uamip+':'+queryObj.uamport+'/json/status';
        }

        dojo.io.script.get({
            callbackParamName : 'callback', //provided by the jsonp service of coova chilli
            timeout: timeOut,
            preventCache: true,
            url : url_string,
            
            load : function(response, ioArgs) {
                        console.log(response);
                        _statusFeedback(response);
                        //return response.clientState;
                    },
            error : function(response, ioArgs) {
                           // console.log(response);
                            chilli.Ui.error(response);
                            return response;
                    }
        });
    }

    //___Get Usage___
    cj.getUsage     = function(){

        console.log('USAGE => Fetch latest usage for:', username);
        dojo.io.script.get({
            callbackParamName : 'callback', //provided by the jsonp service of coova chilli
            timeout: timeOut,
            preventCache: true,
            url : usage_jsonp+'?callback=completed&key=12345&username='+username,
            
            load : function(response, ioArgs) {
                        console.log(response);
                        if(response.json.status == 'ok'){
                           chilli.Ui.refreshUsage(response.json.summary);
                        }else{
                            chilli.Ui.error('Error in Usage');
                            return response;
                        }
                    },
            error : function(response, ioArgs) {
                            chilli.Ui.error(response);
                            return response;
                    }
        });
    }

    //___LOG IN___
    cj.logIn        = function(username,password,challenge){
        console.log("Logging in with ",username,password);
        chilli.Ui.wait(tr.tr({'module': 'Chilli','phrase':'Loggin in - Please wait','lang':chilli.Ui.lang}));
        url_uam = uam_jsonp+'?username='+username+'&password='+password+'&challenge='+challenge;
        //Get the hashed pwd from the uam service
        dojo.io.script.get({
            callbackParamName : 'callback', //provided by the jsonp service of coova chilli
            timeout: timeOut,
            preventCache: true,
            url : url_uam,
            load : function(resp, ioArgs) {
                       logonUrl = 'http://'+queryObj.uamip+':'+queryObj.uamport+ '/json/logon?username=' + escape(username) + '&password='  + resp.response;
                       cj.getStatus(logonUrl);

                    },
            error : function(resp, ioArgs) {
                            chilli.Ui.error(response);
                            return response;
                    }
        });
    }

    //___LOG OUT___
    cj.logOff       = function () {
        console.log("Loggin off the User");
        var url_string = "http://"+queryObj.uamip+':'+queryObj.uamport+'/json/logoff';
        cj.getStatus(url_string);
    }

    function _statusFeedback(response){

        switch(response.clientState) {      //The clientState is either 0 -> Not Logged in, or 1 -> Logged in

            case 0:
            chilli.Ui.logIn(response);
            username = '';                  //Clear the username
            clearInterval(usageIntervalID); //Clear previous interval if it was set.
	        usageIntervalID = undefined;
            break;

            case 1:
            username = response.session.userName;
            statusIntervalID = setInterval(cj.getStatus, statusRefreshRate); //Start the loop to keep refreshing the status dispaly
            //If this is the first time usageIntervalID will be == undefined, then set the usage loop
            if(usageIntervalID == undefined){
                //Set the username
                usageIntervalID = setInterval(cj.getUsage, usageRefreshRate);
            }else{
                console.log("The usageIntervalID is",usageIntervalID);
	    }
            chilli.Ui.status(response);
            break; 

        }
        return true;
    }
 })();//(function(){
}
