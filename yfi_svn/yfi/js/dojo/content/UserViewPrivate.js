/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.UserViewPrivate"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.UserViewPrivate"] = true;

dojo.provide('content.UserViewPrivate');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');


(function(){
    var cuvp                    = content.UserViewPrivate;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var urlActUserPrivate       = components.Const.cake+'permanent_users/json_actions_for_user_private/';
    var urlPrivateForUser       = components.Const.cake+'permanent_users/json_private_attributes/';
    var urlVendors              = components.Const.cake+'templates/json_vendors/';
    var urlAttr                 = components.Const.cake+'templates/json_attributes_for_vendor/';
    var urlUserAddPrivate       = components.Const.cake+'permanent_users/json_add_private/';
    var urlDeletePrivate        = components.Const.cake+'permanent_users/json_del_private/';
    var urlUserEditPrivate      = components.Const.cake+'permanent_users/json_edit_private/';

    var gridPrivate;
    var userID;

    var data_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : '==', name: "==",selected:'selected' },
                { id : '=', name: "=" },
                { id : ':=', name: ":=" },
                { id : '+=', name: "+=" },
                { id : '!=', name: "!=" },  //'==', '=', ':=', '+=','!=','>','>=','<','<=','=~','!~','=*','!*'
                { id : '>', name: ">" },
                { id : '>=', name: ">=" },
                { id : '<', name: "<" },
                { id : '<=', name: "<=" },
                { id : '=~', name: "=~" },
                { id : '!~', name: "!~" },
                { id : '=*', name: "=*" },
                { id : '!*', name: "!*" }
            ]}};

    cuvp.addPrivate   = function(divParent,id){

        userID = id;
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActUserPrivate,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cuvp[action_item.action],Id:id});
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
                            { field: "name", name: tr.tr({'module': 'UserViewPrivate','phrase':"Attribute",'lang':l}), width: 'auto' },
                            { field: "type", name: tr.tr({'module': 'UserViewPrivate','phrase':"Check/Reply",'lang':l}), width: 'auto',formatter: components.Formatters.CheckReply },
                            { field: "op", name: tr.tr({'module': 'UserViewPrivate','phrase':"Operator",'lang':l}), width: 'auto' },
                            { field: "value", name: tr.tr({'module': 'UserViewPrivate','phrase':"Value",'lang':l}), width:'auto',formatter: components.Formatters.Bold}
                        ];

                    gridPrivate = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(gridPrivate,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'UserViewPrivate','phrase':"Result count",'lang':l})+": </b>"+ gridPrivate.rowCount;
                        })

                  dojo.addClass(gridPrivate.domNode,'divGrid');
                  dojo.place(gridPrivate.domNode,cpExp.domNode);
                  gridPrivate.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlPrivateForUser+id+'/'+ts  });
                  gridPrivate.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);
    }

     cuvp.add_private    = function(){

        //----Clean up first----------
        if(dijit.byId('contentUsersViewVendor') != undefined){
            dijit.byId('contentUsersViewVendor').destroyDescendants(true);
            dijit.byId('contentUsersViewVendor').destroy(true);
        }
        if(dijit.byId('contentUsersViewAttribute') != undefined){
            dijit.byId('contentUsersViewAttribute').destroyDescendants(true);
            dijit.byId('contentUsersViewAttribute').destroy(true);
        }
        //----------------------------

        var data_check_reply = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'Radcheck', name: tr.tr({'module': 'UserViewPrivate','phrase':"Check",'lang':l}),selected:'selected' },
                { id : 'Radreply', name: tr.tr({'module': 'UserViewPrivate','phrase':"Reply",'lang':l}) }
            ]}};

        
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'UserViewPrivate','phrase':"Add Private Attribute",'lang':l}),
                style: "width: 420px"
        });
        var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
                    hiddenId.type   = "hidden";
                    hiddenId.name   = "id";
                    hiddenId.value  = userID;
                dojo.place(hiddenId,frmAdd.domNode);

                components.QElements.addComboBox({ label:tr.tr({'module': 'UserViewPrivate','phrase':"Vendor",'lang':l}),url:urlVendors, divToAdd: frmAdd.domNode,inpName:'vendor',inpRequired:true, isLast:false,searchAttr:'name',value: 0,id:'contentUsersViewVendor'});
                components.QElements.addComboBox({ label:tr.tr({'module': 'UserViewPrivate','phrase':"Attribute",'lang':l}),url:urlAttr+'Misc', divToAdd: frmAdd.domNode,inpName:'attribute',inpRequired:true, isLast:false,searchAttr:'name',value: 0,id:'contentUsersViewAttribute'});
                components.QElements.addComboBox({ label:tr.tr({'module': 'UserViewPrivate','phrase':"Check/Reply",'lang':l}),data:data_check_reply, divToAdd: frmAdd.domNode,inpName:'check_reply',inpRequired:true, isLast:false,searchAttr:'name',value: 'Radcheck'});
                components.QElements.addComboBox({ label:tr.tr({'module': 'UserViewPrivate','phrase':"Operator",'lang':l}),data:data_op, divToAdd: frmAdd.domNode,inpName:'op',inpRequired:true, isLast:false,searchAttr:'name',value: '=='});
                components.QElements.addPair({label:tr.tr({'module': 'UserViewPrivate','phrase':"Value",'lang':l}), divToAdd: frmAdd.domNode,inpName:'value', inpRequired:true, isLast:true});

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'UserViewPrivate','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(dijit.byId('contentUsersViewVendor'),'onChange',function(){    //Change the Attributes accordingly on changes of the vendor
                    var now_selected = dijit.byId('contentUsersViewVendor').getDisplayedValue();
                    var newAttrStore = new dojo.data.ItemFileReadStore({url: urlAttr+now_selected});
                    dijit.byId('contentUsersViewAttribute').attr('store',newAttrStore);
                    dijit.byId('contentUsersViewAttribute').attr('value',0);
                });


                dojo.connect(btnAdd,'onClick',function(){

                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        //Get the displayed vallue of the attribute select
                        var attr = dijit.byId('contentUsersViewAttribute').getDisplayedValue();

                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlUserAddPrivate+userID+'/'+attr,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var ts = Number(new Date());
                                    var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlPrivateForUser+userID+'/'+ts  });
                                    gridPrivate.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewPrivate','phrase':"Attribute added",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewPrivate','phrase':"Problems adding attribute",'lang':l})+'</b>','message',components.Const.toasterError);
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

    cuvp.edit_private    = function(id){

        //Get the id of the attribute that was selected
        var items = gridPrivate.selection.getSelected();

        if(items.length){

            if(items.length > 1){

                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewPrivate','phrase':"Edit selection limit to one",'lang':l})+'</b>','error',components.Const.toasterError);

            }else{

                //We can not edit the 'Cleartext-Password'
                var attribute   =  gridPrivate.store.getValue(items[0],'name');
                if(attribute == 'Cleartext-Password'){
                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewPrivate','phrase':"Change Password On Users Tab",'lang':l})+'</b>','error',components.Const.toasterError);
                    return;
                }

                //We can not edit the 'Expiration' attribute here
                if(attribute == 'Expiration'){
                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewPrivate','phrase':"Change Expiration on User Detail Tab",'lang':l})+'</b>','error',components.Const.toasterError);
                    return;
                }

                var attr_id     =  gridPrivate.store.getValue(items[0],'id');
                var op          =  gridPrivate.store.getValue(items[0],'op');
                var value       =  gridPrivate.store.getValue(items[0],'value');
               // console.log('Change Value for ',attribute,'id ',id);
                change_private_attribute({'id':id, 'attr_id':attr_id,'attribute': attribute,'op': op,'value':value});
            }

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewPrivate','phrase':"No Selection made",'lang':l}),'error',components.Const.toasterError);
        }

    }

   
    cuvp.del_private      = function(id){
        console.log("Remove Private Attribute");
        var items = gridPrivate.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cuvp.del_private_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewPrivate','phrase':"No Selection made",'lang':l}),'error',components.Const.toasterError);
        }
    }

    cuvp.del_private_confirm      = function(){

        cuvp.selectionWorker(gridPrivate,'Deleting Private Attribute(s)',urlDeletePrivate,userID);
    }

    cuvp.selectionWorker     = function(grid,message,url,id){            //Takes a toaster message + an url to call with the list of selected users

        var items = dijit.byId(grid).selection.getSelected();

        if(items.length){
            dijit.byId('componentsMainToaster').setContent(message,'message',components.Const.toasterInfo);
            var itemList =[];
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var attribute =  grid.store.getValue(selectedItem,'name');
                                if( (attribute != 'Cleartext-Password')&&
                                    (attribute != 'Expiration')&&
                                    (urlDeletePrivate == url)
                                ){       //We can not delete 'Cleartext-Password'
                                    var id = grid.store.getValue(selectedItem,'id');
                                    itemList.push(id);
                                }
                                
                            }
                        });
            cuvp.doSelection(grid,message,url,itemList,id);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewPrivate','phrase':"No Selection made",'lang':l}),'error',components.Const.toasterError);
        }
    }

    cuvp.doSelection    = function(grid,message,urlToCall,itemList,id){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        //------------------------------------------------------
                        var ts = Number(new Date());

                        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlPrivateForUser+userID+'/'+ts  });
                        grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
                        //---------------------------------------------------
                    
                        dijit.byId('componentsMainToaster').setContent(message+' '+Complete,'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

     function change_private_attribute(changeData){

        var dlgEdit  = new dijit.Dialog({
                title: tr.tr({'module': 'UserViewPrivate','phrase':"Edit Private Attribute",'lang':l})+' '+changeData.attribute,
                style: "width: 420px"
        });

        var frmEdit   = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
                    hiddenId.type   = "hidden";
                    hiddenId.name   = "id";
                    hiddenId.value  = changeData.attr_id;
                dojo.place(hiddenId,frmEdit.domNode);
       

                components.QElements.addComboBox({ label:tr.tr({'module': 'UserViewPrivate','phrase':"Operator",'lang':l}),data:data_op, divToAdd: frmEdit.domNode,inpName:'op',inpRequired:true, isLast:false,searchAttr:'name',value: changeData.op});
                components.QElements.addPair({label:tr.tr({'module': 'UserViewPrivate','phrase':"Value",'lang':l}), divToAdd: frmEdit.domNode,inpName:'value', inpRequired:true, isLast:true,value: changeData.value});

                var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'UserViewPrivate','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnEdit.domNode,frmEdit.domNode);


                dojo.connect(btnEdit,'onClick',function(){

                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlUserEditPrivate,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var ts = Number(new Date());
                                    var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlPrivateForUser+changeData.id+'/'+ts  });
                                    gridPrivate.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
                                    dlgEdit.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewPrivate','phrase':"Attribute changed",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewPrivate','phrase':"Problems changing attribute",'lang':l})+'</b>','message',components.Const.toasterError);
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

