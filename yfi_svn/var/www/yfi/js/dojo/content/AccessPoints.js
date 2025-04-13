/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.AccessPoints"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.AccessPoints"] = true;
dojo.provide('content.AccessPoints');

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var cap             = content.AccessPoints;
    var grid;
    var query           = {'nasname':'*'};
    var urlActAP        = components.Const.cake+'access_points/json_actions/';
    var urlAPIndex      = components.Const.cake+'access_points/json_index/?';
    var urlPower        = components.Const.cake+'access_points/json_power/';

    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var intervalID;
    var newStore;
    var statusNow;


    cap.create   =function(divParent){

        console.log('Create Access Point Grid!');

        if(dijit.byId('contentAccessPointsInterval') != undefined){
            dijit.byId('contentAccessPointsInterval').destroyDescendants(true);
            dijit.byId('contentAccessPointsInterval').destroy(true);
        }


        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActAP,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cap[action_item.action],Id:null});
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
            filter.innerHTML ='<b>'+tr.tr({'module': 'AccessPoints','phrase':"Filter",'lang':l})+'</b>';
            dojo.place(filter, divGridAction);
            var t = new dijit.form.TextBox({name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(t,'onKeyUp',function(e){
                    var filterOn = filteringSelect.attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = t.attr('value');
                    query = {'nasname' : val+'*'};
                    if(filterOn == 'nasname'){
                       query = {'nasname' : val+'*'};
                    }
                    if(filterOn == 'shortname'){
                       query = {'shortname' : val+'*'};
                    }
                    grid.setQuery(query);
            });

            dojo.place(t.domNode, divGridAction);

            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'AccessPoints','phrase':"Field",'lang':l})+'</b>';
            dojo.place(spanField,divGridAction);

                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'shortname', label: tr.tr({'module': 'AccessPoints','phrase':"Name",'lang':l}),selected:'selected' },
                                { id : 'nasname',   label: tr.tr({'module': 'AccessPoints','phrase':"IP Address",'lang':l}) }
                                ]}};
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            filteringSelect = new dijit.form.FilteringSelect({
                                                                    value   :"shortname",
                                                                    name    :"state",
                                                                    store   :myNewStore,
                                                                    searchAttr  :"label",
                                                                    style: "width: 140px;"}, document.createElement("div"));
            dojo.place(filteringSelect.domNode,divGridAction);

            //--------------Update Part--------------------------
            var update = document.createElement('span');
            update.innerHTML ='<b>'+tr.tr({'module': 'AccessPoints','phrase':"Refresh every",'lang':l})+'</b>';
            dojo.place(update, divGridAction);
            var inpNumber = new dijit.form.NumberSpinner({
                                    style: "width:100px",
                                    value: components.Const.defaultInterval,
                                    smallDelta: 1,
                                    id: 'contentAccessPointsInterval',
                                    intermediateChanges: true,
                                    constraints: { min:1, max:360, places:0 }
                            }, document.createElement("div") );

            dojo.place(inpNumber.domNode,divGridAction);
            dojo.connect(inpNumber,'onChange',function(){

                var new_val = inpNumber.value;
                console.log("New Interval value " + new_val);
                clearInterval(intervalID);
                intervalID = setInterval(cap._doInterval, (new_val*1000));

            });
            //Start the initial Interval execution
            intervalID = setInterval(cap._doInterval, (inpNumber.value*1000));

            var s = document.createElement('span');
            s.innerHTML ='<b> '+tr.tr({'module': 'AccessPoints','phrase':"seconds",'lang':l})+'</b>';
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
                            { field: "nasname",      name: tr.tr({'module': 'AccessPoints','phrase':"IP Address",'lang':l}),      width: 'auto' },
                            { field: "shortname",    name: tr.tr({'module': 'AccessPoints','phrase':"Name",'lang':l}),   width: 'auto',formatter: components.Formatters.Bold },
                            { field: "status",       name: tr.tr({'module': 'AccessPoints','phrase':"Status",'lang':l}),  width: 'auto', formatter: components.Formatters.formatStatus },
                            { field: "clients",      name: tr.tr({'module': 'AccessPoints','phrase':"Wireless Clients",'lang':l}),  width: 'auto' },
                            { field: "rogue",        name: tr.tr({'module': 'AccessPoints','phrase':"Rogue Warnings",'lang':l}),   width: 'auto', formatter: components.Formatters.warnAboveZero }
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
                        divResults.innerHTML = "<b>"+tr.tr({'module': 'AccessPoints','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                  })
                  cap.reload();
            //---- END Grid----------------
        },100);
    }

    cap.reload  = function(){
        var ts          = Number(new Date());
        var jsonStore   = new dojo.data.ItemFileWriteStore({ url: urlAPIndex+ts });
        grid.setStore(jsonStore,query,{ignoreCase: true});
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
                                var v_name  = grid.store.getValue(selectedItem,'nasname');
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccessPoints','phrase':'Opening detail for','lang':l})+ ' '+v_name+'</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/AccessPointView", [id,v_name]);
                            }
                        });
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccessPoints','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cap.power   = function(){

        console.log("Reboot Unit(s)");
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cap.power_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccessPoints','phrase':"No Selection made",'lang':l}),'error',components.Const.toasterError);
        }
    }

    cap._doInterval = function(){

        //------------
        if(dijit.byId('contentAccessPointsInterval')==undefined){
             console.log("last of previous loop...just return");
             clearInterval(intervalID);
             return;
        }
        status_now = dijit.byId('componentsMainStatus').domNode.innerHTML;
        dijit.byId('componentsMainStatus').domNode.innerHTML = tr.tr({'module': 'AccessPoints','phrase':'Fetching latest','lang':l})+' <b>'+tr.tr({'module': 'AccessPoints','phrase':'Access Points','lang':l})+'</b> info';

        //Get a fresh store
        var ts = Number(new Date());
        newStore = new dojo.data.ItemFileReadStore({ url: urlAPIndex+ts});
        cap._checkToRemove(newStore); //Check if there are old entries to remove

        newStore.fetch({onComplete: cap._gotItems});
        console.log("Fetched latest clients");
    }

    
    cap._checkToRemove = function(latestStore){

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
                                                grid.store.deleteItem(item);
                                                grid.store.save();
                                            }
                                        }
                            });

            }) //End Foreach
        }
    }

    cap._gotItems = function(items){

        dojo.forEach(items,function(item){
            var itemId     = newStore.getValue(item, "id");
            var st         = newStore.getValue(item, "status");
            var clients    = newStore.getValue(item, "clients");
            var rogue      = newStore.getValue(item, "rogue");
           // var conn       = newStore.getValue(item, "connected");
            grid.store.fetchItemByIdentity({
                    identity: itemId,
                    onItem : function(i, request) {
                        if(i != null){
                          //  console.log("Item Found Update it");
                            grid.store.setValue(i,"status",st);
                            grid.store.setValue(i,"clients",clients);
                            grid.store.setValue(i,"rogue",rogue);
                            grid.store.save();
                        }else{


                        }
                    }});
        });
    }

    cap.power_confirm      = function(){
        cap.selectionWorker(tr.tr({'module': 'AccessPoints','phrase':'Power Cycle AP unit(s)','lang':l}),urlPower);
    }

    cap.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

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
            cap.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccessPoints','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cap.doSelection    = function(grid,message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        cap.reload();
                        //---------------------------------------------------

                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'AccessPoints','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

})();//(function(){

}
