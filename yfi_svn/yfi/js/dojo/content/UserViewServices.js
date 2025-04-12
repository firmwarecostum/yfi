/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.UserViewServices"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.UserViewServices"] = true;

dojo.provide('content.UserViewServices');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var cuvs                    = content.UserViewServices;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var grid;
    var userID;

    var urlActUserServices      = components.Const.cake+'extra_services/json_actions/';
    var urlExtraServices        = components.Const.cake+'extra_services/json_index/';
    var urlServiceAdd           = components.Const.cake+'extra_services/json_add/';
    var urlDelete               = components.Const.cake+'extra_services/json_del/';
    var urlView                 = components.Const.cake+'extra_services/json_view/';
    var urlServiceEdit          = components.Const.cake+'extra_services/json_edit/';

    cuvs.create   = function(divParent,id){

        userID = id;
        console.log('Extra Services for', userID);

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActUserServices,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cuvs[action_item.action],Id:userID});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------
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
                            { field: "created",     name: tr.tr({'module': 'UserViewServices','phrase':"Date",'lang':l}), width:'auto'},
                            { field: "title",       name: tr.tr({'module': 'UserViewServices','phrase':"Title",'lang':l}), width:'auto',formatter: components.Formatters.Bold},
                            { field: "description", name: tr.tr({'module': 'UserViewServices','phrase':"Description",'lang':l}),   width:'auto'},
                            { field: "amount",      name: tr.tr({'module': 'UserViewServices','phrase':"Amount",'lang':l}), width:'auto',formatter: components.Formatters.Bold}
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'UserViewServices','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileReadStore({ url: urlExtraServices+userID+'/?'+ts  });
                  grid.setStore(jsonStore,{'title':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);
    }

    cuvs.reload     = function(){
        console.log("Reload Activity");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlExtraServices+userID+'/?'+ts  });
        grid.setStore(jsonStore,{'title':'*'},{ignoreCase: true});
    }

    cuvs.add        = function(){

        console.log('Add Extra Service');
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'UserViewServices','phrase':"Add Extra Service",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());
                components.QElements.addDateTextBox({   label:tr.tr({'module': 'UserViewServices','phrase':"Date",'lang':l}),divToAdd: frmAdd.domNode,inpName:'created',inpRequired:true,isLast:false,inpRequired:true});
                components.QElements.addPair({          label:tr.tr({'module': 'UserViewServices','phrase':"Title",'lang':l}),  divToAdd: frmAdd.domNode,inpName:'title',inpRequired:true, isLast:false});
                components.QElements.addTextArea({      label:tr.tr({'module': 'UserViewServices','phrase':"Description",'lang':l}), divToAdd: frmAdd.domNode,inpName:'description', inpRequired:true, isLast:false});
                components.QElements.addPair({          label:tr.tr({'module': 'UserViewServices','phrase':"Amount",'lang':l}), divToAdd: frmAdd.domNode,inpName:'amount',inpRequired:true, isLast:true});

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'UserViewServices','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){
                   var ts = Number(new Date());
                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlServiceAdd+userID+'/?'+ts,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cuvs.reload()
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewServices','phrase':"Extra service added OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewServices','phrase':"Problems adding extra service",'lang':l})+'</b>','message',components.Const.toasterError);
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

    cuvs.del      = function(){

        console.log('Delete Extra Service');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cuvs.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewServices','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cuvs.del_confirm      = function(){
        cuvs.selectionWorker(tr.tr({'module': 'UserViewServices','phrase':'Deleting Extra Service(s)','lang':l}),urlDelete);
    }

    cuvs.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

        var items = dijit.byId(grid).selection.getSelected();

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
            cuvs.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewServices','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cuvs.doSelection    = function(grid,message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        cuvs.reload();
                        //---------------------------------------------------

                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'UserViewServices','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }


    cuvs.edit   = function(){

        var items = grid.selection.getSelected();
        var extra_service_id;
        if(items.length){
            //--------------------
            //Only a single item can be edited
            if(items.length > 1){
                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewServices','phrase':"Edit of Extra Service Limited to one",'lang':l})+'</b>','error',components.Const.toasterError);
                return;
            }else{
                extra_service_id          = grid.store.getValue(items[0],'id');
                dojo.xhrGet({
                    url: urlView+extra_service_id,
                    preventCache: true,
                    handleAs: "json",
                    load: function(response){
                        if(response.json.status == 'ok'){
                            //------------------------------------------------------
                            _dlgEdit(response.extra_service);
                            //------------------------------------------------------
                        };
                        if(response.json.status == 'error'){
                                dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
                });
            }
            //-------------------------
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewServices','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

  

    function _dlgEdit(extra_service){

        console.log(extra_service);
        console.log('Edit Extra Service');
        var dlgEdit  = new dijit.Dialog({
                title: tr.tr({'module': 'UserViewServices','phrase':"Edit Extra Service",'lang':l}),
                style: "width: 420px"
        });
            var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());
                components.QElements.addDateTextBox({   label:tr.tr({'module': 'UserViewServices','phrase':"Date",'lang':l}),   divToAdd: frmEdit.domNode,inpName:'created',inpRequired:true,isLast:false,inpRequired:true, value: extra_service.created});
                components.QElements.addPair({          label:tr.tr({'module': 'UserViewServices','phrase':"Title",'lang':l}),  divToAdd: frmEdit.domNode,inpName:'title',inpRequired:true, isLast:false, value: extra_service.title});
                components.QElements.addTextArea({      label:tr.tr({'module': 'UserViewServices','phrase':"Description",'lang':l}), divToAdd: frmEdit.domNode,inpName:'description', inpRequired:true, isLast:false, value: extra_service.description});
                components.QElements.addPair({          label:tr.tr({'module': 'UserViewServices','phrase':"Amount",'lang':l}), divToAdd: frmEdit.domNode,inpName:'amount',inpRequired:true, isLast:true, value: extra_service.amount});

                var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'UserViewServices','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);

                dojo.connect(btnEdit,'onClick',function(){
                   var ts = Number(new Date());
                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlServiceEdit+extra_service.id+'/?'+ts,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cuvs.reload()
                                    dlgEdit.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewServices','phrase':"Extra service updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewServices','phrase':"Problems updating extra service",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){
                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                })
        dlgEdit.attr('content',frmEdit);
        dlgEdit.show();
    }


})();//(function(){

}

