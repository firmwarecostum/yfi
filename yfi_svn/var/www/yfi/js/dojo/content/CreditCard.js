/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if(!dojo._hasResource['content.CreditCard']){ 
dojo._hasResource['content.CreditCard'] = true;
dojo.provide('content.CreditCard');

dojo.require('dojox.grid.DataGrid');
dojo.require('dojox.data.QueryReadStore');
dojo.require('components.QElements');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var cc              = content.CreditCard;
    var urlActCrCard    = components.Const.cake+'cc_transactions/json_actions/';
    var urlcrCardIndex  = components.Const.cake+'cc_transactions/json_index/';
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;
    
    var longTimeout     = components.Const.longTimeout;

    var grid;
    var query           = {'username':'*'};

    cc.create=function(divParent){

        console.log('Credit Card Transaction List');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActCrCard,
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

            //-------------------Filter + Refresh------------------------
            var filter = document.createElement('span');
            filter.innerHTML ='<b>'+tr.tr({'module': 'Accounts','phrase':"Filter",'lang':l})+' </b>';
            dojo.place(filter, divGridAction);
            var t = new dijit.form.TextBox({name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(t,'onKeyUp',function(e){
                    var filterOn = filteringSelect.attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = t.attr('value');
                    query = {'username' : val+'*'};
                    if(filterOn == 'username'){
                       query = {'username' : val+'*'};
                    }
                    if(filterOn == 'realm'){
                       query = {'realm' : val+'*'};
                    }
                    grid.setQuery(query);
            });

            dojo.place(t.domNode, divGridAction);

            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'Accounts','phrase':"Field",'lang':l})+' </b>';
            dojo.place(spanField,divGridAction);

                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'username', label: tr.tr({'module': 'Accounts','phrase':"Username",'lang':l}),selected:'selected' },
                                { id : 'realm', label: tr.tr({'module': 'Accounts','phrase':"Realm",'lang':l}) }
                                ]}};
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            filteringSelect = new dijit.form.FilteringSelect({
                                                                    value   :"username",
                                                                    name    :"state",
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
                            { field: "realm",       name: "Realm",                      width: 'auto' },
                            { field: "username",    name: "Username",                   width: 'auto',formatter: components.Formatters.Bold },
                            { field: "amount",      name: "Amount",                     width: '60px' },    
                            { field: "ip_address",  name: "CC Provider IP Address",     width: 'auto' },   
                            {   field: "created",               name: "Date",           width: 'auto' },
                            {   field: "response_code",         name: "R-Code",         width: '60px' },
                            {   field: "response_reason_code",  name: "R-R-Code",       width: '60px' },
                            {   field: "response_reason_text",  name: "R-Text",         width: 'auto', formatter: formatTransaction }    
                
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));
                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                grid.canSort = function(index) {  //index is 1-based - Only Column one and two are sortable
                    if(Math.abs(index) == 1 || Math.abs(index) == 2) return true;
                        return false;
                }

                  grid.startup();

                  dojo.connect(grid,'_onFetchComplete', function(){

                        divResults.innerHTML = "<b>"+tr.tr({'module': 'Accounts','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                  })

                  var ts = Number(new Date());
                  var jsonStore = new dojox.data.QueryReadStore({ url: urlcrCardIndex+ts });
                  grid.setStore(jsonStore,query,{ignoreCase: true});
            //---- END Grid----------------
        },100);

    }

    cc.reload  = function(){
        var ts          = Number(new Date());
        var jsonStore   = new dojox.data.QueryReadStore({ url: urlcrCardIndex+ts });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }

    cc.view  = function(){
        console.log('View transactions');
        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = grid.store.getValue(selectedItem,'id');
                                var created = grid.store.getValue(selectedItem,'created');
                                dijit.byId('componentsMainToaster').setContent('<b>Opening Credit Card transaction detail</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/CreditCardView", [id,created]);
                                console.log("CC transaction with id "+id+" selected");
                            }
                        });
        }else{
            dijit.byId('componentsMainToaster').setContent('No Selection made','error',components.Const.toasterError);
        }
    }

    //=================================
    //Formatter to display values
    function formatTransaction(value,rowIndex){
        var response_code = grid.store.getValue(grid.getItem(rowIndex), 'response_code');
        if(response_code == 1){
            return "<div style='width:100%; height:100%; background-color:#acd87d; '><b>"+value+"</b></div>"
        }else{
            return "<div style='width:100%; height:100%; background-color:#f1644d; '><b>"+value+"</b></div>"
        }
    }
    //===============================



})();//(function(){

}
