/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.AccessProviders"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.AccessProviders"] = true;
dojo.provide("content.AccessProviders");

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var cap             = content.AccessProviders;
    var urlAPList       = components.Const.cake+'users/json_ap_index/Access Providers/?';
    var urlAPAdd        = components.Const.cake+'users/json_ap_add/AP/?';
    var urlRealmList    = components.Const.cake+'realms/json_index_list';
    var urlDelete       = components.Const.cake+'users/json_ap_del/';
    var urlPassword     = components.Const.cake+'users/json_password';
    var urlLanguages    = components.Const.cake+'users/json_languages';
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var grid;

     cap.create   =function(divParent){

        console.log('Access Providers List');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');
            
            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
                //Add the action stuff
                components.QElements.addAction({Name:tr.tr({'module': 'AccessProviders','phrase':"Reload List",'lang':l}),Type:'reload',Parent: divActions,Action:cap['reload'],Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'AccessProviders','phrase':"Change Password",'lang':l}),Type:'password',Parent: divActions,Action:cap.password,Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'AccessProviders','phrase':"Edit Selected",'lang':l}),Type:'edit',Parent: divActions,Action:cap.edit,Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'AccessProviders','phrase':"Add",'lang':l}),Type:'add',Parent: divActions,Action:cap.add,Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'AccessProviders','phrase':"Delete Selected",'lang':l}),Type:'delete',Parent: divActions,Action:cap.del,Id:null});
        dojo.place(divActions,divGridAction);

            //---Result Feedback----
             var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
            //---------------------------------

        dojo.place(divGridAction,divParent);
            //-----------------------------------------------------------


        setTimeout(function () {

            var contentBox = dojo.contentBox(divParent);
            console.log(contentBox);

            var hight = (contentBox.h-92)+'';
            var s = "height: "+hight+"px ; padding: 20px;";
            console.log(s);

             var cpExp   =   new dijit.layout.ContentPane({
                                style:      s
                            },document.createElement("div"));
            dojo.place(cpExp.domNode,divParent);

            //----Grid Start----------------
                 var layout = [
                                { field: "username",    name: tr.tr({'module': 'AccessProviders','phrase':"Username",'lang':l}),   width: 'auto' },
                                { field: "name",        name: tr.tr({'module': 'AccessProviders','phrase':"Name",'lang':l}),       width: 'auto' },
                                { field: "surname",     name: tr.tr({'module': 'AccessProviders','phrase':"Surname",'lang':l}),    width: 'auto' },
                                { field: "phone",       name: tr.tr({'module': 'AccessProviders','phrase':"Phone",'lang':l}),      width: 'auto' },
                                { field: "email",       name: tr.tr({'module': 'AccessProviders','phrase':"Email",'lang':l}),      width: 'auto' },
                                { field: "active",      name: tr.tr({'module': 'AccessProviders','phrase':"Active",'lang':l}),     width: 'auto' },
                                { field: "realms",      name: tr.tr({'module': 'AccessProviders','phrase':"Realms",'lang':l}),     width: 'auto' }
                            ];

                grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px',
                                escapeHTMLInData: false
                                }, document.createElement("div"));

                dojo.connect(grid,'_onFetchComplete', function(){
                             divResults.innerHTML = "<b>"+tr.tr({'module': 'AccessProviders','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                    })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  cap.reload();

                  
            //---- END Grid----------------

        },100);

    }

    cap.reload  = function(){

        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlAPList+ts });
        grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});

    }

    cap.add  = function(){

        //--Clean up is 2nd time round ----
         if(dijit.byId('contentAPAddRealms') != undefined){
            dijit.byId('contentAPAddRealms').destroyDescendants(true);
            dijit.byId('contentAPAddRealms').destroy(true);
        }
        //-------------------------------


        console.log("Add Access Provider");
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'AccessProviders','phrase':"Add Access Provider",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());

               
                components.QElements.addPair({label:tr.tr({'module': 'AccessProviders','phrase':"Username",'lang':l}),      divToAdd: frmAdd.domNode,inpName:'username',    inpRequired:true,  isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'AccessProviders','phrase':"Password",'lang':l}),     divToAdd: frmAdd.domNode,inpName:'password',    inpRequired:true,  isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'AccessProviders','phrase':"Name",'lang':l}),         divToAdd: frmAdd.domNode,inpName:'name',        inpRequired:false, isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'AccessProviders','phrase':"Surname",'lang':l}),      divToAdd: frmAdd.domNode,inpName:'surname',     inpRequired:false, isLast:false});
                components.QElements.addTextArea({label:tr.tr({'module': 'AccessProviders','phrase':"Address",'lang':l}), divToAdd: frmAdd.domNode,inpName:'address',      inpRequired:false, isLast:false});
                //components.QElements.addPair({label:'Address',      divToAdd: frmAdd.domNode,inpName:'address',     inpRequired:false, isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'AccessProviders','phrase':"Phone",'lang':l}),        divToAdd: frmAdd.domNode,inpName:'phone',       inpRequired:false, isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'AccessProviders','phrase':"e-mail",'lang':l}),       divToAdd: frmAdd.domNode,inpName:'email',       inpRequired:false, isLast:false});
                components.QElements.addComboBox({label:'Language',url:urlLanguages, divToAdd: frmAdd.domNode,inpName:'language',inpRequired:true, isLast:false,searchAttr: 'name'});
                components.QElements.addCheckPair({label:tr.tr({'module': 'AccessProviders','phrase':"Activate",'lang':l}),divToAdd: frmAdd.domNode,inpName:'active',      inpRequired:true,checked: 'checked',value: 'on',isLast: false});
                var d=document.createElement('div');
                dojo.place(d,frmAdd.domNode);
                    components.QElements.addMultiSelect({label:tr.tr({'module': 'AccessProviders','phrase':"Realms",'lang':l}),   divToAdd: d,inpName:'realms',          inpRequired:true, isLast:true, url: urlRealmList, id: 'contentAPAddRealms' });
                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'AccessProviders','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        //We have to append a query string to the URL
                        var realms ='';
                        var count = 0;
                        dojo.forEach(dijit.byId('contentAPAddRealms').attr('value'), function(i){
                            realms = realms+count+'='+i+'&';
                            count++;
                        });

                        dojo.xhrPost({
                        url: urlAPAdd+realms,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var newItem  = grid.store.newItem({
                                            id          : response.ap.id,
                                            username    : response.ap.username,
                                            name        : response.ap.name,
                                            surname     : response.ap.surname,
                                            phone       : response.ap.phone,
                                            email       : response.ap.email,
                                            active      : response.ap.active,
                                            realms      : response.ap.realms
                                    });
                                    grid.store.save();

                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccessProviders','phrase':"Access Provider added OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccessProviders','phrase':"Problems adding Access Provider",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){

                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                })

        dlgAdd.attr('content',frmAdd);
        dlgAdd.show();
    }

    cap.del      = function(){
        console.log('Delete Access Provider');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cap.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccessProviders','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cap.del_confirm  = function(){
        console.log("Remove Access Provider");
        cap.selectionWorker(tr.tr({'module': 'AccessProviders','phrase':'Deleting Access Providers','lang':l}),urlDelete);
    }

    cap.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

        var items = grid.selection.getSelected();

        if(items.length){
            dijit.byId('componentsMainToaster').setContent(message,'message',components.Const.toasterInfo);
            var itemList =[];
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id = grid.store.getValue(selectedItem,'id');
                                itemList.push(id);
                            }
                        });
            cap.doSelection(message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccessProviders','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cap.doSelection    = function(message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        if(urlToCall == urlDelete){     //Dirty hack to add a delete of the data store if successfull
                            var items = grid.selection.getSelected();
                            dojo.forEach(items, function(selectedItem){
                                if(selectedItem !== null){
                                    grid.store.deleteItem(selectedItem);
                                    grid.store.save();
                                }
                            });
                        }
                        //---------------------------------------------------
                    
                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'AccessProviders','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cap.edit   = function(){

        console.log("Edit action clicked");
        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = grid.store.getValue(selectedItem,'id');
                                var v_name  = grid.store.getValue(selectedItem,'username');
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccessProviders','phrase':"Opening detail for",'lang':l})+' '+v_name +'</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/APView", [id,v_name]);
                                console.log("Access Provider with id "+id+" selected");
                            }
                        });
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccessProviders','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


    cap.password  = function(){
        console.log("Change Password");
        //Check if only one item is selected
        var items = grid.selection.getSelected();
        if(items.length){

            //Only a single item can be edited
            if(items.length > 1){
                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccessProviders','phrase':'Password Change selection limit to one','lang':l})+'</b>','error',components.Const.toasterError);
                return;
            }

            var id          = grid.store.getValue(items[0],'id');
            var username    = grid.store.getValue(items[0],'username');
            var name        = grid.store.getValue(items[0],'name');
            var surname     = grid.store.getValue(items[0],'surname');

            //-------EDIT TEST PASSED---------
            console.log("Change Password");
            dlgPwd = new dijit.Dialog({
                title: tr.tr({'module': 'AccessProviders','phrase':"Change Password for",'lang':l})+' '+username+ ' ('+name+' '+surname+')',
                style: "width: 420px"
            });
                var frmPwd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                    var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
                    hiddenId.type   = "hidden";
                    hiddenId.name   = "id";
                    hiddenId.value  = id;
                dojo.place(hiddenId,frmPwd.domNode);

                    components.QElements.addPair({label:tr.tr({'module': 'AccessProviders','phrase':"New Password",'lang':l}), divToAdd: frmPwd.domNode,inpName:'password', inpRequired:true, isLast:true});
                    var btnPwd = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'AccessProviders','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));

                //-----------------------------------
                dojo.connect(btnPwd,'onClick',function(){

                    if(frmPwd.validate()){
                        console.log('Form is valid...');

                        var frmObj = dojo.formToObject(frmPwd.domNode); //Convert the Form to an object

                        dojo.xhrPost({
                            url: urlPassword,
                            content: frmObj,
                            handleAs: "json",
                            load: function(response){
                                    if(response.json.status == 'ok'){
                                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccessProviders','phrase':"Password Changed OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
                                        dlgPwd.destroyRecursive(false); //Destroy the dialog
                                    }
                                    if(response.json.status == 'error'){
                                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                    }
                                }
                        });
                    }
                });
                //------------------------------------

                dojo.place(btnPwd.domNode,frmPwd.domNode);
            dlgPwd.attr('content',frmPwd);
            dlgPwd.show();
            //-------------------------------

        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccessProviders','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }

    }


})();//(function(){

}
