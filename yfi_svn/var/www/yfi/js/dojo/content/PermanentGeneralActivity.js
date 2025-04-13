/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if(!dojo._hasResource["content.PermanentGeneralActivity"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PermanentGeneralActivity"] = true;

dojo.provide('content.PermanentGeneralActivity');
dojo.require('components.Formatters');
dojo.require("dojox.data.QueryReadStore");
dojo.require('components.Translator');


(function(){
    var cpga                    = content.PermanentGeneralActivity;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var gridActivity;
    var userID;
    var urlUserActivity         = components.Const.cake+'permanent_users/json_view_activity/';

    cpga.create   = function(divParent,id){
        userID = id
        console.log('Activity Detail');

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
                components.QElements.addAction({Name:tr.tr({'module': 'PermanentGeneralActivity','phrase':"Reload Data",'lang':l}),Type:'reload',Parent: divActions,Action:cpga['reload'],Id:null});
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
                            { field: "mac",         name: tr.tr({'module': 'PermanentGeneralActivity','phrase':"MAC",'lang':l}),        width:'auto'},
                            { field: "ip",          name: tr.tr({'module': 'PermanentGeneralActivity','phrase':"IP",'lang':l}),         width:'auto'},
                            { field: "start_time",  name: tr.tr({'module': 'PermanentGeneralActivity','phrase':"Started",'lang':l}),    width:'auto'},
                            { field: "stop_time",   name: tr.tr({'module': 'PermanentGeneralActivity','phrase':"Stoped",'lang':l}),     width:'auto',formatter: components.Formatters.CheckForNull},
                            { field: "duration",    name: tr.tr({'module': 'PermanentGeneralActivity','phrase':"Duration",'lang':l}),   width:'auto',formatter: components.Formatters.Bold},
                            { field: "bytes_tx",    name: tr.tr({'module': 'PermanentGeneralActivity','phrase':"Data TX",'lang':l}),    width:'auto',formatter: components.Formatters.FormatOctets},
                            { field: "bytes_rx",    name: tr.tr({'module': 'PermanentGeneralActivity','phrase':"Data RX",'lang':l}),    width:'auto',formatter: components.Formatters.FormatOctets},
                            { field: "bytes_total", name: tr.tr({'module': 'PermanentGeneralActivity','phrase':"Data Total",'lang':l}), width:'auto',formatter: components.Formatters.FormatOctets}
                        ];

                    gridActivity = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(gridActivity,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'PermanentGeneralActivity','phrase':"Result count",'lang':l})+": </b>"+ gridActivity.rowCount;
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

    cpga.reload     = function(){
        console.log("Reload Activity");
        var ts = Number(new Date());
        var jsonStore = new dojox.data.QueryReadStore({ url: urlUserActivity+userID+'/'+ts  });
        gridActivity.setStore(jsonStore,{'mac':'*'},{ignoreCase: true});
    }
})();//(function(){

}

