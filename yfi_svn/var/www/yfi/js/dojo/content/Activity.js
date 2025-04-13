/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.Activity"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Activity"] = true;
dojo.provide("content.Activity");

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var ca              = content.Activity;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var urlActActivity  = components.Const.cake+'radaccts/json_actions';
    var urlActivityShow = components.Const.cake+'radaccts/json_show_active/';
    var urlAcctIndex    = components.Const.cake+'radaccts/json_show_active/?';
    var urlActivityRefresh  = components.Const.cake+'radaccts/json_show_active/1/?';
    var urlKickUsers    = components.Const.cake+'radaccts/json_kick_users_off/';
    var urlStopOpen     = components.Const.cake+'radaccts/json_stop_open/';
    var urlDoEdit       = components.Const.cake+'radaccts/json_return_type_and_id/';

    var grid;
    var t;  //Text box for filter
    var intervalID;
    var newStore;
    var query           = {'realm':'*'};

    ca.create  = function(divParent){


        //Connect the onclose of this tab to clear the refresh intervals
        dojo.connect(dijit.byId('contentWorkspaceActivity'),'onClose',function(){
            console.log('clear interval refresh');
            clearInterval(intervalID);
            return true;
        });


        //Create a toaster
        if(dijit.byId('componentsActivityToaster') == undefined){
            var tstrActivityToaster = new dojox.widget.Toaster({id: "componentsActivityToaster", positionDirection: "br-left", duration: "0", style:"display:hide"},document.createElement("div"));
        }

        var filteringSelect;

        console.log('Activity List');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActActivity,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:ca[action_item.action],Id:null});
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
            filter.innerHTML ='<b>'+tr.tr({'module': 'Activity','phrase':"Filter",'lang':l})+'</b>';
            dojo.place(filter, divGridAction);
            t = new dijit.form.TextBox({name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(t,'onKeyUp',function(e){
                    var filterOn = filteringSelect.attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = t.attr('value');

                    query = {'realm' : val+'*'};
                    if(filterOn == 'realm'){
                       query = {'realm' : val+'*'};
                    }
                    if(filterOn == 'nas'){
                       query = {'nas' : val+'*'};
                    }
                    if(filterOn == 'ip'){
                       query = {'ip' : val+'*'};
                    }
                    if(filterOn == 'username'){
                       query = {'username' : val+'*'};
                    }
                    grid.setQuery(query);
            });


            dojo.place(t.domNode, divGridAction);

            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'Activity','phrase':"Field",'lang':l})+'</b>';
            dojo.place(spanField,divGridAction);

                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'realm',    label: tr.tr({'module': 'Activity','phrase':"Realm",'lang':l}),selected:'selected' },
                                { id : 'nas',  label: tr.tr({'module': 'Activity','phrase':"NAS Device",'lang':l}) },
                                { id : 'ip',label: tr.tr({'module': 'Activity','phrase':"IP Address",'lang':l}) },
                                { id : 'username',label: tr.tr({'module': 'Activity','phrase':"Username",'lang':l}) }
                                ]}};
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            filteringSelect = new dijit.form.FilteringSelect({
                                                                    value   :"realm",
                                                                    name    :"field", 
                                                                    searchAttr: "name",
                                                                    store   :myNewStore,
                                                                    searchAttr  :"label",
                                                                    style: "width: 140px;"}, document.createElement("div"));

            dojo.place(filteringSelect.domNode,divGridAction);

            //--------------Update Part--------------------------
            var update = document.createElement('span');
            update.innerHTML ='<b>'+tr.tr({'module': 'Activity','phrase':"Refresh every",'lang':l})+'</b>';
            dojo.place(update, divGridAction);
            var inpNumber = new dijit.form.NumberSpinner({
                                    style: "width:100px",
                                    value: 100, //Change to 100 to lighten the load on the server
                                    smallDelta: 1,
                                    id: 'contentActivityInterval',
                                    intermediateChanges: true,
                                    constraints: { min:1, max:360, places:0 }
                            }, document.createElement("div") );

            dojo.place(inpNumber.domNode,divGridAction);
            dojo.connect(inpNumber,'onChange',function(){

                var new_val = inpNumber.value;
                console.log("New Interval value " + new_val);
                clearInterval(intervalID);
                intervalID = setInterval(doInterval, (new_val*1000));

            });
            //Start the initial Interval execution
            intervalID = setInterval(doInterval, (inpNumber.value*1000));

            var s = document.createElement('span');
            s.innerHTML ='<b> '+tr.tr({'module': 'Activity','phrase':"seconds",'lang':l})+'</b>';
            dojo.place(s, divGridAction);


            //----------------------------------------------------

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
                            { field: "realm",   name: tr.tr({'module': 'Activity','phrase':"Realm",'lang':l}), width: 'auto' },
                            { field: "nas",     name: tr.tr({'module': 'Activity','phrase':"NAS Device",'lang':l}), width: 'auto'},
                            { field: "ip",      name: tr.tr({'module': 'Activity','phrase':"IP Address",'lang':l}), width: 'auto'},
                            { field: "username", name: tr.tr({'module': 'Activity','phrase':"Username",'lang':l}), width: 'auto' },
                            { field: "connected",name: tr.tr({'module': 'Activity','phrase':"Duration",'lang':l}), width: 'auto',formatter: formatBold },
                            { field: "input_octets", name: tr.tr({'module': 'Activity','phrase':"Data RX",'lang':l}),formatter: formatOctets, width: 'auto' },
                            { field: "output_octets", name: tr.tr({'module': 'Activity','phrase':"Data TX",'lang':l}),formatter: formatOctets,  width: 'auto' },
                            { field: "total_octets", name: tr.tr({'module': 'Activity','phrase':"Data Total",'lang':l}),formatter: formatOctets,  width: 'auto' }
                        ];

                grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){
                             divResults.innerHTML = "<b>"+tr.tr({'module': 'Activity','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlAcctIndex+ts });
                  grid.setStore(jsonStore,query,{ignoreCase: true});
            //---- END Grid----------------
        },100);

    }


     function doInterval(){
        //------------
        if(dijit.byId('contentActivityInterval')==undefined){
             console.log("last of previous loop...just return");
             clearInterval(intervalID);
             return;
        }

        var status_now = dijit.byId('componentsMainStatus').domNode.innerHTML;
        dijit.byId('componentsMainStatus').domNode.innerHTML = tr.tr({'module': 'Activity','phrase':"Fetching latest",'lang':l})+' <b>'+tr.tr({'module': 'Activity','phrase':"Activity",'lang':l})+'</b> '+ tr.tr({'module': 'Activity','phrase':"data",'lang':l});

        //------------

        //Get a fresh store
        var ts = Number(new Date());
        var newStore = new dojo.data.ItemFileReadStore({ url: urlActivityRefresh+ts });
        ca.checkToRemove(newStore); //Check if there are old entries to remove
        //Loop through all
        newStore.fetch({onComplete: gotItems});

        function gotItems(items){

            dojo.forEach(items,function(item){

                var itemId          = newStore.getValue(item, "id");
                var timeOnline      = newStore.getValue(item, "connected");
                var input_octets    = newStore.getValue(item, "input_octets");
                var output_octets   = newStore.getValue(item, "output_octets");
                var total_octets    = newStore.getValue(item, "total_octets");
                //Update the existing one
                grid.store.fetchItemByIdentity({
                    identity: itemId,
                    onItem : function(i, request) {
                        if(i != null){
                          //  console.log("Item Found Update it");
                            grid.store.setValue(i,"connected",timeOnline);
                            grid.store.setValue(i,"input_octets",input_octets);
                            grid.store.setValue(i,"output_octets",output_octets);
                            grid.store.setValue(i,"total_octets",total_octets);
                            grid.store.save();
                            
                        }else{
                          //  console.log("Item not found ...add it")
                            console.log("Adding New Item");
                            dojo.xhrGet({
                            url: urlActivityShow+'?itemId='+itemId,
                            handleAs: "json",
                            load: function(response){
                                    if(response.json.status == 'ok'){
                                        console.log(response);
                                        var newId       = response.items[0].id;
                                        var realm       = response.items[0].realm;
                                        var nas         = response.items[0].nas;
                                        var ip          = response.items[0].ip;
                                        var username    = response.items[0].username;
                                        var connected   = response.items[0].connected;
                                        var oo          = response.items[0].output_octets;
                                        var io          = response.items[0].input_octets;
                                        var to          = response.items[0].total_octets;
                                        var voucher_id  = response.items[0].voucher_id;
                                        console.log("New Item "+newId+' '+realm+' '+nas+' '+ip+' '+io+' '+oo);
                                        var content = "<div class='divToast'><h2>"+username+" "+tr.tr({'module': 'Activity','phrase':"Joined Us",'lang':l})+"</h2><img src='img/actions/add_user.png' /></div>";
                                                dijit.byId('componentsActivityToaster').setContent(content,'message',5000);
                                        grid.store.newItem({
                                                                        id:newId,
                                                                        realm:realm,nas:nas,ip:ip,username:username,connected:connected,input_octets:io,output_octets:oo,total_octets:to,voucher_id: voucher_id });
                                        grid.store.save();
                                
                                    }

                                    if(response.json.status == 'error'){

                                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                    }
                                    
                                }
                            });

                        }

                    },
                    onError : function(i, request) {
                       // console.log("Nee Bra, daai ding is nie hier nie");
                    }
            });

          //  console.log("The id is "+itemId);

        })
         dijit.byId('componentsMainStatus').domNode.innerHTML = status_now;
    }
    
    
    }

    ca.reload  = function(){
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlAcctIndex+ts });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }


    ca.checkToRemove = function(latestStore){

        //Get the original list
        grid.store.fetch({onComplete: gotOldList});

        function gotOldList(items){
            
            dojo.forEach(items,function(item){  //Start Foreach

                //Get the ID of the item
                var itemId      = grid.store.getValue(item, "id");
                //Check if present in the new store
                latestStore.fetchItemByIdentity({
                                identity: itemId,
                                onItem : function(i) {
                                            if(i == null){  //The latest list knows not of this one - remove from write store
                                                var username = grid.store.getValue(item, "username");
                                                var content = "<div class='divToast'><h2>"+username+" "+tr.tr({'module': 'Activity','phrase':"Left Us",'lang':l})+"</h2><img src='img/actions/remove_user.png' /></div>";
                                                dijit.byId('componentsActivityToaster').setContent(content,'warning',5000);
                                                grid.store.deleteItem(item);
                                                grid.store.save();
                                            }
                                        }
                            });

            }) //End Foreach
            
        }

    }

    ca.edit   = function(){
        console.log("Edit action clicked 2013");
        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {      
                                var username        = grid.store.getValue(selectedItem,'username');
                                ca.doEdit(username);  
                            }
                        });
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Activity','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ca.doEdit   = function(username){

        dojo.xhrGet({
            url: urlDoEdit+username,
            preventCache: true,
            handleAs: "json",
            load: function(response){
                var voucher_id  = undefined;
                var user_id     = undefined;

                if(response.json.status == 'ok'){
                    //See the type of item that was selected...
                    if(response.json.type == 'voucher'){
                        voucher_id = response.json.id;
                    }

                    if(response.json.type == 'user'){
                        user_id = response.json.id;
                    }
                    //Open accordingly...
                    if(voucher_id != undefined){
                        dijit.byId('componentsMainToaster').setContent(
                            '<b>'+tr.tr({'module': 'Activity','phrase':"Opening detail for",'lang':l})+' '+username+'</b>','message',components.Const.toasterInfo);
                        dojo.publish("/actions/VoucherView", [voucher_id,username]);
                        console.log("Voucher with id "+voucher_id+" selected");
                    }

                    if(user_id != undefined){
                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Activity','phrase':"Opening detail for",'lang':l})+' '+username+'</b>','message',components.Const.toasterInfo);
                        dojo.publish("/actions/UserView", [user_id,username]);
                            console.log("Permanet User with id "+user_id+" selected");
                    } 
                };

                if(response.json.status == 'error'){
                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                }
            }
        });



    }

    ca.kick      = function(){

        console.log('Kick selected users off');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(ca.kick_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Activity','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ca.kick_confirm      = function(){
        console.log("Remove Nas Device");
        var items = dijit.byId(grid).selection.getSelected();

        if(items.length){
            //---------------------------------------
            dijit.byId('componentsMainToaster').setContent("Attempt to kick off users",'message',components.Const.toasterInfo);
            var itemList =[];
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id = grid.store.getValue(selectedItem,'id');
                                itemList.push(id);
                            }
                        });
            //----------------------------------------

            //-------------------------------------
            dojo.xhrGet({
                url: urlKickUsers,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){
                    console.log(response);
                    if(response.json.status == 'ok'){
                        //User's kicked off - the radacct table should reflect it and the update should happen automatically
                        console.log("User Kick off action happened OK");
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
            });
            //------------------------------------------

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Activity','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    //=================================
    //Formatter to display values
    function formatBold(value){
        return "<div style='width:100%; height:100%;'><b>"+value+"</b></div>";
    }

     function formatOctets(value){
        var format_bytes = components.Formatters.numToBytes(value);
        return "<div style='width:100%; height:100%;'><b>"+format_bytes+"</b></div>";
    }
    //===============================



})();//(function(){

}
