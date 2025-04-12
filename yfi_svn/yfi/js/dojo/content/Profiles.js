/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.Profiles"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Profiles"] = true;
dojo.provide("content.Profiles");

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('components.Translator');
dojo.require('components.Common');


(function(){
    var cp              = content.Profiles;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var urlRealmList    = components.Const.cake+'realms/json_index_list/';
    var urlTemplateList = components.Const.cake+'templates/json_index_list/';
    var urlProfileAdd   = components.Const.cake+'profiles/json_add/?';
    var urlProfileIndex = components.Const.cake+'profiles/json_index/?';
    var urlDelete       = components.Const.cake+'profiles/json_del/';
    var urlActProfiles  = components.Const.cake+'profiles/json_actions/';

    var gridProfiles;

    cp.create=function(divParent){

        console.log('Profile List');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');
            
            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActProfiles,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cp[action_item.action],Id:null});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);

                 var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
            //-----------------------------------------------------------

        dojo.place(divGridAction,divParent);


        setTimeout(function () {

            var contentBox = dojo.contentBox(divParent);
            console.log(contentBox);

            var hight = (contentBox.h-92)+'';
            var s = "height: "+hight+"px ; padding: 20px";
            console.log(s);

             var cpExp   =   new dijit.layout.ContentPane({
                                style:      s
                            },document.createElement("div"));
            dojo.place(cpExp.domNode,divParent);

            //----Grid Start----------------
                var layout = [
                                { field: "name", name: tr.tr({'module': 'Profiles','phrase':"Name",'lang':l}), width: 'auto' },
                                { field: "template", name: tr.tr({'module': 'Profiles','phrase':"Created From Template",'lang':l}), width: 'auto' },
                                { field: "available_to", name: tr.tr({'module': 'Profiles','phrase':"Available To",'lang':l}), width: 'auto' },
                                { field: "reply_attribute_count", name: tr.tr({'module': 'Profiles','phrase':"Reply Attribute Count",'lang':l}), width: 'auto' },
                                { field: "check_attribute_count", name: tr.tr({'module': 'Profiles','phrase':"Check Attribute Count",'lang':l}), width: 'auto' }
                            ];

                gridProfiles = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                 dojo.connect(gridProfiles,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'Profiles','phrase':"Result count",'lang':l})+": </b>"+ gridProfiles.rowCount;
                        })

                  dojo.addClass(gridProfiles.domNode,'divGrid');
                  dojo.place(gridProfiles.domNode,cpExp.domNode);
                  gridProfiles.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlProfileIndex+ts });
                  gridProfiles.setStore(jsonStore,{'name':'*'},{ignoreCase: true});

            //---- END Grid----------------

        },100);

    }

    cp.reload  = function(){
        var ts          = Number(new Date());
        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlProfileIndex+ts });
        gridProfiles.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
    }

    cp.add      = function(){

        //--Clean up is 2nd time round ----
        if(dijit.byId('contentProfilesAddRealms') != undefined){
            dijit.byId('contentProfilesAddRealms').destroyDescendants(true);
            dijit.byId('contentProfilesAddRealms').destroy(true);
        }
        //-------------------------------


        console.log("Add Profile");
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'Profiles','phrase':"Add Profile",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());

                components.QElements.addPair({label:tr.tr({'module': 'Profiles','phrase':"Name",'lang':l}),         divToAdd: frmAdd.domNode,inpName:'name',        inpRequired:true, isLast:false});
                components.QElements.addComboBox({label:tr.tr({'module': 'Profiles','phrase':"From Template",'lang':l}),divToAdd: frmAdd.domNode,url: urlTemplateList+ts,inpName:'template',inpRequired:true,isLast:false,searchAttr: 'name'});
                 if(components.LoginLight.UserInfo.group == components.Const.admin){       //Only Available to Administrators
                    components.QElements.addCheckPair({label:tr.tr({'module': 'Profiles','phrase':"Available to all",'lang':l}),divToAdd: frmAdd.domNode,inpName:'available_all',      inpRequired:true,checked: 'checked',value: 'on',isLast: false});
                }
                var d=document.createElement('div');
                dojo.place(d,frmAdd.domNode);
                    components.QElements.addMultiSelect({
                                                            label:      tr.tr({'module': 'Profiles','phrase':"Available only to",'lang':l}),   
                                                            divToAdd:   d,
                                                            inpName:    'realms',
                                                            inpRequired:true,
                                                            isLast:     true,
                                                            url:        urlRealmList,
                                                            id:         'contentProfilesAddRealms' 
                    });


                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Profiles','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        //We have to append a query string to the URL
                        var realms ='';
                        var count = 0;
                        dojo.forEach(dijit.byId('contentProfilesAddRealms').attr('value'), function(i){
                            realms = realms+count+'='+i+'&';
                            count++;
                        });

                        dojo.xhrPost({
                        url: urlProfileAdd+realms,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var newItem  = gridProfiles.store.newItem({
                                            id              : response.profile.id,
                                            name            : response.profile.name,
                                            template        : response.profile.template,
                                            available_to    : response.profile.available_to,
                                            reply_attribute_count     : response.profile.reply_attribute_count,
                                            check_attribute_count     : response.profile.check_attribute_count
                                    });
                                    gridProfiles.store.save();

                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Profiles','phrase':"Profile added OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Profiles','phrase':"Problems adding Profile",'lang':l})+'</b>','message',components.Const.toasterError);
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


    cp.del      = function(){
        console.log('Delete Profile');
        var items = gridProfiles.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cp.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Profiles','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cp.del_confirm      = function(){
        console.log("Remove Profile");
        cp.selectionWorker(gridProfiles,tr.tr({'module': 'Profiles','phrase':"Deleting Profiles",'lang':l}),urlDelete);
    }

    cp.selectionWorker     = function(grid,message,url){            //Takes a toaster message + an url to call with the list of selected users

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
            cp.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Profiles','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cp.doSelection    = function(grid,message,urlToCall,itemList){

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
                    
                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'Profiles','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }


     cp.edit   = function(){

        console.log("Edit action clicked");
        var items = gridProfiles.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = gridProfiles.store.getValue(selectedItem,'id');
                                var v_name  = gridProfiles.store.getValue(selectedItem,'name');
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Profiles','phrase':"Opening detail for",'lang':l})+' '+v_name+'</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/ProfileView", [id,v_name]);
                                console.log("Profile Profile with id "+id+" selected");
                            }
                        });
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Profiles','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }
})();//(function(){

}
