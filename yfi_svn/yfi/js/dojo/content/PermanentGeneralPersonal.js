/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.PermanentGeneralPersonal"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PermanentGeneralPersonal"] = true;
dojo.provide("content.PermanentGeneralPersonal");
dojo.require('components.Translator');


(function(){
    var cpgp                    = content.PermanentGeneralPersonal;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var urlUserDetail           = components.Const.cake+'permanent_users/json_view/';
    var urlUserEdit             = components.Const.cake+'permanent_users/json_edit/';
    var urlProfiles             = components.Const.cake+'profiles/json_list_for_user/';

    var data_op = {data: {
        identifier : 'id',
        label: 'name',
        items : [
            { id : 'hard', name: tr.tr({'module': 'UserViewPersonal','phrase':"Hard",'lang':l}),selected:'selected' },
            { id : 'soft', name: tr.tr({'module': 'UserViewPersonal','phrase':"Soft",'lang':l})},
            { id : 'prepaid', name: tr.tr({'module': 'Users','phrase':"Prepaid",'lang':l})}
        ]}};


    cpgp.create   = function(divContainer,id){
        dojo.xhrGet({
            url: urlUserDetail+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    cpgp.populatePersonalDetail(divContainer,response);
                    //------------------------------------------------------
                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cpgp.populatePersonalDetail = function(divContainer,response){

        var user    = response.user;
        var right   = response.right;
        var saveFlag= false;

        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            var hiddenId    = document.createElement("input");  //Hidden element containing the User's ID
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = user.id;
        dojo.place(hiddenId,frmEdit.domNode);


        var c_start  = user.cap.substring(0,1);
        var c_rest   = user.cap.substring(1);
        //-- Cap Type --
        if(right.cap_type == true){
            saveFlag = true;
            components.QElements.addComboBox({ label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Cap Type",'lang':l}),data:data_op, divToAdd: frmEdit.domNode,inpName:'cap',inpRequired:true, isLast:false,searchAttr:'name',value: user.cap});
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Cap Type",'lang':l}), divToAdd: frmEdit.domNode, inpRequired:true,isLast:false, value: c_start.toUpperCase()+c_rest});
        }

        //-- Profile --
        if(right.profile == true){
            saveFlag = true;
            components.QElements.addComboBox({ label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Profile",'lang':l}),url:urlProfiles+user.id, divToAdd: frmEdit.domNode,inpName:'profile',inpRequired:true, isLast:false,searchAttr:'name', value: user.profile_id });
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Profile",'lang':l}), divToAdd: frmEdit.domNode, inpRequired:true,isLast:false, value: user.profile });
        }

        //-- Expires on...
        components.QElements.addLabelPair({
                label:'Expires on', 
                divToAdd: frmEdit.domNode, 
                inpRequired:true,
                isLast:false, 
                value: timeConverter(user.expire_on) 
        });
        

        //-- Name --
        if(right.name == true){
            saveFlag = true;
            components.QElements.addPair({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Name",'lang':l}), divToAdd: frmEdit.domNode,inpName:'name',       inpRequired:true,  isLast:false,   value: user.name});
     
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Name",'lang':l}), divToAdd: frmEdit.domNode,     inpRequired:true,  isLast:false,    value: user.name});
        }

        //-- Surname --
        if(right.surname == true){
            saveFlag = true;
            components.QElements.addPair({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Surname",'lang':l}),  divToAdd: frmEdit.domNode,inpName:'surname',    inpRequired:true,  isLast:false,   value: user.surname});
     
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Surname",'lang':l}),      divToAdd: frmEdit.domNode,     inpRequired:true,  isLast:false,    value: user.surname});
        }
        
        //-- Address --
        if(right.address == true){
            saveFlag = true;
            components.QElements.addTextArea({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Address",'lang':l}), divToAdd: frmEdit.domNode,inpName:'address', inpRequired:true,  isLast:false,   value: user.address });
     
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Address",'lang':l}),  divToAdd: frmEdit.domNode,     inpRequired:true,  isLast:false,    value: user.address});
        }
        
        //-- e-mail --
        if(right.email == true){
            saveFlag = true;
            components.QElements.addPair({label:tr.tr({'module': 'UserViewPersonal','phrase':"e-mail",'lang':l}),   divToAdd: frmEdit.domNode,inpName:'email',      inpRequired:true,  isLast:false,   value: user.email});
     
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"e-mail",'lang':l}),   divToAdd: frmEdit.domNode,     inpRequired:true,  isLast:false,    value: user.email});
        }
        
        //-- phone --
        if(right.phone == true){
            saveFlag = true;
            components.QElements.addPair({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Phone",'lang':l}),    divToAdd: frmEdit.domNode,inpName:'phone',      inpRequired:true,  isLast:false,   value: user.phone});
     
        }else{
            components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Phone",'lang':l}),divToAdd: frmEdit.domNode,     inpRequired:true,  isLast:false,     value: user.phone});
        }
        
        components.QElements.addLabelPair({label:tr.tr({'module': 'PermanentGeneralPersonal','phrase':"Language",'lang':l}),divToAdd: frmEdit.domNode,     inpRequired:true,  isLast:true,     value: user.language});

        if(saveFlag == true){

            var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'UserViewPersonal','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnEdit.domNode,frmEdit.domNode);

                
                dojo.connect(btnEdit,'onClick',function(){

                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object

                        dojo.xhrPost({
                        url: urlUserEdit,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    console.log(frmObj);
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewPersonal','phrase':"Permanent User updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewPersonal','phrase':"Problems updating Permanent User",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){

                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                })
        }


        dojo.place(frmEdit.domNode,divContainer);
    }


    function timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp*1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date+' '+month+' '+year+' '+hour+':'+min+':'+sec ;
        return time;
    }


})();//(function(){

}
