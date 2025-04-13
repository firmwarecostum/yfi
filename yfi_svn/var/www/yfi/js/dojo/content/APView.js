/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.APView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.APView"] = true;
dojo.provide("content.APView");

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var cvap                = content.APView;
    var tr                  = components.Translator; 
    var l                   = components.LoginLight.UserInfo.l_iso;

    var urlAPDetail         = components.Const.cake+'users/json_ap_view/';
    var urlRealmList        = components.Const.cake+'realms/json_realms_for_ap/';
    var urlAPEdit           = components.Const.cake+'users/json_ap_edit/?';
    var urlAPRights         = components.Const.cake+'user_rights/json_rights_for/';
    var urlLanguages        = components.Const.cake+'users/json_languages';
   
    cvap.create=function(divParent,id){

        //--------------------------------------
        //-- Container Hierarchy: divParent->divWrapper->cp.domNode->divTC->tc.domNode->[tab,tab,tab] 
        console.log("Access Provider Detail comming up...."+id);

        dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId('contentWorkspaceAPView'+id));

       //----------------
         //Tab Container
        var tc = new dijit.layout.TabContainer({
            tabPosition: "top",
            style : "width:auto;height:100%; padding: 10px; border: 1px solid #000000;"
        },document.createElement("div") );
        dijit.byId('contentWorkspaceAPView'+id).attr('content',tc.domNode);

            //Tab
            var tcOne    = new dijit.layout.ContentPane({title : tr.tr({'module': 'APView','phrase':"Detail",'lang':l})});

            //----------------------------------------------------------------
            var divContainer     = document.createElement('div');
            dojo.addClass(divContainer, 'divTabForm');

                cvap.getAPDetail(divContainer,id);    //Populate the container div

            tcOne.attr('content',divContainer);
            //-----------------------------------------------------------------

            //Tab
            var tcTwo     = new dijit.layout.ContentPane({title : tr.tr({'module': 'APView','phrase':"Rights",'lang':l})});

           
        tc.addChild(tcOne);
        tc.addChild(tcTwo);

        //-----------------------------------------------
        dojo.connect(tc, 'selectChild',function(e){

            //------------------------------
            if(e == tcTwo){
                console.log('AP Rights tab clicked');
                if(e.domNode.childNodes.length == 0){

                    e.attr('content',components.Common.divWorking());

                    dojo.require('content.UserRights');
                    dojo.addOnLoad(function(){
                        content.UserRights.create(e.domNode,id);
                    });

                }
            }
            //----------------------------
        }); 
        //---------------------

        //Initialise the tabs
        tc.startup();

    }

    
    cvap.getAPDetail   = function(divContainer,id){

         dojo.xhrGet({
            url: urlAPDetail+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    cvap.populateAPDetail(divContainer,response.user);
                    //------------------------------------------------------

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });

    }

    
    cvap.populateAPDetail = function(divContainer,user){

        console.log(user);
         //----Clean up first----------
        if(dijit.byId('contentAPViewRealm'+user.id) != undefined){
            dijit.byId('contentAPViewRealm'+user.id).destroyDescendants(true);
            dijit.byId('contentAPViewRealm'+user.id).destroy(true);
        }
        //----------------------------


        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            var hiddenId    = document.createElement("input");  //Hidden element containing the User's ID
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = user.id;
        dojo.place(hiddenId,frmEdit.domNode);

            components.QElements.addPair({label: tr.tr({'module': 'APView','phrase':"Username",'lang':l}), divToAdd: frmEdit.domNode,inpName:'username',   inpRequired:true,   isLast:false,   value: user.username});
            components.QElements.addPair({label:tr.tr({'module': 'APView','phrase':"Name",'lang':l}),     divToAdd: frmEdit.domNode,inpName:'name',       inpRequired:false,  isLast:false,   value: user.name});
            components.QElements.addPair({label:tr.tr({'module': 'APView','phrase':"Surname",'lang':l}),  divToAdd: frmEdit.domNode,inpName:'surname',    inpRequired:false,  isLast:false,   value: user.surname});
           // components.QElements.addPair({label:'address',  divToAdd: frmEdit.domNode,inpName:'address',    inpRequired:false,  isLast:false,   value: user.address});
            components.QElements.addTextArea({label:tr.tr({'module': 'APView','phrase':"Address",'lang':l}), divToAdd: frmEdit.domNode,inpName:'address', inpRequired:false,  isLast:false,   value: user.address });
            components.QElements.addPair({label:tr.tr({'module': 'APView','phrase':"Phone",'lang':l}),    divToAdd: frmEdit.domNode,inpName:'phone',      inpRequired:false,  isLast:false,   value: user.phone});
            components.QElements.addPair({label:tr.tr({'module': 'APView','phrase':"e-mail",'lang':l}),   divToAdd: frmEdit.domNode,inpName:'email',      inpRequired:false,  isLast:false,   value: user.email});
            components.QElements.addComboBox({label:tr.tr({'module': 'APView','phrase':"Language",'lang':l}),url:urlLanguages, divToAdd: frmEdit.domNode,inpName:'language',inpRequired:true, isLast:false,searchAttr: 'name',value: user.language_id});

            if(user.active == '0'){
                components.QElements.addCheckPair({label:tr.tr({'module': 'APView','phrase':"Activate",'lang':l}),divToAdd: frmEdit.domNode,inpName:'active',inpRequired:true,value: 'on',isLast: false});
            }else{
                components.QElements.addCheckPair({label:tr.tr({'module': 'APView','phrase':"Activate",'lang':l}),divToAdd: frmEdit.domNode,inpName:'active',checked:'checked',inpRequired:true,value: 'on',isLast: false});
            }

            var d=document.createElement('div');
            dojo.place(d,frmEdit.domNode);
                components.QElements.addMultiSelect({label:tr.tr({'module': 'APView','phrase':"Realms",'lang':l}),   divToAdd: d,inpName:'realms',          inpRequired:true, isLast:true, url: urlRealmList+user.id, id: 'contentAPViewRealm'+user.id });

             var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'APView','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnEdit.domNode,frmEdit.domNode);

            
                dojo.connect(btnEdit,'onClick',function(){

                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object

                        var realms ='';
                        var count = 0;
                        dojo.forEach(dijit.byId('contentAPViewRealm'+user.id).attr('value'), function(i){
                            realms = realms+count+'='+i+'&';
                            count++;
                        });

                        dojo.xhrPost({
                        url: urlAPEdit+realms,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    console.log(frmObj);
                                    //Check if we should update the Access Providers data store
                                    if(dijit.byId('contentAPViewGrid') != undefined){
                                        //--Get the item for this id
                                        dijit.byId('contentAPViewGrid').store.fetchItemByIdentity({
                                            identity:   user.id,
                                            onItem :    function(item, request) {
                                                            dijit.byId('contentAPViewGrid').store.setValue(item,'username',frmObj.username);
                                                            dijit.byId('contentAPViewGrid').store.setValue(item,'name',frmObj.name);
                                                            dijit.byId('contentAPViewGrid').store.setValue(item,'surname',frmObj.surname);
                                                            dijit.byId('contentAPViewGrid').store.setValue(item,'phone',frmObj.phone);
                                                            dijit.byId('contentAPViewGrid').store.setValue(item,'email',frmObj.email);
                                                            dijit.byId('contentAPViewGrid').store.setValue(item,'active',response.ap.active);
                                                            dijit.byId('contentAPViewGrid').store.setValue(item,'realms',response.ap.realms);
                                                        }
                                        });
                                    }

                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'APView','phrase':"Access Provider updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'APView','phrase':"Problems updating Access Provider",'lang':l})+'</b>','message',components.Const.toasterError);
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
