/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.APViewDevice"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.APViewDevice"] = true;
dojo.provide("content.APViewDevice");

dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var capvd            = content.APViewDevice;
    var urlViewDevice    = components.Const.cake+'access_points/json_device/';
    var divInfo
    var nasID;

    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;


    capvd.create           = function(divParent,id){

        nasID = id;
           //--------------------Action Part --------------------
            divGridAction     = document.createElement('div');
            dojo.addClass(divGridAction, 'divGridAction');

                var divActions = document.createElement("div");
                dojo.addClass(divActions, "divActions");
                    components.QElements.addAction({Name: tr.tr({'module': 'APViewDevice','phrase':"Reload",'lang':l}),      Type:'reload', Parent: divActions,Action:capvd.reload,Id:null });
            dojo.place(divActions,divGridAction);
                var h =document.createElement("h2");
                h.innerHTML = tr.tr({'module': 'APViewDevice','phrase':"Device Info",'lang':l});
            dojo.place(h,divGridAction);
            //---------------------------------------
        dojo.place(divGridAction,divParent);
            var br=document.createElement('BR');
            br.clear = 'all';
        dojo.place(br,divParent);

            divInfo     = document.createElement('div');
        dojo.place(divInfo,divParent);
       capvd.reload();
    }

    capvd.reload    = function(){
        console.log("Fetch latest Device Data");
        divInfo.innerHTML = ''; //Clear it if there was something int this div
        dojo.place(components.Common.divWorking(),divInfo);   //Show them we are waiting
        dojo.xhrGet({
                url: urlViewDevice+nasID,
                preventCache: true,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'APViewDevice','phrase':"Fetched latest Device Info",'lang':l}),'message',components.Const.toasterInfo);
                        divInfo.innerHTML = '';
                        components.QElements.addLabelPair({label:tr.tr({'module': 'APViewDevice','phrase':"Firmware",'lang':l}),    divToAdd: divInfo,     inpRequired:true,  isLast:false,    value: response.device.fw});
                        components.QElements.addLabelPair({label:tr.tr({'module': 'APViewDevice','phrase':"Time",'lang':l}),        divToAdd: divInfo,     inpRequired:true,  isLast:false,    value: response.device.time});
                        components.QElements.addLabelPair({label:tr.tr({'module': 'APViewDevice','phrase':"Uptime",'lang':l}),      divToAdd: divInfo,     inpRequired:true,  isLast:false,    value: response.device.up});
                        components.QElements.addLabelPair({label:tr.tr({'module': 'APViewDevice','phrase':"Load",'lang':l}),        divToAdd: divInfo,     inpRequired:true,  isLast:false,    value: response.device.load});
                         components.QElements.addLabelPair({label:tr.tr({'module': 'APViewDevice','phrase':"VPN Tunnel",'lang':l}),        divToAdd: divInfo,     inpRequired:true,  isLast:false,    value: response.device.tunnel});
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
        
    }

})();//(function(){

}
