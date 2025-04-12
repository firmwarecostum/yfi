/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.PermanentGeneralServices"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PermanentGeneralServices"] = true;

dojo.provide('content.PermanentGeneralServices');
dojo.require('components.Formatters');
dojo.require('components.Translator');

(function(){
    var cuvs                    = content.PermanentGeneralServices;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var grid;
    var userID;

    var urlExtraServices        = components.Const.cake+'extra_services/json_index/';

    cuvs.create   = function(divParent,id){

        userID = id;
        console.log('Extra Services for', userID);

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
                components.QElements.addAction({Name:tr.tr({'module': 'PermanentGeneralUsage','phrase':"Reload Data",'lang':l}),Type:'reload',Parent: divActions,Action:cuvs['reload'],Id:null});
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
                            { field: "created",     name: tr.tr({'module': 'UserViewServices','phrase':"Date",'lang':l}), width:'auto'},
                            { field: "title",       name: tr.tr({'module': 'UserViewServices','phrase':"Title",'lang':l}), width:'auto',formatter: components.Formatters.Bold},
                            { field: "description", name: tr.tr({'module': 'UserViewServices','phrase':"Description",'lang':l}),   width:'auto'},
                            { field: "amount",      name: tr.tr({'module': 'UserViewServices','phrase':"Amount",'lang':l}), width:'auto',formatter: components.Formatters.Bold}
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'UserViewServices','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileReadStore({ url: urlExtraServices+userID+'/?'+ts  });
                  grid.setStore(jsonStore,{'title':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);
    }

    cuvs.reload     = function(){
        console.log("Reload Activity");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlExtraServices+userID+'/?'+ts  });
        grid.setStore(jsonStore,{'title':'*'},{ignoreCase: true});
    }
 
})();//(function(){

}

