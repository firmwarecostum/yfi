/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.ASViewVpn"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.ASViewVpn"] = true;
dojo.provide("content.ASViewVpn");
dojo.require('components.Translator');


(function(){
    var casvv            = content.ASViewVpn;
    var tr               = components.Translator; 
    var l                = components.LoginLight.UserInfo.l_iso;

    var asID;

    var urlASVpnView        = components.Const.cake+'auto_setups/json_vpn_view/';
    var urlASVpnSave        = components.Const.cake+'auto_setups/json_vpn_edit/';

    casvv.add   = function(divContainer,id){

        asID = id;
        dojo.xhrGet({
            url: urlASVpnView+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    casvv.populateVpnDetail(divContainer,response.vpn);
                    //------------------------------------------------------

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    casvv.populateVpnDetail = function(divContainer,vpn){

        //----Clean up first----------
        if(dijit.byId('contentASViewVpn'+asID) != undefined){
            dijit.byId('contentASViewVpn'+asID).destroyDescendants(true);
            dijit.byId('contentASViewVpn'+asID).destroy(true);
        }
        //----------------------------

        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            var hiddenId    = document.createElement("input");  //Hidden element 
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = asID;
        dojo.place(hiddenId,frmEdit.domNode);

            components.QElements.addPair({  label:tr.tr({'module': 'ASViewVpn','phrase':"VPN Server",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'vpn_server',    inpRequired:true, isLast:false, value: vpn.vpn_server });
            components.QElements.addPair({  label:tr.tr({'module': 'ASViewVpn','phrase':"Tunnel IP",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'tun_ip',    inpRequired:true, isLast:false, value: vpn.tun_ip });
            components.QElements.addPair({  label:tr.tr({'module': 'ASViewVpn','phrase':"Tunnel Mask",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'tun_mask',    inpRequired:true, isLast:false, value: vpn.tun_mask });
            components.QElements.addPair({  label:tr.tr({'module': 'ASViewVpn','phrase':"Tunnel Broadcast",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'tun_broadcast',    inpRequired:true, isLast:false, value: vpn.tun_broadcast });
            components.QElements.addTextArea({label:tr.tr({'module': 'ASViewVpn','phrase':"CA",'lang':l}), divToAdd: frmEdit.domNode,inpName:'ca', inpRequired:true,  isLast:false,   value: vpn.ca });
            components.QElements.addTextArea({label:tr.tr({'module': 'ASViewVpn','phrase':"Cert",'lang':l}), divToAdd: frmEdit.domNode,inpName:'cert', inpRequired:true,  isLast:false,   value: vpn.cert });
            components.QElements.addTextArea({label:tr.tr({'module': 'ASViewVpn','phrase':"Key",'lang':l}), divToAdd: frmEdit.domNode,inpName:'key', inpRequired:true,  isLast:true,   value: vpn.key });



            var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'ASViewVpn','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);
                
                dojo.connect(btnEdit,'onClick',function(){
                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlASVpnSave,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    console.log(frmObj);
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'ASViewVpn','phrase':"Auto Setup VPN updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'ASViewVpn','phrase':"Problems updating Auto Setup VPN",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){

                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                });
        dojo.place(frmEdit.domNode,divContainer);
    }

})();//(function(){

}
