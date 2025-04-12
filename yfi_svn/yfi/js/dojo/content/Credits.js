/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource['content.Credits']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['content.Credits'] = true;
dojo.provide('content.Credits');

dojo.require('dojox.grid.DataGrid');
dojo.require('dojox.data.QueryReadStore');
dojo.require('components.QElements');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var cc              = content.Credits;
    var urlActCredits   = components.Const.cake+'credits/json_actions/';
    var urlCreditsIndex = components.Const.cake+'credits/json_index/';
    var urlCreditsAdd   = components.Const.cake+'credits/json_add/';
    var urlRealmList    = components.Const.cake+'realms/json_index_list';
    var urlUserList     = components.Const.cake+'permanent_users/json_prepaid_list/';
    var urlCreditAtt    = components.Const.cake+'credits/json_attach/';
    var urlCreditView   = components.Const.cake+'credits/json_view/';
    var urlCreditEdit   = components.Const.cake+'credits/json_edit/';
    var urlDelete       = components.Const.cake+'credits/json_del/';

    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    

    var grid;
    var time            = 'past_week'    //Can be any_time, past_hour, past_day, past_week, past_month
    var query           = {'id':'*','time':time};


    var data_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'kb', name: tr.tr({'module': 'Credits','phrase':"Kb",'lang':l}) },
                { id : 'mb', name: tr.tr({'module': 'Credits','phrase':"Mb",'lang':l}) },
                { id : 'gb', name: tr.tr({'module': 'Credits','phrase':"Gb",'lang':l}) }
            ]}};

     var time_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'm', name: tr.tr({'module': 'Credits','phrase':"Minutes",'lang':l}) },
                { id : 'h', name: tr.tr({'module': 'Credits','phrase':"Hours",'lang':l}) },
                { id : 'd', name: tr.tr({'module': 'Credits','phrase':"Days",'lang':l}) }
            ]}};


    cc.create=function(divParent){

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActCredits,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cc[action_item.action],Id:null});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

            //--------Time Limit------------------------------------------
            var spanTime  = document.createElement('span');
            spanTime.innerHTML = '<b>'+tr.tr({'module': 'Vouchers','phrase':"Created",'lang':l})+'</b>';
            dojo.place(spanTime,divGridAction);

                var dTime = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'any_time',  label: tr.tr({'module': 'Vouchers','phrase':"Any time",'lang':l}),selected:'selected' },
                                { id : 'past_hour', label: tr.tr({'module': 'Vouchers','phrase':"Past hour",'lang':l})},
                                { id : 'past_day',  label: tr.tr({'module': 'Vouchers','phrase':"Past day",'lang':l}) },
                                { id : 'past_week', label: tr.tr({'module': 'Vouchers','phrase':"Past week",'lang':l}) },
                                { id : 'past_month',label: tr.tr({'module': 'Vouchers','phrase':"Past month",'lang':l}) }
                                ]}};
            var myTstore =new dojo.data.ItemFileReadStore(dTime);
            var filteringTime = new dijit.form.FilteringSelect({
                                                                    value   :"past_week",
                                                                    id      :"contentListVoucherTime",
                                                                    name    :"state", 
                                                                    searchAttr: "name",
                                                                    store   :myTstore,
                                                                    searchAttr  :"label",
                                                                    style: "width: 140px;"}, document.createElement("div"));
            dojo.place(filteringTime.domNode,divGridAction);
            dojo.connect(filteringTime,'onChange',function(value){
                query.time = value;
                grid.setQuery(query);
            });
            //------------------------------------------------------------



            //-------------------Filter + Refresh------------------------
            var filter = document.createElement('span');
            filter.innerHTML ='<b>'+tr.tr({'module': 'Credits','phrase':"Filter",'lang':l})+' </b>';
            dojo.place(filter, divGridAction);
            var t = new dijit.form.TextBox({name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(t,'onKeyUp',function(e){
                    var filterOn = filteringSelect.attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = t.attr('value');
                    var time = query.time;
                    query = {'id' : val+'*'};
                    if(filterOn == 'id'){
                       query = {'id' : val+'*'};
                    }
                    if(filterOn == 'realm'){
                       query = {'realm' : val+'*'};
                    }
                    if(filterOn == 'expires'){
                       query = {'expires' : val+'*'};
                    }
                    if(filterOn == 'creator'){
                       query = {'creator' : val+'*'};
                    }
                    if(filterOn == 'attached'){
                       query = {'attached' : val+'*'};
                    }
                    //Add time again to the query
                    query.time = time; 
                    grid.setQuery(query);
            });

            dojo.place(t.domNode, divGridAction);
          
            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'Credits','phrase':"Field",'lang':l})+' </b>';
            dojo.place(spanField,divGridAction);
            
                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'id',        label: tr.tr({'module': 'Credits','phrase':"Id",'lang':l}),selected:'selected' },
                                { id : 'realm',     label: tr.tr({'module': 'Credits','phrase':"Realm",'lang':l}) },
                                { id : 'expires',   label: tr.tr({'module': 'Credits','phrase':"Expiry date",'lang':l})},
                                { id : 'creator',   label: tr.tr({'module': 'Credits','phrase':"Creator",'lang':l}) },
                                { id : 'attached',  label: tr.tr({'module': 'Credits','phrase':"User",'lang':l}) }
                                ]}};
            
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            filteringSelect = new dijit.form.FilteringSelect({
                                                                    value   : "id",
                                                                    name    : "state",
                                                                    store   : myNewStore,
                                                                    searchAttr  :"label",
                                                                    style: "width: 140px;"}, document.createElement("div"));
            dojo.place(filteringSelect.domNode,divGridAction);
            

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
                            { field: "id",          name: tr.tr({'module': 'Credits','phrase':"Id",'lang':l}),      width: 'auto' },
                            { field: "realm",       name: tr.tr({'module': 'Credits','phrase':"Realm",'lang':l}),      width: 'auto' },
                            { field: "expires",     name: tr.tr({'module': 'Credits','phrase':"Expiry date",'lang':l}),   width: 'auto'},
                            { field: "creator",     name: tr.tr({'module': 'Credits','phrase':"Creator",'lang':l}),width: 'auto' },
                            { field: "time",        name: tr.tr({'module': 'Credits','phrase':"Time",'lang':l}),   width: 'auto',formatter: components.Formatters.FormatTime },
                            { field: "data",        name: tr.tr({'module': 'Credits','phrase':"Data",'lang':l}),    width: 'auto',formatter: components.Formatters.FormatOctets},
                            { field: "attached",    name: tr.tr({'module': 'Credits','phrase':"Attached to",'lang':l}),  width: 'auto' }
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));
                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);

                  grid.startup();

                  dojo.connect(grid,'_onFetchComplete', function(){

                        divResults.innerHTML = "<b>"+tr.tr({'module': 'Credits','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                  })

                 cc.reload();

            //---- END Grid----------------
        },100);

    }

    cc.reload  = function(){
        var ts          = Number(new Date());
        var jsonStore   = new dojox.data.QueryReadStore({ url: urlCreditsIndex+ts });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }

    cc.add      = function(){

     console.log('Add Internet Credit');
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'Credits','phrase':"Add Internet Credit",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());
                 components.QElements.addComboBox({      label:tr.tr({'module': 'Credits','phrase':"Realm",'lang':l}),url:urlRealmList, divToAdd: frmAdd.domNode,inpName:'realm',inpRequired:true, isLast:false,searchAttr: 'name'});
                 components.QElements.addDateTextBox({   label:tr.tr({'module': 'Credits','phrase':"Expiry date",'lang':l}),divToAdd: frmAdd.domNode,inpName:'expires',inpRequired:true,isLast:false,inpRequired:true});
                components.QElements.addNumberSpinner({ label:tr.tr({'module': 'Credits','phrase':"Data",'lang':l}),valShow:0,min:0,max:1000,divToAdd: frmAdd.domNode,inpName:'dat',isLast:false,inpRequired:true});
                components.QElements.addComboBox({ label:tr.tr({'module': 'Credits','phrase':"Unit",'lang':l}),data:data_op, divToAdd: frmAdd.domNode,inpName:'data_units',inpRequired:true, isLast:false,searchAttr:'name',value: 'mb'});
                components.QElements.addNumberSpinner({ label:tr.tr({'module': 'Credits','phrase':"Time",'lang':l}),valShow:0,min:0,max:60,divToAdd: frmAdd.domNode,inpName:'time',isLast:false,inpRequired:true});
                components.QElements.addComboBox({ label:tr.tr({'module': 'Credits','phrase':"Unit",'lang':l}),data:time_op, divToAdd: frmAdd.domNode,inpName:'time_units',inpRequired:true, isLast:true,searchAttr:'name',value: 'h'});

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Credits','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){
                   var ts = Number(new Date());
                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlCreditsAdd+'/?'+ts,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cc.reload();
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Internet Credit added OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Problems adding Internet Credit",'lang':l})+'</b>','message',components.Const.toasterError);
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

    cc.edit      = function(){

       console.log('Edit Internet Credit');
        var items = grid.selection.getSelected();
        if(items.length){
            //--------------------
            //Only a single item can be edited
            if(items.length > 1){
                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Edit of Internet Credit limited to one",'lang':l})+'</b>','error',components.Const.toasterError);
                return;
            }else{
                var ic_id        = grid.store.getValue(items[0],'id');
                dojo.xhrGet({
                    url: urlCreditView+ic_id,
                    preventCache: true,
                    handleAs: "json",
                    load: function(response){
                        if(response.json.status == 'ok'){
                            //------------------------------------------------------
                            _dlgEdit(response.internet_credit);
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
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Credits','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }


    }

    cc.attach   = function(){

        console.log('Attach Credit to User in Realm');
        var items = grid.selection.getSelected();
        if(items.length){
            //--------------------
            //Only a single item can be edited
            if(items.length > 1){
                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Attachment of Internet Credit limited to one",'lang':l})+'</b>','error',components.Const.toasterError);
                return;
            }else{
                var realm_id        = grid.store.getValue(items[0],'realm_id');
                var ic_id           = grid.store.getValue(items[0],'id');
                _dlgAttach(ic_id, realm_id);
            }
            //-------------------------

        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Credits','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

      function _dlgEdit(internet_credit){

        console.log('Dialog to edit credit');
        var dlgEdit  = new dijit.Dialog({
                title: tr.tr({'module': 'Credits','phrase':"Edit Internet Credit",'lang':l}),
                style: "width: 420px"
        });
            var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                components.QElements.addDateTextBox({   label:tr.tr({'module': 'Credits','phrase':"Expiry date",'lang':l}),divToAdd: frmEdit.domNode,inpName:'expires',inpRequired:true,isLast:false,inpRequired:true, value: internet_credit.expires});
                components.QElements.addNumberSpinner({ label:tr.tr({'module': 'Credits','phrase':"Data",'lang':l}),valShow:internet_credit.dat,min:0,max:1000,divToAdd: frmEdit.domNode,inpName:'dat',isLast:false,inpRequired:true});
                components.QElements.addComboBox({ label:tr.tr({'module': 'Credits','phrase':"Unit",'lang':l}),data:data_op, divToAdd: frmEdit.domNode,inpName:'data_units',inpRequired:true, isLast:false,searchAttr:'name',value: internet_credit.data_unit});
                components.QElements.addNumberSpinner({ label:tr.tr({'module': 'Credits','phrase':"Time",'lang':l}),valShow:internet_credit.time,min:0,max:60,divToAdd: frmEdit.domNode,inpName:'time',isLast:false,inpRequired:true});
                components.QElements.addComboBox({ label:tr.tr({'module': 'Credits','phrase':"Unit",'lang':l}),data:time_op, divToAdd: frmEdit.domNode,inpName:'time_units',inpRequired:true, isLast:true,searchAttr:'name',value: internet_credit.time_unit});

                var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Credits','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);

                dojo.connect(btnEdit,'onClick',function(){
                   var ts = Number(new Date());
                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlCreditEdit+internet_credit.id+'/?'+ts,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cc.reload();
                                    dlgEdit.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Internet Credit attached OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Problems attaching Internet Credit",'lang':l})+'</b>','message',components.Const.toasterError);
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


    function _dlgAttach(ic_id, realm_id){

        console.log('Dialog to attach credit');
        var dlgEdit  = new dijit.Dialog({
                title: tr.tr({'module': 'Credits','phrase':"Attach Internet Credit",'lang':l}),
                style: "width: 420px"
        });
            var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());

                components.QElements.addComboBox({  label:tr.tr({'module': 'Credits','phrase':"Prepaid user",'lang':l}),url:urlUserList+realm_id, divToAdd: frmEdit.domNode,inpName:'user',inpRequired:true, isLast:false,searchAttr: 'name'});

                var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Credits','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);

                dojo.connect(btnEdit,'onClick',function(){
                   var ts = Number(new Date());
                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlCreditAtt+ic_id+'/'+'/?'+ts,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cc.reload();
                                    dlgEdit.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Internet Credit attached OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Problems attaching Internet Credit",'lang':l})+'</b>','message',components.Const.toasterError);
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

    cc.del      = function(){

        console.log('Delete Internet Credit');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cc.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Credits','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cc.del_confirm      = function(){
        cc.selectionWorker(tr.tr({'module': 'Credits','phrase':'Deleting Internet Credit(s)','lang':l}),urlDelete);
    }

    cc.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

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
            cc.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Credits','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cc.doSelection    = function(grid,message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        cc.reload();
                        //---------------------------------------------------

                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'Credits','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

})();//(function(){

}
