/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.PermanentGeneralPrivate"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PermanentGeneralPrivate"] = true;

dojo.provide('content.PermanentGeneralPrivate');
dojo.require('components.Formatters');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Translator');

(function(){
    var cpgp                    = content.PermanentGeneralPrivate;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var urlPrivateForUser       = components.Const.cake+'permanent_users/json_private_attributes/';
    var gridPrivate;
    var userID;

    cpgp.create    = function(divParent,id){

        userID = id;
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');
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
                            { field: "name", name: tr.tr({'module': 'PermanentGeneralPrivate','phrase':"Attribute",'lang':l}), width: 'auto' },
                            { field: "type", name: tr.tr({'module': 'PermanentGeneralPrivate','phrase':"Check/Reply",'lang':l}), width: 'auto',formatter: components.Formatters.CheckReply },
                            { field: "op", name: tr.tr({'module': 'PermanentGeneralPrivate','phrase':"Operator",'lang':l}), width: 'auto' },
                            { field: "value", name: tr.tr({'module': 'PermanentGeneralPrivate','phrase':"Value",'lang':l}), width:'auto',formatter: components.Formatters.Bold}
                        ];

                    gridPrivate = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(gridPrivate,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'PermanentGeneralPrivate','phrase':"Result count",'lang':l})+": </b>"+ gridPrivate.rowCount;
                        })

                  dojo.addClass(gridPrivate.domNode,'divGrid');
                  dojo.place(gridPrivate.domNode,cpExp.domNode);
                  gridPrivate.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileReadStore({ url: urlPrivateForUser+id+'/'+ts  });
                  gridPrivate.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
            //---- END Grid----------------

        },100);
    }
})();//(function(){

}
