/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.ASViewNetwork"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.ASViewNetwork"] = true;
dojo.provide("content.ASViewNetwork");
dojo.require('components.Translator');


(function(){
    var casvn            = content.ASViewNetwork;
    var tr               = components.Translator; 
    var l                = components.LoginLight.UserInfo.l_iso;

    var asID;

    var urlASNetworkView        = components.Const.cake+'auto_setups/json_network_view/';
    var urlASNetworkSave        = components.Const.cake+'auto_setups/json_network_edit/';

    casvn.add   = function(divContainer,id){

        asID = id;
        dojo.xhrGet({
            url: urlASNetworkView+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    casvn.populatePlanDetail(divContainer,response.network);
                    //------------------------------------------------------

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    casvn.populatePlanDetail = function(divContainer,network){

        //----Clean up first----------
        if(dijit.byId('contentASViewNetwork'+asID) != undefined){
            dijit.byId('contentASViewNetwork'+asID).destroyDescendants(true);
            dijit.byId('contentASViewNetwork'+asID).destroy(true);
        }
        //----------------------------

        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            var hiddenId    = document.createElement("input");  //Hidden element 
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = asID;
        dojo.place(hiddenId,frmEdit.domNode);

            components.QElements.addPair({  label:tr.tr({'module': 'ASViewNetwork','phrase':"MAC Address",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'mac',    inpRequired:true, isLast:false, value: network.mac });
            components.QElements.addPair({  label:tr.tr({'module': 'ASViewNetwork','phrase':"IP Address",'lang':l}),  divToAdd: frmEdit.domNode,   inpName:'ip',     inpRequired:true, isLast:false, value: network.ip });
            components.QElements.addPair({  label:tr.tr({'module': 'ASViewNetwork','phrase':"Subnet Mask",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'mask',   inpRequired:true, isLast:false, value: network.mask });
            components.QElements.addPair({  label:tr.tr({'module': 'ASViewNetwork','phrase':"Gateway",'lang':l}),     divToAdd: frmEdit.domNode,   inpName:'gateway',inpRequired:true, isLast:false, value: network.gateway });
            components.QElements.addPair({  label:tr.tr({'module': 'ASViewNetwork','phrase':"DNS Server",'lang':l}),  divToAdd: frmEdit.domNode,   inpName:'dns',    inpRequired:true, isLast:true, value: network.dns });

            var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'ASViewNetwork','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);
                
                dojo.connect(btnEdit,'onClick',function(){
                   if(frmEdit.validate()){

                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlASNetworkSave,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    console.log(frmObj);
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'ASViewNetwork','phrase':"Auto Setup Network updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'ASViewNetwork','phrase':"Problems updating Auto Setup Network",'lang':l})+'</b>','message',components.Const.toasterError);
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
