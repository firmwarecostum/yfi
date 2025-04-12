/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.Users"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.

dojo._hasResource["content.Users"] = true;
dojo.provide("content.Users");

dojo.require('dojox.grid.DataGrid');
dojo.require('components.QElements');
dojo.require('dojox.data.QueryReadStore');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');


(function(){
    var cu     = content.Users;

    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var urlRealmList    = components.Const.cake+'realms/json_index_list';
    var urlProfileList  = components.Const.cake+'profiles/json_index';
    var urlUserIndex    = components.Const.cake+'permanent_users/json_index/';
    var urlActUsers     = components.Const.cake+'permanent_users/json_actions/';
    var urlUserAdd      = components.Const.cake+'permanent_users/json_add/AP/?';
    var urlRemove       = components.Const.cake+'permanent_users/json_del/';
    var urlDisable      = components.Const.cake+'permanent_users/json_disable/';
    var urlPassword     = components.Const.cake+'users/json_password';
    var urlMessage      = components.Const.cake+'permanent_users/json_send_message/';
    var urlLanguages    = components.Const.cake+'users/json_languages';

    var grid;
    var query           = {'username':'*'};

    var data_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'hard', name: tr.tr({'module': 'Users','phrase':"Hard",'lang':l}) },
                { id : 'soft', name: tr.tr({'module': 'Users','phrase':"Soft",'lang':l})},
				{ id : 'prepaid', name: tr.tr({'module': 'Users','phrase':"Prepaid",'lang':l})}
            ]}};

     var data_op_msg = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'email', name: tr.tr({'module': 'Users','phrase':"e-mail",'lang':l}) }
            ]}};


    cu.create  = function(divParent){

        console.log('Permanent Users List');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActUsers,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cu[action_item.action],Id:null});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

            //-------------------Filter + Refresh------------------------
            var filter = document.createElement('span');
            filter.innerHTML ='<b>'+tr.tr({'module': 'Users','phrase':"Filter",'lang':l})+'</b>';
            dojo.place(filter, divGridAction);
            var filter_val = new dijit.form.TextBox({name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(filter_val,'onKeyUp',function(e){
                    var filterOn = filter_on.attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = filter_val.attr('value');

                    query = {'username' : val+'*'};
                    if(filterOn == 'profile'){
                       query = {'profile' : val+'*'};
                    }
                    if(filterOn == 'creator'){
                       query = {'creator' : val+'*'};
                    }
                    if(filterOn == 'realm'){
                       query = {'realm' : val+'*'};
                    }
                    if(filterOn == 'data'){
                       query = {'data' : val+'*'};
                    }

                    if(filterOn == 'time'){
                       query = {'time' : val+'*'};
                    }
                    if(filterOn == 'status'){
                       query = {'status' : val+'*'};
                    }
                    grid.setQuery(query);
            });


            dojo.place(filter_val.domNode, divGridAction);

            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'Users','phrase':"Field",'lang':l})+'</b>';
            dojo.place(spanField,divGridAction);

                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'username',  label: tr.tr({'module': 'Users','phrase':"Username",'lang':l}),selected:'selected' },
                                { id : 'profile',   label: tr.tr({'module': 'Users','phrase':"Profile",'lang':l}) },
                                { id : 'creator',   label: tr.tr({'module': 'Users','phrase':"Creator",'lang':l}) },
                                { id : 'realm',     label: tr.tr({'module': 'Users','phrase':"Realm",'lang':l}) },
                                { id : 'data',      label: tr.tr({'module': 'Users','phrase':"Data",'lang':l}) },
                                { id : 'time',      label: tr.tr({'module': 'Users','phrase':"Time",'lang':l}) }
                                ]}};
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            var filter_on = new dijit.form.FilteringSelect({
                                                                    value   :"username",
                                                                    name    :"state", 
                                                                    searchAttr: "name",
                                                                    store   :myNewStore,
                                                                    searchAttr  :"label",
                                                                    style: "width: 140px;"}, document.createElement("div"));

            dojo.place(filter_on.domNode,divGridAction);
                var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
            //-----------------------------------------------------------
        dojo.place(divGridAction,divParent);

        setTimeout(function () {

            var contentBox = dojo.contentBox(divParent);
            console.log(contentBox);

            var hight = (contentBox.h-92)+'';
            var s = "height: "+hight+"px; padding: 20px;";
            console.log(s);

             var cpExp   =   new dijit.layout.ContentPane({
                                style:      s
                            },document.createElement("div"));
            dojo.place(cpExp.domNode,divParent);

            //----Grid Start----------------
                 var layout = [
                            { field: "username", name: tr.tr({'module': 'Users','phrase':"Username",'lang':l}), width: 'auto' },
                            { field: "profile", name: tr.tr({'module': 'Users','phrase':"Profile",'lang':l}), width: 'auto' },
                            { field: "creator", name: tr.tr({'module': 'Users','phrase':"Creator",'lang':l}), width: 'auto' },
                            { field: "realm", name: tr.tr({'module': 'Users','phrase':"Realm",'lang':l}), width: 'auto' },
                            { field: "data", name: tr.tr({'module': 'Users','phrase':"Data Usage",'lang':l}), width: 'auto',formatter: formatUsage },
                            { field: "time", name: tr.tr({'module': 'Users','phrase':"Time Usage",'lang':l}), width: 'auto',formatter: formatUsage },
                            { field: "active", name: tr.tr({'module': 'Users','phrase':"Active/Disabled",'lang':l}), formatter: formatStatus, width: '100px', sortDesc: true }
                        ];

                grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'Users','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojox.data.QueryReadStore({ url: urlUserIndex+ts });
                  grid.setStore(jsonStore,query,{ignoreCase: true});
            //---- END Grid----------------
        },100);
    }


     cu.add      = function(){
        console.log('Add Permanent User');
       
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'Users','phrase':"New Permanent User",'lang':l}),
                style: "width: 420px;"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());

            
                components.QElements.addPair({label:tr.tr({'module': 'Users','phrase':"Username",'lang':l}),      divToAdd: frmAdd.domNode,inpName:'username',    inpRequired:true,  isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Users','phrase':"Password",'lang':l}),     divToAdd: frmAdd.domNode,inpName:'password',    inpRequired:true,  isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Users','phrase':"Name",'lang':l}),         divToAdd: frmAdd.domNode,inpName:'name',        inpRequired:false, isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Users','phrase':"Surname",'lang':l}),      divToAdd: frmAdd.domNode,inpName:'surname',     inpRequired:false, isLast:false});
                components.QElements.addTextArea({label:tr.tr({'module': 'Users','phrase':"Address",'lang':l}), divToAdd: frmAdd.domNode,inpName:'address',      inpRequired:false, isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Users','phrase':"Phone",'lang':l}),        divToAdd: frmAdd.domNode,inpName:'phone',       inpRequired:false, isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Users','phrase':"e-mail",'lang':l}),  divToAdd: frmAdd.domNode,inpName:'email',       inpRequired:false, isLast:false});
                components.QElements.addCheckPair({label:tr.tr({'module': 'Users','phrase':"Activate",'lang':l}),divToAdd: frmAdd.domNode,inpName:'active',      inpRequired:true,checked: 'checked',value: 'on',isLast: false});
                components.QElements.addComboBox({      label:tr.tr({'module': 'Users','phrase':"Language",'lang':l}),url:urlLanguages, divToAdd: frmAdd.domNode,inpName:'language',inpRequired:true, isLast:false,searchAttr: 'name'});
                components.QElements.addComboBox({      label:tr.tr({'module': 'Users','phrase':"Realm",'lang':l}),url:urlRealmList, divToAdd: frmAdd.domNode,inpName:'realm',inpRequired:true, isLast:false,searchAttr: 'name'});
                components.QElements.addComboBox({      label:tr.tr({'module': 'Users','phrase':"Profile",'lang':l}),url:urlProfileList, divToAdd: frmAdd.domNode,inpName:'profile',inpRequired:true, isLast:false,searchAttr:'name'});
                components.QElements.addComboBox({ label:tr.tr({'module': 'Users','phrase':"Cap Type",'lang':l}),data:data_op, divToAdd: frmAdd.domNode,inpName:'cap',inpRequired:true, isLast:false,searchAttr:'name',value: 'hard'});

                components.QElements.addDateTextBox({ label:'Expires on',divToAdd: frmAdd.domNode,inpName:'expire_on',inpRequired:true,isLast:true});
                var wList = dijit.findWidgets(frmAdd.domNode);
                dojo.forEach(wList, function(item){
                    if(item.declaredClass == 'dijit.form.DateTextBox'){
                        //Set the date in the future
                        item.set('value', new Date("2017-01-01"));
                    }
                });

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Users','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                    
                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlUserAdd,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cu.reload();
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Users','phrase':"New Permanent User created OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    if(response.json.status == 'duplicates'){
                                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Users','phrase':"Duplicates - Change username",'lang':l})+'!</b>','error',components.Const.toasterError);
                                    }
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


    cu.reload  = function(){
        var ts          = Number(new Date());
        var jsonStore   = new dojox.data.QueryReadStore({ url: urlUserIndex+ts });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }

    cu.note     = function(){
        console.log("Add a note");
        var items       = grid.selection.getSelected();
        var user_list   = [];
        var counter     = 0;
        if(items.length){
            dojo.forEach(
            items,
            function(selectedItem) {

                if(selectedItem !== null) {
                    var id = grid.store.getValue(selectedItem,'id');
                    user_list[counter] = id;
                    counter = counter +1;
                }
            });
            //Pop up the note dialog with a list of users to add notes to
            dojo.require('content.Notes');
            dojo.addOnLoad(function(){
                content.Notes.add_to_list(user_list);
            });

        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Users','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cu.del      = function(){
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cu.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Users','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cu.del_confirm      = function(){
        var rl_function = cu.reload;
        components.Formatters.deleteWorker({'grid': grid,'message': tr.tr({'module': 'Users','phrase':"Removing Permanent Users",'lang':l}),'url':urlRemove,'reload': rl_function});
    }

    cu.edit      = function(){
        console.log('Edit Permanent User');
        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id          = grid.store.getValue(selectedItem,'id');
                                var username    = grid.store.getValue(selectedItem,'username');
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Users','phrase':"Opening detail for",'lang':l})+' '+username+'</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/UserView", [id,username]);
                                console.log("User with id "+id+" selected");
                            }
                        });
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Users','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cu.test_radius = function(){

        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
            items,
            function(selectedItem) {
                if(selectedItem !== null) {
                    var id = grid.store.getValue(selectedItem,'id');
                    dojo.require("content.RadiusTest");
                    dojo.addOnLoad(function(){
                        content.RadiusTest.testVoucherAuth('user',id);
                    });
                }
            });
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Users','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cu.disable  = function(){

        var items = grid.selection.getSelected();
        var itemList =[];

        if(items.length){
            dojo.forEach(
            items,
            function(selectedItem) {
                if(selectedItem !== null) {
                    var id = grid.store.getValue(selectedItem,'id');
                    itemList.push(id);
                }
            });

            //----Disable the list on server and reload the grid
             dojo.xhrGet({
                url: urlDisable,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        //------------------------------------------------------
                        cu.reload();
                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Users','phrase':"Permanent User(s) Disabled/Enabled OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                        //---------------------------------------------------
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
            });

        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Users','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


    
    cu.password  = function(){
        console.log("Change Password");
        //Check if only one item is selected
        var items = grid.selection.getSelected();
        if(items.length){

            //Only a single item can be edited
            if(items.length > 1){
                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Users','phrase':"Password Change selection limit to one",'lang':l})+'</b>','error',components.Const.toasterError);
                return;
            }

            var id          = grid.store.getValue(items[0],'id');
            var username    = grid.store.getValue(items[0],'username');
            var name        = grid.store.getValue(items[0],'name');
            var surname     = grid.store.getValue(items[0],'surname');

            //-------EDIT TEST PASSED---------
            console.log("Change Password");
            dlgPwd = new dijit.Dialog({
                title: tr.tr({'module': 'Users','phrase':"Change Password for",'lang':l})+" "+username,
                style: "width: 420px"
            });
                var frmPwd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                    var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
                    hiddenId.type   = "hidden";
                    hiddenId.name   = "id";
                    hiddenId.value  = id;
                dojo.place(hiddenId,frmPwd.domNode);

                    components.QElements.addPair({label:tr.tr({'module': 'Users','phrase':"New Password",'lang':l}), divToAdd: frmPwd.domNode,inpName:'password', inpRequired:true, isLast:true});
                    var btnPwd = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'Users','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));

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
                                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Users','phrase':"Password Changed OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
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
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Users','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cu.message  = function(){

        var items = grid.selection.getSelected();

        var itemList =[];

        if(items.length){
            dojo.forEach(
            items,
            function(selectedItem) {
                if(selectedItem !== null) {
                    var id = grid.store.getValue(selectedItem,'id');
                    itemList.push(id);
                }
            });

            //-------EDIT TEST PASSED---------
            console.log("Send Message");
            dlgMsg = new dijit.Dialog({
                title: tr.tr({'module': 'Users','phrase':"Send message to users",'lang':l}),
                style: "width: 420px"
            });
                var frmMsg    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                    components.QElements.addComboBox({ label:tr.tr({'module': 'Users','phrase':"Message Type",'lang':l}),data:data_op_msg, divToAdd: frmMsg.domNode,inpName:'type',inpRequired:true, isLast:false,searchAttr:'name',value: 'email'});
                    components.QElements.addPair({label:tr.tr({'module': 'Users','phrase':"Subject",'lang':l}),      divToAdd: frmMsg.domNode,inpName:'subject',     inpRequired:true, isLast:false});
                    components.QElements.addTextArea({label:tr.tr({'module': 'Users','phrase':"Message",'lang':l}),  divToAdd: frmMsg.domNode,inpName:'message',     inpRequired:true, isLast:true});
                    var btnMsg = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'Users','phrase':"OK",'lang':l}),iconClass:"okIcon"},document.createElement("div"));

                //-----------------------------------
                dojo.connect(btnMsg,'onClick',function(){

                    if(frmMsg.validate()){
                        console.log('Form is valid...');

                        var frmObj = dojo.formToObject(frmMsg.domNode); //Convert the Form to an object

                        dojo.xhrPost({
                            url: urlMessage+'?'+dojo.objectToQuery(itemList),
                            content: frmObj,
                            handleAs: "json",
                            load: function(response){
                                    if(response.json.status == 'ok'){
                                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Users','phrase':"Message send OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
                                        dlgMsg.destroyRecursive(false); //Destroy the dialog
                                    }
                                    if(response.json.status == 'error'){
                                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                    }
                                },
                             error : function(response, ioArgs) {
                                        dijit.byId('componentsMainToaster').setContent(response.message,'error');
                                        console.log("error", response, ioArgs);
                                    }
                        });
                    }
                });
                //------------------------------------

                dojo.place(btnMsg.domNode,frmMsg.domNode);
            dlgMsg.attr('content',frmMsg);
            dlgMsg.show();
            //-------------------------------

        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Users','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }

    }

    function formatStatus(value){
        if(value == this.value){
            return value;
        }
        switch(value){
            case '1':
                return "<div style='widgth:100%; height:100%; background-color:#c2e5c8'><b>"+tr.tr({'module': 'Users','phrase':"Active",'lang':l})+"</b></div>";
            case '0':
                return "<div style='widgth:100%; height:100%; background-color:#fbdeb9;'><b>"+tr.tr({'module': 'Users','phrase':"Disabled",'lang':l})+"</b></div>";
        }
    }

    function formatUsage(value){
        if(value != 'NA'){
           return "<b>"+value+" %</b>";
        }
        return value;
    }


})();//(function(){

}
