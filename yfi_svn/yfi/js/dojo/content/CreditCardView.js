/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.CreditCardView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.CreditCardView"] = true;
dojo.provide("content.CreditCardView");

dojo.require('components.Const');
dojo.require('components.QElements');

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.Tooltip');
dojo.require('components.Translator');
dojo.require('components.Formatters');
dojo.require('components.Common');


(function(){
    var ccv                 = content.CreditCardView;
    var urlView             = components.Const.cake+'cc_transactions/json_view/';

    var ccTransactionId;
    var grid;

    ccv.create=function(divParent,id){

        //--------------------------------------
        //-- Container Hierarchy: divParent->divWrapper->cp.domNode->divTC->tc.domNode->[tab,tab,tab] 
        console.log("CC Transaction Detail comming up...."+id);
        ccTransactionId = id;

       
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

             //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            components.QElements.addAction({Name:'Reload list',Type:'reload',Parent: divActions,Action:ccv['reload'],Id:id});
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

                var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
        dojo.place(divGridAction,divParent);
        //-------------------------------------------------------------

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
                                { field: "name",    name: "Name",       width: 'auto'},
                                { field: "value",        name: 'Value', width: 'auto'}
                ];

                    grid = new dojox.grid.DataGrid({
                                id: 'contentCreditCardViewGrid'+id,
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                    dojo.connect(grid,'_onFetchComplete', function(){
                             divResults.innerHTML = "<b>Result count: </b>"+ grid.rowCount;
                    })

                dojo.addClass(grid.domNode,'divGrid');
                dojo.place(grid.domNode,cpExp.domNode);
                grid.startup();
                ccv.reload();
            //---- END Grid----------------
        },100);

        console.log("END Detail comming up...."+id);
    }

    ccv.reload  = function(){
        var ts          = Number(new Date());
        var jsonStore   = new dojo.data.ItemFileReadStore({ url: urlView+ccTransactionId+'/?'+ts });
        grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
    }
})();//(function(){

}
