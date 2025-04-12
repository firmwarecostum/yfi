/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.APViewClients"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.APViewClients"] = true;

dojo.provide('content.APViewClients');
dojo.require('components.Formatters');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Translator');


(function(){
    var capvc                   = content.APViewClients;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;


    var grid;
    var nasID;
    var query                   = {'mac':'*'};

    var urlActAPClients         = components.Const.cake+'access_points/json_actions_clients/';
    var urlAPClients            = components.Const.cake+'access_points/json_clients_index/';
    var intervalID;
    var newStore;
    var statusNow;

    capvc.create   = function(divParent,id){

        nasID = id;
        if(dijit.byId('contentAPClientInterval'+nasID) != undefined){
            dijit.byId('contentAPClientInterval'+nasID).destroyDescendants(true);
            dijit.byId('contentAPClientInterval'+nasID).destroy(true);
        }

        
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            divActions.id  = 'contentAPClient'+nasID;
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActAPClients,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:capvc[action_item.action],Id:nasID});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

            //--------------Update Part--------------------------
            var update = document.createElement('span');
            update.innerHTML ='<b>'+tr.tr({'module': 'APViewClients','phrase':"Refresh every",'lang':l})+'</b>';
            dojo.place(update, divGridAction);
            var inpNumber = new dijit.form.NumberSpinner({
                                    style: "width:100px",
                                    value: components.Const.defaultInterval,
                                    smallDelta: 1,
                                    id: 'contentAPClientInterval'+nasID,
                                    intermediateChanges: true,
                                    constraints: { min:1, max:360, places:0 }
                            }, document.createElement("div") );

            dojo.place(inpNumber.domNode,divGridAction);
            dojo.connect(inpNumber,'onChange',function(){

                var new_val = inpNumber.value;
                console.log("New Interval value " + new_val);
                clearInterval(intervalID);
                intervalID = setInterval(capvc._doInterval, (new_val*1000));

            });
            //Start the initial Interval execution
            intervalID = setInterval(capvc._doInterval, (inpNumber.value*1000));

            var s = document.createElement('span');
            s.innerHTML ='<b> '+tr.tr({'module': 'APViewClients','phrase':"seconds",'lang':l})+'</b>';
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
                            { field: "ssid",             name: tr.tr({'module': 'APViewClients','phrase':"SSID",'lang':l}),     width:'auto',formatter: components.Formatters.Bold},
                            { field: "mac",              name: tr.tr({'module': 'APViewClients','phrase':"MAC",'lang':l}),      width:'auto'},
                            { field: "channel",          name: tr.tr({'module': 'APViewClients','phrase':"Channel",'lang':l}),  width:'auto'},
                            { field: "rate",             name: tr.tr({'module': 'APViewClients','phrase':"Rate",'lang':l}),     width:'auto'},
                            { field: "rssi",             name: tr.tr({'module': 'APViewClients','phrase':"Quality",'lang':l}),  width:'auto'},
                            { field: "modified",         name: tr.tr({'module': 'APViewClients','phrase':"Last Seen",'lang':l}),width:'auto'}
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'APViewClients','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  capvc.reload();
            //---- END Grid----------------
        },100);
    }

    capvc.reload     = function(){
        console.log("Reload Clients");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlAPClients+nasID+'/?'+ts  });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }

    capvc._doInterval = function(){

        //------------
        if(dijit.byId('contentAPClientInterval'+nasID)==undefined){
             console.log("last of previous loop...just return");
             clearInterval(intervalID);
             return;
        }

        if(dojo.byId('contentAPClient'+nasID) == undefined){
             console.log("Sub-tabs destroyed...just return");
             clearInterval(intervalID);
             return;
        }

        status_now = dijit.byId('componentsMainStatus').domNode.innerHTML;
        dijit.byId('componentsMainStatus').domNode.innerHTML = tr.tr({'module': 'APViewClients','phrase':"Fetching latest",'lang':l})+' <b>'+tr.tr({'module': 'APViewClients','phrase':"Wireless Clients",'lang':l})+'</b> ';

        //Get a fresh store
        var ts = Number(new Date());
        newStore = new dojo.data.ItemFileReadStore({ url: urlAPClients+nasID+'/?'+ts});
        capvc._checkToRemove(newStore); //Check if there are old entries to remove

        newStore.fetch({onComplete: capvc._gotItems});
        console.log("Fetched latest clients");
    }

    capvc._checkToRemove = function(latestStore){

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

    capvc._gotItems = function(items){

        dojo.forEach(items,function(item){
            var itemId     = newStore.getValue(item, "id");
            var ssid       = newStore.getValue(item, "ssid");
            var mac        = newStore.getValue(item, "mac");
            var channel    = newStore.getValue(item, "channel");
            var rate       = newStore.getValue(item, "rate");
            var rssi       = newStore.getValue(item, "rssi");
            var modified   = newStore.getValue(item, "modified");
            grid.store.fetchItemByIdentity({
                    identity: itemId,
                    onItem : function(i, request) {
                        if(i != null){
                          //  console.log("Item Found Update it");
                            grid.store.setValue(i,"ssid",ssid);
                            grid.store.setValue(i,"channel",channel);
                            grid.store.setValue(i,"rate",rate);
                            grid.store.setValue(i,"rssi",rssi);
                            grid.store.setValue(i,"modified",modified);
                            grid.store.save();
                        }else{
                            grid.store.newItem({ 'id':itemId,'ssid':ssid,'mac':mac,'channel':channel,'rate':rate,'rssi':rssi,'modified':modified});
                            grid.store.save();
                        }
                    }});
        });
    }

})();//(function(){

}
