/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.PermanentGeneralNotify"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PermanentGeneralNotify"] = true;
dojo.provide("content.PermanentGeneralNotify");
dojo.require('components.Translator');


(function(){
    var cpgn                    = content.PermanentGeneralNotify;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var urlUserNotifyDetail     = components.Const.cake+'permanent_users/json_notify_detail/';
    var urlUserNotifySave       = components.Const.cake+'permanent_users/json_notify_save/';

     var data_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'disabled', name: tr.tr({'module': 'PermanentGeneralNotify','phrase':"Disabled",'lang':l}) },
                { id : 'email',    name: tr.tr({'module': 'PermanentGeneralNotify','phrase':"e-mail",'lang':l})}
            ]}};

    cpgn.create   = function(divContainer,id){
        dojo.xhrGet({
            url: urlUserNotifyDetail+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    cpgn.populateNotifyDetail(divContainer,response);
                    //------------------------------------------------------
                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cpgn.populateNotifyDetail = function(divContainer,response){

        //Make method uppercase
        var user    = response.user;
        var right   = response.right;
        var m_start = user.type.substring(0,1);
        var m_rest  = user.type.substring(1);

        var saveFlag= false;

        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            var hiddenId    = document.createElement("input");  //Hidden element containing the User's ID
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = user.id;
        dojo.place(hiddenId,frmEdit.domNode);

        //-- Notify Type --
        if(right.type == true){
            saveFlag = true;
            components.QElements.addComboBox({ label:tr.tr({'module': 'PermanentGeneralNotify','phrase':"Method",'lang':l}),data:data_op, divToAdd: frmEdit.domNode,inpName:'type',inpRequired:true, isLast:false,searchAttr:'name',value: user.type});
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralNotify','phrase':"Method",'lang':l}),    divToAdd: frmEdit.domNode, inpRequired:true,  isLast:false, value: m_start.toUpperCase()+m_rest});
        }

        //-- Address1 --
        if(right.address1 == true){
            saveFlag = true;
            components.QElements.addPair({label:tr.tr({'module': 'PermanentGeneralNotify','phrase':"Address",'lang':l}),  divToAdd: frmEdit.domNode,inpName:'address1', inpRequired:true,  isLast:false,value: user.address1});
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralNotify','phrase':"Address",'lang':l}),      divToAdd: frmEdit.domNode,inpRequired:true,  isLast:false,value: user.address1});
        }

        //-- Address2 --
        if(right.address2 == true){
            saveFlag = true;
            components.QElements.addPair({label:tr.tr({'module': 'PermanentGeneralNotify','phrase':"CC",'lang':l}),       divToAdd: frmEdit.domNode,inpName:'address2',       inpRequired:false,  isLast:false, value: user.address2});
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralNotify','phrase':"CC",'lang':l}),           divToAdd: frmEdit.domNode,     inpRequired:true,  isLast:false,    value: user.address2});
        }

        //-- Start Percentage --
        if(right.start == true){
            saveFlag = true;
            components.QElements.addNumberSpinner({ label:tr.tr({'module': 'PermanentGeneralNotify','phrase':"Start Percentage",'lang':l}),valShow:user.start,min:40,max:99,divToAdd: frmEdit.domNode,inpName:'start',isLast:false,inpRequired:true});
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralNotify','phrase':"Start Percentage",'lang':l}),divToAdd: frmEdit.domNode,  inpRequired:true,  isLast:false,    value: user.start});
        }

        //-- Step Percentage --
        if(right.start == true){
            saveFlag = true;
            components.QElements.addNumberSpinner({ label:tr.tr({'module': 'PermanentGeneralNotify','phrase':"Percentage Step",'lang':l}),valShow:user.increment,min:1,max:50,divToAdd: frmEdit.domNode,inpName:'increment',isLast:true,inpRequired:true});
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralNotify','phrase':"Percentage Step",'lang':l}), divToAdd: frmEdit.domNode,  inpRequired:true,  isLast:false,    value: user.increment});
        }

        if(saveFlag == true){

            var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'UserViewNotify','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnEdit.domNode,frmEdit.domNode);

                dojo.connect(btnEdit,'onClick',function(){
                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlUserNotifySave,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    console.log(frmObj);
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewNotify','phrase':"Notification updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewNotify','phrase':"Problems updating Notification",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){

                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                });
        }


        dojo.place(frmEdit.domNode,divContainer);

    }

})();//(function(){

}
