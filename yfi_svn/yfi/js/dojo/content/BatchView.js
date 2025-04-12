/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource['content.BatchView']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['content.BatchView'] = true;
dojo.provide('content.BatchView');

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('components.QElements');
//dojo.require("dojox.data.QueryReadStore");
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var cbv             = content.BatchView;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;


    var urlActBatchView = components.Const.cake+'batches/json_actions_view/';
    var urlBatchView    = components.Const.cake+'batches/json_view/';

    var urlVoucherAdd   = components.Const.cake+'vouchers/json_add/';
    var urlVoucherIndex = components.Const.cake+'vouchers/json_index/';
    var urlRemove       = components.Const.cake+'vouchers/json_del/';

    //Variables who's scope is 'module' wide
    var filteringSelect;
    var grid;
    var batchId;


    cbv.create=function(divParent,id){

        console.log('Voucher List');
        //Set the module wide batchId
        batchId = id;


        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActBatchView,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cbv[action_item.action],Id:id});
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
            filter.innerHTML ='<b>'+tr.tr({'module': 'BatchView','phrase':"Filter",'lang':l})+'</b>';
            dojo.place(filter, divGridAction);
            var t = new dijit.form.TextBox({name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(t,'onKeyUp',function(e){
                    var filterOn = filteringSelect.attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = t.attr('value');

                    var query = {'username' : val+'*'};

                    if(filterOn == 'password'){
                       query = {'password' : val+'*'};
                    }

                    if(filterOn == 'profile'){
                       query = {'profile' : val+'*'};
                    }

                    if(filterOn == 'creator'){
                       query = {'creator' : val+'*'};
                    }
                    if(filterOn == 'realm'){
                       query = {'realm' : val+'*'};
                    }
                    if(filterOn == 'created'){
                       query = {'created' : val+'*'};
                    }
                    if(filterOn == 'status'){
                       query = {'status' : val+'*'};
                    }
                     
                    grid.setQuery(query);
            });


            dojo.place(t.domNode, divGridAction);

            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'BatchView','phrase':"Field",'lang':l})+'</b>';
            dojo.place(spanField,divGridAction);

                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'username',  label: tr.tr({'module': 'BatchView','phrase':"Voucher",'lang':l}),selected:'selected' },
                                { id : 'password',  label: tr.tr({'module': 'BatchView','phrase':"Password/Code",'lang':l}) },
                                { id : 'profile',   label: tr.tr({'module': 'BatchView','phrase':"Profile",'lang':l}) },
                                { id : 'creator',   label: tr.tr({'module': 'BatchView','phrase':"Creator",'lang':l}) },
                                { id : 'realm',     label: tr.tr({'module': 'BatchView','phrase':"Realm",'lang':l}) },
                                { id : 'created',   label: tr.tr({'module': 'BatchView','phrase':"Created",'lang':l}) }
                                ]}};
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            filteringSelect = new dijit.form.FilteringSelect({
                                                                    value   :"username",
                                                                    name    :"state", 
                                                                    searchAttr: "name",
                                                                    store   :myNewStore,
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
                            { field: "username", name: tr.tr({'module': 'BatchView','phrase':"Voucher",'lang':l}), width: 'auto' },
                            { field: "password", name: tr.tr({'module': 'BatchView','phrase':"Password/Code",'lang':l}), width: 'auto' },
                            { field: "profile", name: tr.tr({'module': 'BatchView','phrase':"Profile",'lang':l}), width: 'auto' },
                            { field: "creator", name: tr.tr({'module': 'BatchView','phrase':"Creator",'lang':l}), width: 'auto' },
                            { field: "realm", name: tr.tr({'module': 'BatchView','phrase':"Realm",'lang':l}), width: 'auto' },
                            { field: "created", name: tr.tr({'module': 'BatchView','phrase':"Created",'lang':l}), width: 'auto' },
                            { field: "status", name: tr.tr({'module': 'BatchView','phrase':"Status",'lang':l}), formatter: formatStatus, width: '100px', sortDesc: true }
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'BatchView','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlBatchView+batchId+'/'+ts });
                  grid.setStore(jsonStore,{'username':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);


    }

     cbv.reload  = function(){
        var ts          = Number(new Date());
        var jsonStore   = new dojo.data.ItemFileWriteStore({ url: urlBatchView+batchId+'/'+ts });
        grid.setStore(jsonStore,{'username':'*'},{ignoreCase: true});
    }


    cbv.test_radius = function(){

        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
            items,
            function(selectedItem) {
                if(selectedItem !== null) {
                    var id = grid.store.getValue(selectedItem,'id');
                    dojo.require("content.RadiusTest");
                    dojo.addOnLoad(function(){
                        content.RadiusTest.testVoucherAuth('voucher',id);
                    });
                }
            });
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'BatchView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


    cbv.del      = function(){
        console.log('Delete Vouchers');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cbv.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'BatchView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cbv.del_confirm   = function(){

        var items = grid.selection.getSelected();
        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'BatchView','phrase':"Removing Vouchers",'lang':l})+'</b>','message',components.Const.toasterInfo);
        var itemList =[];
        dojo.forEach(
            items,
            function(selectedItem) {
                if(selectedItem !== null) {
                    var id = grid.store.getValue(selectedItem,'id');
                    itemList.push(id);
                }
            });
        cbv.doSelectionRemove(itemList);
    }

    cbv.doSelectionRemove    = function(itemList){

         dojo.xhrGet({
                url: urlRemove,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        //------------------------------------------------------
                        var ts = Number(new Date());
                        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlBatchView+batchId+'/'+ts });
                        grid.setStore(jsonStore,{'username':'*'},{ignoreCase: true});
                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'BatchView','phrase':"Voucher(s) Removed OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                        //---------------------------------------------------
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cbv.edit      = function(){
        console.log('Edit Voucher');
        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = grid.store.getValue(selectedItem,'id');
                                var username    = grid.store.getValue(selectedItem,'username');
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'BatchView','phrase':"Opening detail for",'lang':l})+username+'</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/VoucherView", [id,username]);
                                console.log("Voucher with id "+batchId+" selected");
                            }
                        });
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'BatchView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


    function formatStatus(value){
        if(value == this.value){
            return value;
        }
        switch(value){
            case 'new':
                return "<div style='widgth:100%; height:100%; background-color:#c2e5c8'><b>"+tr.tr({'module': 'BatchView','phrase':value,'lang':l})+"</b></div>";
            case 'used':
                return "<div style='widgth:100%; height:100%; background-color:#b9e8fb;'><b>"+tr.tr({'module': 'BatchView','phrase':value,'lang':l})+"</b></div>";
            case 'depleted':
                return "<div style='widgth:100%; height:100%; background-color:#fbdeb9;'><b>"+tr.tr({'module': 'BatchView','phrase':value,'lang':l})+"</b></div>";
        }
    }


})();//(function(){

}
