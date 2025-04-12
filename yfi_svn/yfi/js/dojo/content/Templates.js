/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.Templates"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Templates"] = true;
dojo.provide("content.Templates");

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('components.QElements');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var ct              = content.Templates;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var urlRealmList    = components.Const.cake+'realms/json_index_list';
    var urlTemplateAdd  = components.Const.cake+'templates/json_add/?';
    var urlTemplateIndex = components.Const.cake+'templates/json_index/?';
    var urlDelete       = components.Const.cake+'templates/json_del/';
    var urlActTemplates = components.Const.cake+'templates/json_actions/';

    var grid;

    ct.create=function(divParent){

        console.log('Template List');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActTemplates,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:ct[action_item.action],Id:null});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

            //---Result Feedback----
             var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
            //---------------------------------

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
                                { field: "name", name: tr.tr({'module': 'Templates','phrase':"Name",'lang':l}), width: 'auto' },
                                { field: "available_to", name: tr.tr({'module': 'Templates','phrase':"Available To",'lang':l}), width: 'auto' },
                                { field: "reply_attribute_count", name: tr.tr({'module': 'Templates','phrase':"Reply Attribute Count",'lang':l}), width: 'auto' },
                                { field: "check_attribute_count", name: tr.tr({'module': 'Templates','phrase':"Check Attribute Count",'lang':l}), width: 'auto' }
                            ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                    dojo.connect(grid,'_onFetchComplete', function(){
                             divResults.innerHTML = '<b>'+tr.tr({'module': 'Templates','phrase':"Result count",'lang':l})+': </b>'+ grid.rowCount;
                    })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlTemplateIndex+ts });
                  grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);
    }

     ct.reload  = function(){

        var ts          = Number(new Date());
        var jsonStore   = new dojo.data.ItemFileWriteStore({ url: urlTemplateIndex+ts });
        grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
    }



    ct.add      = function(){

        //--Clean up is 2nd time round ----
        if(dijit.byId('contentTemplatesAddRealms') != undefined){
            dijit.byId('contentTemplatesAddRealms').destroyDescendants(true);
            dijit.byId('contentTemplatesAddRealms').destroy(true);
        }
        //-------------------------------


        console.log("Add Template");
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'Templates','phrase':"Add Profile Template",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());

                components.QElements.addPair({label:tr.tr({'module': 'Templates','phrase':"Name",'lang':l}),         divToAdd: frmAdd.domNode,inpName:'name',        inpRequired:true, isLast:false});
                if(components.LoginLight.UserInfo.group == components.Const.admin){       //Only Available to Administrators
                    components.QElements.addCheckPair({label:tr.tr({'module': 'Templates','phrase':"Available to all",'lang':l}),divToAdd: frmAdd.domNode,inpName:'available_all', inpRequired:true,checked: 'checked',value: 'on',isLast: false});
                }
                var d=document.createElement('div');
                dojo.place(d,frmAdd.domNode);
                    components.QElements.addMultiSelect({
                                                            label:      tr.tr({'module': 'Templates','phrase':"Available only to",'lang':l}),   
                                                            divToAdd:   d,
                                                            inpName:    'realms',
                                                            inpRequired:true,
                                                            isLast:     true,
                                                            url:        urlRealmList,
                                                            id:         'contentTemplatesAddRealms' 
                    });


                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Templates','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        //We have to append a query string to the URL
                        var realms ='';
                        var count = 0;
                        dojo.forEach(dijit.byId('contentTemplatesAddRealms').attr('value'), function(i){
                            realms = realms+count+'='+i+'&';
                            count++;
                        });

                        dojo.xhrPost({
                        url: urlTemplateAdd+realms,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){

                                    var newItem  = grid.store.newItem({
                                            id              : response.template.id,
                                            name            : response.template.name,
                                            available_to    : response.template.available_to,
                                            reply_attribute_count     : response.template.reply_attribute_count,
                                            check_attribute_count     : response.template.check_attribute_count
                                    });

                                    grid.store.save();

                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Templates','phrase':"Profile Template added OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Templates','phrase':"Problems adding Profile Template",'lang':l})+'</b>','message',components.Const.toasterError);
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

    ct.del      = function(){
        console.log('Delete Template');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(ct.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Templates','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ct.del_confirm      = function(){

        console.log("Remove Template");
        ct.selectionWorker(tr.tr({'module': 'Templates','phrase':"Deleting Templates",'lang':l}),urlDelete);
    }

    ct.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

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
            ct.doSelection(message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Templates','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ct.doSelection    = function(message,urlToCall,itemList){

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
                            var items = dijit.byId(grid).selection.getSelected();
                            dojo.forEach(items, function(selectedItem){
                                if(selectedItem !== null){
                                    grid.store.deleteItem(selectedItem);
                                    grid.store.save();
                                }
                            });
                        }
                        //---------------------------------------------------
                    
                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'Templates','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    }else{
                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Templates','phrase':"Problems removing Template(s)",'lang':l})+'</b>','message',components.Const.toasterError);
                    }
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }


     ct.edit   = function(){

        console.log("Edit action clicked");
        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = grid.store.getValue(selectedItem,'id');
                                var v_name  = grid.store.getValue(selectedItem,'name');
                                dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Templates','phrase':"Opening detail for",'lang':l})+' '+v_name,'message',components.Const.toasterInfo);
                                dojo.publish("/actions/TemplateView", [id,v_name]);
                                console.log("Profile Template with id "+id+" selected");
                            }
                        });
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Templates','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


})();//(function(){

}
