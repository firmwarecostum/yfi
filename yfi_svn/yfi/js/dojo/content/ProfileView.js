/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.ProfileView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.ProfileView"] = true;
dojo.provide("content.ProfileView");

dojo.require('components.Const');
dojo.require('components.QElements');

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.Tooltip');
dojo.require('components.Translator');
dojo.require('components.Formatters');
dojo.require('components.Common');


(function(){
    var ctv                 = content.ProfileView;
    var tr                  = components.Translator; 
    var l                   = components.LoginLight.UserInfo.l_iso;

    var urlEdit             = components.Const.cake+'profiles/json_edit/';
    var urlAttrEdit         = components.Const.cake+'profiles/json_attribute_change/';
    var urlDelete           = components.Const.cake+'profiles/json_attribute_delete/';
    var urlActProfileView   = components.Const.cake+'profiles/json_actions_view/';

    var profileId;
    var grid;

    ctv.create=function(divParent,id){

        //--------------------------------------
        //-- Container Hierarchy: divParent->divWrapper->cp.domNode->divTC->tc.domNode->[tab,tab,tab] 
        console.log("Profile Detail comming up...."+id);
        profileId = id;

       
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

             //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActProfileView,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:ctv[action_item.action],Id:id});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------


        dojo.place(divGridAction,divParent);
        //-------------------------------------------------------------

            //----------Info Button ---------------------
            var divInfo = document.createElement("div");
            //divInfo.id  = 'contentProfilesViewTT';
                var lin = new Image();
                lin.src = "img/actions/info.png";
                lin.align="left";
                lin.id  = 'contentProfilesViewTT'+id;
                dojo.place(lin,divInfo);
                var txt = document.createTextNode(tr.tr({'module': 'ProfileView','phrase':"Info Icon displays info on selected item",'lang':l}));
                dojo.place(txt,divInfo);
            dojo.place(divInfo,divGridAction);

            var tt = new dijit.Tooltip({
                connectId: ['contentProfilesViewTT'+id],
                label: "<b>"+tr.tr({'module': 'ProfileView','phrase':"Select",'lang':l})+"</b> "+tr.tr({'module': 'ProfileView','phrase':"a row in the grid",'lang':l})+"<br><b>"+tr.tr({'module': 'ProfileView','phrase':"Hover",'lang':l})+"</b> "+tr.tr({'module': 'ProfileView','phrase':"with the mouse over the info icon to display a tooltip on the",'lang':l})+' <i>'+tr.tr({'module': 'ProfileView','phrase':"Attribute",'lang':l})+'</i>'
            });
            //-------------------------------------------

            //---Result Feedback----
             var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
            //---------------------------------

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
                                { field: "name",        name: tr.tr({'module': 'ProfileView','phrase':"Attribute name",'lang':l}),     width: 'auto'},
                                { field: "type",        name: tr.tr({'module': 'ProfileView','phrase':"Check / Reply",'lang':l}),      width: 'auto',formatter: components.Formatters.CheckReply},
                                {   field:  "op",
                                    name:    tr.tr({'module': 'ProfileView','phrase':"Operator",'lang':l}),           
                                    width:  'auto', 
                                    editable: true,
                                    type:       dojox.grid.cells.Select,
                                    options: [ '==', '=', ':=', '+=','!=','>','>=','<','<=','=~','!~','=*','!*'],formatter: formatState, sortDesc: true },
                                { field: "value",   name:  tr.tr({'module': 'ProfileView','phrase':"Value",'lang':l}),   width: 'auto', editable: true, formatter: formatState, sortDesc: true},
                                { field: "unit",    name:  tr.tr({'module': 'ProfileView','phrase':"Units",'lang':l})}
                            ];

                    grid = new dojox.grid.DataGrid({
                                id: 'contentProfileViewGrid'+id,
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                    dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'ProfileView','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                    })


                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                 ctv.reload();

                dojo.connect(grid,'onRowClick',function(row){

                    var row_number = row.rowIndex;
                    grid.store.fetch({
                        start:    row_number,
                        count:    1,
                        onItem :    function(item){
                                        var tip_string = '<b>'+tr.tr({'module': 'ProfileView','phrase':"Attribute",'lang':l})+': </b>'+item.name+'<br><b>'+tr.tr({'module': 'ProfileView','phrase':"Description",'lang':l})+': </b>'+item.tt;
                                        tt.attr('label', tip_string);
                                    }

                    });
                })
            //---- END Grid----------------

            //=================================
            //Formatter to display values
            function formatState(value){
                return "<div style='width:100%; height:100%; background-color:#c2e5c8;'><b>"+value+"</b></div>";
            }
            //===============================

        },100);

        console.log("END Detail comming up...."+id);
    }

    ctv.reload  = function(){
        var ts          = Number(new Date());
        var jsonStore   = new dojo.data.ItemFileWriteStore({ url: urlEdit+profileId+'/?'+ts });
        jsonStore.onSet = function(item, attr, oldValue, newValue) {
                                        var itemId = jsonStore.getValue(item, "id");
                                        var update = newValue;
                                        console.log("Just modified the ", attr, "attribute for",  "New value is",update);
                                        changeAttributeValue(itemId,attr,update);
                                        /* Since children is a multi-valued attribute, oldValue and newValue are Arrays that
                                        you can iterate over and inspect though often times, you'll only send newValue to the
                                        server to log the update */
                                        }

        grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
    }

    function changeAttributeValue(itemId,column,new_value){

        dojo.xhrGet({
            url: urlAttrEdit,
            preventCache: true,
			content: {'id':itemId,'column': column,'new_value':new_value},
            handleAs: "json",
            load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'ProfileView','phrase':"Field",'lang':l})+' '+column+' '+tr.tr({'module': 'ProfileView','phrase':"updated to",'lang':l})+' '+new_value+'</b>','message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
            }
        });
    }

    ctv.del      = function(id){

        console.log('Delete Profile Attribute '+id);
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(ctv.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'ProfileView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ctv.del_confirm      = function(){

        console.log("Remove Attribute from Profile "+profileId);
        ctv.selectionWorker('<b>'+tr.tr({'module': 'ProfileView','phrase':"Deleting Attributes",'lang':l})+'</b>',urlDelete+profileId);
    }

    ctv.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

        var items = grid.selection.getSelected();

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
            ctv.doSelection(message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'ProfileView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ctv.doSelection    = function(message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        //------------------------------------------------------
                        var items = grid.selection.getSelected();
                        dojo.forEach(items, function(selectedItem){
                            if(selectedItem !== null){
                                grid.store.deleteItem(selectedItem);
                                grid.store.save();
                            }
                        });
                        //---------------------------------------------------
                    
                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'ProfileView','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

})();//(function(){

}
