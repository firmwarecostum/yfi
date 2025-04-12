/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.PermanentGeneralProfile"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PermanentGeneralProfile"] = true;

dojo.provide('content.PermanentGeneralProfile');
dojo.require('components.Formatters');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Translator');

(function(){

    var cpgp                    = content.PermanentGeneralProfile;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;


    var urlProfileForUser       = components.Const.cake+'profiles/json_view_for_user/';
    var gridProfile;
    var userID;

    cpgp.create   = function(divParent,id){

        userID = id;
        console.log('Profile Detail');
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
                            { field: "profile", name: tr.tr({'module': 'PermanentGeneralProfile','phrase':"Profile",'lang':l}), width: 'auto' },
                            { field: "name", name: tr.tr({'module': 'PermanentGeneralProfile','phrase':"Attribute",'lang':l}), width: 'auto' },
                            { field: "type", name: tr.tr({'module': 'PermanentGeneralProfile','phrase':"Check/Reply",'lang':l}), width: 'auto',formatter: components.Formatters.CheckReply },
                            { field: "op", name: tr.tr({'module': 'PermanentGeneralProfile','phrase':"Operator",'lang':l}), width: 'auto' },
                            { field: "value", name: tr.tr({'module': 'PermanentGeneralProfile','phrase':"Value",'lang':l}), width:'auto',formatter: components.Formatters.Bold}
                        ];

                    gridProfile = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(gridProfile,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'PermanentGeneralProfile','phrase':"Result count",'lang':l})+": </b>"+ gridProfile.rowCount;
                        })

                  dojo.addClass(gridProfile.domNode,'divGrid');
                  dojo.place(gridProfile.domNode,cpExp.domNode);
                  gridProfile.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileReadStore({ url: urlProfileForUser+id+'/'+ts });
                  gridProfile.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
            //---- END Grid---------------
        },100);
    }

})();//(function(){

}

