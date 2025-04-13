/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if(!dojo._hasResource["content.PermanentGeneralCredits"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PermanentGeneralCredits"] = true;

dojo.provide('content.PermanentGeneralCredits');
dojo.require('components.Formatters');
dojo.require('components.Translator');

(function(){
    var cuvc                    = content.PermanentGeneralCredits;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var urlCredits		        = components.Const.cake+'credits/json_user_index/';
	var query           		= {'id':'*'};

    var grid;
    var userID;



    cuvc.create   = function(divParent,id){

        userID = id;
        console.log('Devices for', userID);

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

           //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
                components.QElements.addAction({Name:tr.tr({'module': 'Credits','phrase':"Reload Data",'lang':l}),Type:'reload',Parent: divActions,Action:cuvc['reload'],Id:null});
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
                            { field: "id",          name: tr.tr({'module': 'Credits','phrase':"Id",'lang':l}),      width: 'auto' },
                            { field: "expires",     name: tr.tr({'module': 'Credits','phrase':"Expiry date",'lang':l}),   width: 'auto'},
                            { field: "time",        name: tr.tr({'module': 'Credits','phrase':"Time",'lang':l}),   width: 'auto',formatter: components.Formatters.FormatTime },
                            { field: "data",        name: tr.tr({'module': 'Credits','phrase':"Data",'lang':l}),    width: 'auto',formatter: components.Formatters.FormatOctets}
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'Credits','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();
				  cuvc.reload();
            //---- END Grid----------------
        },100);

    }

    cuvc.reload     = function(){
        console.log("Reload Activity");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlCredits+userID+'/?'+ts  });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }

})();//(function(){

}

