/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.TemplateView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.TemplateView"] = true;
dojo.provide("content.TemplateView");

dojo.require('components.Const');
dojo.require('components.QElements');

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('components.Translator');
dojo.require('components.Common');


(function(){
    var ctv                 = content.TemplateView;
    var tr                  = components.Translator; 
    var l                   = components.LoginLight.UserInfo.l_iso;

    var urlVendors          = components.Const.cake+'templates/json_vendors/';
    var urlAttr             = components.Const.cake+'templates/json_attributes_for_vendor/';
    var urlEdit             = components.Const.cake+'templates/json_edit/';
    var urlAttrAdd          = components.Const.cake+'templates/json_attr_add/';
    var urlAttrEdit         = components.Const.cake+'templates/json_attr_edit/';
    var urlDelete           = components.Const.cake+'templates/json_attr_delete/';
    var urlActTemplateView  = components.Const.cake+'templates/json_actions_view/';

    var templateID;
    var grid;

    ctv.create=function(divParent,id){

        //--------------------------------------
        //-- Container Hierarchy: divParent->divWrapper->cp.domNode->divTC->tc.domNode->[tab,tab,tab] 
        console.log("Template Detail comming up...."+id);
        templateID = id;

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

             //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActTemplateView,
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

            //------------------------------------
            var divSelect   = document.createElement('div');

                //-------Vendor------
                var spanVendor  = document.createElement('span');
                spanVendor.innerHTML = '<b>'+tr.tr({'module': 'TemplateView','phrase':"Vendor",'lang':l})+'</b>';
                dojo.place(spanVendor,divSelect);
                    var storeVendor  = new dojo.data.ItemFileReadStore({url: urlVendors});
         
                var inpVendor        = new dijit.form.FilteringSelect({store: storeVendor, value: 0, searchAttr: 'name'}, 
                                    document.createElement("div"));
                dojo.place(inpVendor.domNode,divSelect);
                dojo.connect(inpVendor,'onChange',function(e,f){    //Change the Attributes accordingly on changes of the vendor
                    var now_selected = inpVendor.getDisplayedValue();
                    var newAttrStore = new dojo.data.ItemFileReadStore({url: urlAttr+now_selected});
                    inpAttribute.attr('store',newAttrStore);
                    inpAttribute.attr('value',0);
                });

                //-------------------

                //-------Attribute------
                var spanAttribute  = document.createElement('span');
                spanAttribute.innerHTML = '<b>'+tr.tr({'module': 'TemplateView','phrase':"Attribute",'lang':l})+'</b>';
                dojo.place(spanAttribute,divSelect);
                    var storeAttr       = new dojo.data.ItemFileReadStore({url: urlAttr+'Misc'});
                var inpAttribute        = new dijit.form.FilteringSelect({store: storeAttr, searchAttr: 'name', value: 0}, 
                                    document.createElement("div"));
                dojo.place(inpAttribute.domNode,divSelect);
                //inpAttribute.attr('store',storeAttr);

                //-------------------

                //---Add Button ---
                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'TemplateView','phrase':"Add",'lang':l}),iconClass:"addIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,divSelect);
                dojo.connect(btnAdd,'onClick',function(){

                    //Get the current value the attribute
                    var attr_selected = inpAttribute.getDisplayedValue();
                    //add it to the grid's store
                    var newItem  = grid.store.newItem({
                                            id          : attr_selected,
                                            name        : attr_selected,
                                            tooltip     : tr.tr({'module': 'TemplateView','phrase':"--Tooltip Goes Here--",'lang':l}),
                                            type        : 'Check',
                                            unit       : 'Text String'
                                    });
                    grid.store.save();

                })
                //-------------------

                 //-------Attribute------
                var spanInfo  = document.createElement('span');
                spanInfo.innerHTML = '( '+tr.tr({'module': 'TemplateView','phrase':"Edit selected attribute inside grid",'lang':l})+' )';
                dojo.place(spanInfo,divSelect);
                //-------------------



            dojo.place(divSelect,divGridAction);
            //---------------------------------

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
                                { field: "name",        name: tr.tr({'module': 'TemplateView','phrase':"Attribute name",'lang':l}),  width: '15em'},
                                { field: "tooltip",     name: tr.tr({'module': 'TemplateView','phrase':"Tooltip text",'lang':l}),    width: 'auto', editable: true,formatter: formatState, sortDesc: true },
                                {   field:      "type", 
                                    name:       tr.tr({'module': 'TemplateView','phrase':"Check / Reply",'lang':l}),
                                    width:      '10em',
                                    editable:   true, 
                                    type:       dojox.grid.cells.Select,
                                    options:    [ 'Check', 'Reply' ],
                                    formatter:  formatState,
                                    sortDesc:   true  
                                },
                                { 
                                    field:      "unit",       
                                    name:       tr.tr({'module': 'TemplateView','phrase':"Units",'lang':l}),
                                    width:      '10em', 
                                    editable:   true, 
                                    type:       dojox.grid.cells.Select,
                                    options:    [ 'Text String', 'Bytes', 'Seconds', 'Bits/Second' ],
                                    formatter:  formatState,
                                    sortDesc:   true  
                                }
                            ];

                grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                ctv.reload();
            //---- END Grid----------------

            //=================================
            //Formatter to display values
            function formatState(value){
                return "<div style='widgth:100%; height:100%; background-color:#c2e5c8;'><b>"+value+"</b></div>";
            }
            //===============================


        },100);

        console.log("END Detail comming up...."+id);
    }

    ctv.reload      = function(){

        var ts              = Number(new Date());
        var jsonStore       = new dojo.data.ItemFileWriteStore({ url: urlEdit+templateID+'/?'+ts });

        jsonStore.onNew     = function(item) {
                                var itemName = jsonStore.getValue(item, "name");
                                console.log("Just added", itemName, "which had parent");
                                addAttribute(itemName,templateID);
                            }

        jsonStore.onSet     = function(item, attr, oldValue, newValue) {
                                    var itemName = jsonStore.getValue(item, "name");
                                    var update = newValue;
                                    console.log("Just modified the ", attr, "attribute for", itemName, "New value is",update);
                                    changeAttribute(itemName,templateID,attr,update);
                                        /* Since children is a multi-valued attribute, oldValue and newValue are Arrays that
                                        you can iterate over and inspect though often times, you'll only send newValue to the
                                        server to log the update */
                            }

        grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});

    }


    function addAttribute(attr_name,template_id){

        dojo.xhrGet({
            url: urlAttrAdd+attr_name+'/'+template_id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        dijit.byId('componentsMainToaster').setContent('Attribute '+attr_name+' added','message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
            }
        });
    }

    function changeAttribute(attr_name,template_id,field,new_value){

        dojo.xhrGet({
            url: urlAttrEdit+attr_name+'/'+template_id+'/'+field+'/'+new_value,
			content: {'id':template_id,'attr_name':attr_name,'field': field,'new_value':new_value},
            preventCache: true,
            handleAs: "json",
            load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'TemplateView','phrase':'Field','lang':l})+' '+field+' '+tr.tr({'module': 'TemplateView','phrase':'updated to','lang':l})+' '+new_value,'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
            }
        });
    }

    ctv.del      = function(id){

        console.log('Delete Template');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(ctv.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'TemplateView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


    ctv.del_confirm      = function(){

        console.log("Remove Attribute from Template "+templateID);
        ctv.selectionWorker('Deleting Attributes',urlDelete+templateID);
    }

    ctv.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

        var items = dijit.byId(grid).selection.getSelected();

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
            ctv.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'TemplateView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ctv.doSelection    = function(grid,message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        //------------------------------------------------------
                        ctv.reload();
                        //---------------------------------------------------
                    
                        dijit.byId('componentsMainToaster').setContent(message+' Complete','message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }



})();//(function(){

}
