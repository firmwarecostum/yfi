/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if(!dojo._hasResource['content.ExpiryDates']){ 
dojo._hasResource['content.ExpiryDates'] = true;
dojo.provide('content.ExpiryDates');

dojo.require('dojox.grid.DataGrid');
dojo.require('dojox.data.QueryReadStore');
dojo.require('components.QElements');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var cc              = content.ExpiryDates;
    var urlcrCardIndex  = components.Const.cake+'expiry_changes/json_index/';
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
            components.QElements.addAction({Name:'Reload list',Type:'reload',Parent: divActions,Action:cc['reload']});
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

              var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);

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
                            { field: "username",    name: "Username",   width: 'auto',formatter: components.Formatters.Bold },
                            { field: "initiator",   name: "Initiator",  width: 'auto' },
                            { field: "cc_transaction_id",   name: "Credit Card transaction",  width: 'auto' },
                            { field: "old_value",   name: "Old Value",  width: 'auto', formatter: formatDate},
                            { field: "new_value",   name: "New Value",  width: 'auto', formatter: formatDate},
                            { field: "created",     name: "Created",    width: 'auto' }
                        ]; 

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));
                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                 
                  grid.startup();

                  dojo.connect(grid,'_onFetchComplete', function(){

                        divResults.innerHTML = "<b>"+tr.tr({'module': 'Accounts','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                  })

                cc.reload();
            //---- END Grid----------------
        },100);

    }

    cc.reload  = function(){
        var ts          = Number(new Date());
        var jsonStore   = new dojo.data.ItemFileReadStore({ url: urlcrCardIndex+ts });
        grid.setStore(jsonStore,{'username':'*'},{ignoreCase: true});
    }

    //=================================
    //Formatter to display values
    function formatDate(value){
        var d       = new Date(value*1000);
        return d.toString();
    }
    //===============================



})();//(function(){

}
