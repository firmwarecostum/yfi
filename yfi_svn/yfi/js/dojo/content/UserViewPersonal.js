/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.UserViewPersonal"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.UserViewPersonal"] = true;
dojo.provide("content.UserViewPersonal");
dojo.require('components.Translator');


(function(){
    var cuvp            = content.UserViewPersonal;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var urlUserDetail   = components.Const.cake+'permanent_users/json_view/';
    var urlUserEdit     = components.Const.cake+'permanent_users/json_edit/';
    var urlLanguages    = components.Const.cake+'users/json_languages';


     var data_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'hard', name: tr.tr({'module': 'UserViewPersonal','phrase':"Hard",'lang':l}),selected:'selected' },
                { id : 'soft', name: tr.tr({'module': 'UserViewPersonal','phrase':"Soft",'lang':l})},
				{ id : 'prepaid', name: tr.tr({'module': 'Users','phrase':"Prepaid",'lang':l})}
            ]}};

    cuvp.getUserDetail   = function(divContainer,id){

         dojo.xhrGet({
            url: urlUserDetail+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    cuvp.populatePersonalDetail(divContainer,response.user);
                    //------------------------------------------------------

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });

    }

    
    cuvp.populatePersonalDetail = function(divContainer,user){

        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            var hiddenId    = document.createElement("input");  //Hidden element containing the User's ID
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = user.id;
        dojo.place(hiddenId,frmEdit.domNode);

            components.QElements.addComboBox({ label:tr.tr({'module': 'UserViewPersonal','phrase':"Cap Type",'lang':l}),data:data_op, divToAdd: frmEdit.domNode,inpName:'cap',inpRequired:true, isLast:false,searchAttr:'name',value: user.cap});

             components.QElements.addDateTextBox({ label:'Expires on',divToAdd: frmEdit.domNode,inpName:'expire_on',inpRequired:true,isLast:false});
                var wList = dijit.findWidgets(frmEdit.domNode);
                dojo.forEach(wList, function(item){
                    if(item.declaredClass == 'dijit.form.DateTextBox'){
                        //Set the date in the future
                        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
                        d.setUTCSeconds(user.expire_on);
                        item.set('value', d);
                    }
                });

            components.QElements.addPair({label:tr.tr({'module': 'UserViewPersonal','phrase':"Name",'lang':l}),     divToAdd: frmEdit.domNode,inpName:'name',       inpRequired:false,  isLast:false,   value: user.name});
            components.QElements.addPair({label:tr.tr({'module': 'UserViewPersonal','phrase':"Surname",'lang':l}),  divToAdd: frmEdit.domNode,inpName:'surname',    inpRequired:false,  isLast:false,   value: user.surname});
            components.QElements.addTextArea({label:tr.tr({'module': 'UserViewPersonal','phrase':"Address",'lang':l}), divToAdd: frmEdit.domNode,inpName:'address', inpRequired:false,  isLast:false,   value: user.address });
            components.QElements.addPair({label:tr.tr({'module': 'UserViewPersonal','phrase':"Phone",'lang':l}),    divToAdd: frmEdit.domNode,inpName:'phone',      inpRequired:false,  isLast:false,   value: user.phone});
            components.QElements.addPair({label:tr.tr({'module': 'UserViewPersonal','phrase':"e-mail",'lang':l}),   divToAdd: frmEdit.domNode,inpName:'email',      inpRequired:false,  isLast:false,   value: user.email});
            components.QElements.addComboBox({ label:tr.tr({'module': 'UserViewPersonal','phrase':"Language",'lang':l}),url:urlLanguages, divToAdd: frmEdit.domNode,inpName:'language',inpRequired:true, isLast:true,searchAttr:'name',value: user.language_id});
           

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
        dojo.place(frmEdit.domNode,divContainer);
    }

})();//(function(){

}
