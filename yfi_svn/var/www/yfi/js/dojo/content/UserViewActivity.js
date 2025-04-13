/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.UserViewActivity"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.UserViewActivity"] = true;

dojo.provide('content.UserViewActivity');
dojo.require('components.Formatters');
dojo.require("dojox.data.QueryReadStore");
dojo.require('components.Translator');
dojo.require('components.Common');


(function(){
    var cuva                    = content.UserViewActivity;

    var gridActivity;
    var userID;
    var tr                  = components.Translator; 
    var l                   = components.LoginLight.UserInfo.l_iso;

    var urlActUserActivity  = components.Const.cake+'permanent_users/json_actions_for_user_activity/';
    var urlUserActivity     = components.Const.cake+'permanent_users/json_view_activity/';
    var urlDeleteActivity   = components.Const.cake+'permanent_users/json_del_activity/';

    cuva.add   = function(divParent,id){

        userID = id
        console.log('Activity Detail');

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActUserActivity,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cuva[action_item.action],Id:userID});
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
                            { field: "mac",         name: tr.tr({'module': 'UserViewActivity','phrase':"MAC",'lang':l}),        width:'auto'},
                            { field: "ip",          name: tr.tr({'module': 'UserViewActivity','phrase':"IP",'lang':l}),         width:'auto'},
                            { field: "start_time",  name: tr.tr({'module': 'UserViewActivity','phrase':"Started",'lang':l}),    width:'auto'},
                            { field: "stop_time",   name: tr.tr({'module': 'UserViewActivity','phrase':"Stoped",'lang':l}),     width:'auto',formatter: components.Formatters.CheckForNull},
                            { field: "duration",    name: tr.tr({'module': 'UserViewActivity','phrase':"Duration",'lang':l}),   width:'auto',formatter: components.Formatters.Bold},
                            { field: "bytes_tx",    name: tr.tr({'module': 'UserViewActivity','phrase':"Data TX",'lang':l}),    width:'auto',formatter: components.Formatters.FormatOctets},
                            { field: "bytes_rx",    name: tr.tr({'module': 'UserViewActivity','phrase':"Data RX",'lang':l}),    width:'auto',formatter: components.Formatters.FormatOctets},
                            { field: "bytes_total", name: tr.tr({'module': 'UserViewActivity','phrase':"Data Total",'lang':l}), width:'auto',formatter: components.Formatters.FormatOctets}
                        ];

                    gridActivity = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(gridActivity,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'UserViewActivity','phrase':"Result count",'lang':l})+": </b>"+ gridActivity.rowCount;
                        })

                  dojo.addClass(gridActivity.domNode,'divGrid');
                  dojo.place(gridActivity.domNode,cpExp.domNode);
                  gridActivity.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojox.data.QueryReadStore({ url: urlUserActivity+userID+'/'+ts  });
                  gridActivity.setStore(jsonStore,{'mac':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);     
    }

    cuva.reload_activity     = function(){
        console.log("Reload Activity");
        var ts = Number(new Date());
        var jsonStore = new dojox.data.QueryReadStore({ url: urlUserActivity+userID+'/'+ts  });
        gridActivity.setStore(jsonStore,{'mac':'*'},{ignoreCase: true});
    }

    cuva.del_activity        = function(){

        console.log("Delete Activity");
        var items = gridActivity.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cuva.del_activity_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewActivity','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cuva.del_activity_confirm    =  function(){

        
        var items = gridActivity.selection.getSelected();

        if(items.length){
        
            dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewActivity','phrase':"Delete Activity records",'lang':l})+'</b>','message',components.Const.toasterInfo);
            var itemList =[];
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                    var id = gridActivity.store.getValue(selectedItem,'id');
                                    itemList.push(id);
                            }
                        });
            dojo.xhrGet({
                url: urlDeleteActivity+userID,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        //------------------------------------------------------
                        var ts = Number(new Date());
                        var jsonStore = new dojox.data.QueryReadStore({ url: urlUserActivity+userID+'/'+ts  });
                        gridActivity.setStore(jsonStore,{'mac':'*'},{ignoreCase: true});
                        //---------------------------------------------------
                        dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewActivity','phrase':"Delete Activity records Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
            });

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewActivity','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

})();//(function(){

}
