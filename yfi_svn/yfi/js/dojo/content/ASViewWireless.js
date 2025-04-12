/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.ASViewWireless"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.ASViewWireless"] = true;
dojo.provide("content.ASViewWireless");
dojo.require('components.Translator');


(function(){
    var casvw            = content.ASViewWireless;
    var tr               = components.Translator; 
    var l                = components.LoginLight.UserInfo.l_iso;

    var asID;

    var urlASWirelessView   = components.Const.cake+'auto_setups/json_wireless_view/';
    var urlASWirelessSave   = components.Const.cake+'auto_setups/json_wireless_edit/';


    var channel_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'auto', name: tr.tr({'module': 'ASViewWireless','phrase':"Auto",'lang':l}) },
                { id : '1', name:'1'},
                { id : '2', name:'2'},
                { id : '3', name:'3'},
                { id : '4', name:'4'},
                { id : '5', name:'5'},
                { id : '6', name:'6'},
                { id : '7', name:'7'},
                { id : '8', name:'8'},
                { id : '9', name:'9'},
                { id : '10', name:'10'},
                { id : '11', name:'11'},
                { id : '12', name:'12'},
                { id : '13', name:'13'},
                { id : '14', name:'14'}
            ]}};

    casvw.add   = function(divContainer,id){

        asID = id;
        dojo.xhrGet({
            url: urlASWirelessView+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    casvw.populateWirelessDetail(divContainer,response.wireless);
                    //------------------------------------------------------

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    casvw.populateWirelessDetail = function(divContainer,wireless){

        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
            var h2General       = document.createElement('h2');
            dojo.addClass(h2General, 'autoSetupH');
            h2General.innerHTML = tr.tr({'module': 'ASViewWireless','phrase':"Common Settings",'lang':l});
            dojo.place(h2General,frmEdit.domNode);

            var hiddenId    = document.createElement("input");  //Hidden element 
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = asID;
        dojo.place(hiddenId,frmEdit.domNode);

            if(wireless.enabled == true){
               components.QElements.addCheckPair({label:tr.tr({'module': 'ASViewWireless','phrase':"Enabled",'lang':l}),divToAdd: frmEdit.domNode,inpName:'enabled', inpRequired:true,checked: 'checked',value: 'on',isLast: false});
            }else{
                components.QElements.addCheckPair({label:tr.tr({'module': 'ASViewWireless','phrase':"Enabled",'lang':l}),divToAdd: frmEdit.domNode,inpName:'enabled', inpRequired:true,value: 'on',isLast: false});
            }
            components.QElements.addComboBox({ label:tr.tr({'module': 'ASViewWireless','phrase':"Channel",'lang':l}),data:channel_op, divToAdd: frmEdit.domNode,inpName:'channel',inpRequired:true, isLast:false,searchAttr:'name',value: wireless.channel});
            components.QElements.addNumberSpinner({ label: '% '+tr.tr({'module': 'ASViewWireless','phrase':"Power",'lang':l}),valShow:wireless.power,min:1,max:100,divToAdd: frmEdit.domNode,inpName:'power',isLast:false,inpRequired:true});
            components.QElements.addNumberSpinner({ label:tr.tr({'module': 'ASViewWireless','phrase':"Connect Distance",'lang':l}),valShow:wireless.distance,min:10,max:2000,divToAdd: frmEdit.domNode,inpName:'distance',isLast:false,inpRequired:true});
            var h2Secure        = document.createElement('h2');
            dojo.addClass(h2Secure, 'autoSetupH');
            h2Secure.innerHTML  = tr.tr({'module': 'ASViewWireless','phrase':"Secure SSID",'lang':l});;
            dojo.place(h2Secure,frmEdit.domNode);

            components.QElements.addPair({  label:tr.tr({'module': 'ASViewWireless','phrase':"SSID",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'secure_ssid',    inpRequired:true, isLast:false, value: wireless.secure_ssid });
            components.QElements.addPair({  label:tr.tr({'module': 'ASViewWireless','phrase':"RADIUS Server",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'radius',    inpRequired:true, isLast:false, value: wireless.radius });
            components.QElements.addPair({  label:tr.tr({'module': 'ASViewWireless','phrase':"Shared Secret",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'secret',    inpRequired:true, isLast:false, value: wireless.secret });

            var h2Open         = document.createElement('h2');
            dojo.addClass(h2Open, 'autoSetupH');
            h2Open.innerHTML   = tr.tr({'module': 'ASViewWireless','phrase':"Open SSID",'lang':l});
            dojo.place(h2Open,frmEdit.domNode);

            components.QElements.addPair({  label:tr.tr({'module': 'ASViewWireless','phrase':"SSID",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'open_ssid',    inpRequired:true, isLast:false, value: wireless.open_ssid });

            var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'ASViewWireless','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);
                
                dojo.connect(btnEdit,'onClick',function(){
                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlASWirelessSave,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    console.log(frmObj);
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'ASViewWireless','phrase':"Auto Setup Wireless updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'ASViewWireless','phrase':"Problems updating Auto Setup Wireless",'lang':l})+'</b>','message',components.Const.toasterError);
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
