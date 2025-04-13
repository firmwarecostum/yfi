/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.Plans"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Plans"] = true;
dojo.provide("content.Plans");

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var cp              = content.Plans;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var urlActPlans     = components.Const.cake+'billing_plans/json_actions/';
    var urlRealmList    = components.Const.cake+'realms/json_index_list';
    var urlPlansAdd     = components.Const.cake+'billing_plans/json_add/?';
    var urlPlansIndex   = components.Const.cake+'billing_plans/json_index/';
    var urlDelete       = components.Const.cake+'billing_plans/json_del/?'

    var grid;

    cp.create  = function(divParent){

        var filteringSelect;
        console.log('Billing Plans List');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActPlans,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cp[action_item.action],Id:null});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

            //----------------------------------------------------

                var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
            //-----------------------------------------------------------

        dojo.place(divGridAction,divParent);
        
        setTimeout(function () {

            var contentBox = dojo.contentBox(divParent);
            var hight = (contentBox.h-92)+'';
            var s = "height: "+hight+"px ; padding: 20px";

             var cpExp   =   new dijit.layout.ContentPane({
                                style:      s
                            },document.createElement("div"));
            dojo.place(cpExp.domNode,divParent);

            //----Grid Start----------------
                 var layout = [
                            { field: "name", name: tr.tr({'module': 'Plans','phrase':"Name",'lang':l}), width: 'auto' },
                            { field: "currency", name: tr.tr({'module': 'Plans','phrase':"Currency",'lang':l}), width: 'auto' },
                            { field: "subscription", name: tr.tr({'module': 'Plans','phrase':"Subscription",'lang':l}), width: 'auto',formatter: formatBold },
                            { field: "time_unit", name: tr.tr({'module': 'Plans','phrase':"Rate/Second",'lang':l}), width: 'auto',formatter: formatBold },
                            { field: "data_unit", name: tr.tr({'module': 'Plans','phrase':"Rate/Byte",'lang':l}), width: 'auto',formatter: formatBold  },
                            { field: "tax", name: '% '+tr.tr({'module': 'Plans','phrase':"Tax",'lang':l}), width: 'auto', formatter: formatBold  },
                            { field: "realms", name: tr.tr({'module': 'Plans','phrase':"Realms",'lang':l}),width: '100px'}
                        ];

                grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                            //Check if the restart flag is present
                             divResults.innerHTML = "<b>"+tr.tr({'module': 'Plans','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileReadStore({ url: urlPlansIndex+ts });
                  grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);

    }

    cp.reload  = function(){
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlPlansIndex+ts });
        grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
    }


    cp.add      = function(new_ip){
        console.log('Add Billing Plan');
        var heading = tr.tr({'module': 'Plans','phrase':"New Billing Plan",'lang':l});

         //--Clean up is 2nd time round ----
        if(dijit.byId('contentPlansAddRealms') != undefined){
            dijit.byId('contentPlansAddRealms').destroyDescendants(true);
            dijit.byId('contentPlansAddRealms').destroy(true);
        }
        //-------------------------------

        var dlgAdd  = new dijit.Dialog({
                title: heading,
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());
                components.QElements.addPair({          label:tr.tr({'module': 'Plans','phrase':"Name",'lang':l}),       divToAdd: frmAdd.domNode,   inpName:'name',         inpRequired:true, isLast:false});
                components.QElements.addPair({          label:tr.tr({'module': 'Plans','phrase':"Currency",'lang':l}),   divToAdd: frmAdd.domNode,   inpName:'currency',     inpRequired:true, isLast:false});
                components.QElements.addPair({          label:tr.tr({'module': 'Plans','phrase':"Subscription",'lang':l}),divToAdd: frmAdd.domNode,  inpName:'subscription', inpRequired:true, isLast:false});
                components.QElements.addPair({          label:tr.tr({'module': 'Plans','phrase':"Rate/Second",'lang':l}),divToAdd: frmAdd.domNode,   inpName:'time_unit',    inpRequired:true, isLast:false});
                components.QElements.addPair({          label:tr.tr({'module': 'Plans','phrase':"Rate/Byte",'lang':l}),  divToAdd: frmAdd.domNode,  inpName:'data_unit',     inpRequired:true, isLast:false});
                components.QElements.addNumberSpinner({ label:'% '+tr.tr({'module': 'Plans','phrase':"Tax",'lang':l}),valShow:0,min:0,max:100,divToAdd: frmAdd.domNode,inpName:'tax',inpRequired:true,isLast:false});

                if(components.LoginLight.UserInfo.group == components.Const.admin){       //Only Available to Administrators
                    components.QElements.addCheckPair({label:tr.tr({'module': 'Plans','phrase':"Available to all",'lang':l}),divToAdd: frmAdd.domNode,inpName:'available_all', inpRequired:true,checked: 'checked',value: 'on',isLast: false});
                }
                var d=document.createElement('div');
                    dojo.place(d,frmAdd.domNode);
                        components.QElements.addMultiSelect({
                                                            label:      tr.tr({'module': 'Plans','phrase':"Available only to",'lang':l}),
                                                            divToAdd:   d,
                                                            inpName:    'realms',
                                                            inpRequired:true,
                                                            isLast:     true,
                                                            url:        urlRealmList,
                                                            id:         'contentPlansAddRealms' 
                        });
                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Plans','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        var realms ='';
                        var count = 0;
                        dojo.forEach(dijit.byId('contentPlansAddRealms').attr('value'), function(i){
                            realms = realms+count+'='+i+'&';
                            count++;
                        });
                        dojo.xhrPost({
                        url: urlPlansAdd+realms,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var ts = Number(new Date());
                                    var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlPlansIndex+ts });
                                    grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Plans','phrase':"Created New Billing Plan",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Plans','phrase':"Problems creating Billing Plan",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){

                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                })

        dlgAdd.attr('content',frmAdd);
        dlgAdd.show();
    }

    cp.edit   = function(){

        console.log("Edit action clicked");
        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = grid.store.getValue(selectedItem,'id');
                                var p_name  = grid.store.getValue(selectedItem,'name');
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Plans','phrase':"Opening detail for",'lang':l})+' '+p_name+'</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/PlanView", [id,p_name]);
                                //console.log("NAS with id "+id+" selected");
                            }
                        });
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Plans','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


    cp.del      = function(){

        console.log('Delete Billing Plan(s)');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cp.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Plans','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cp.del_confirm      = function(){
        cp.selectionWorker(tr.tr({'module': 'Plans','phrase':"Deleting Billing Plan(s)",'lang':l}),urlDelete);
    }

    cp.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

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
            cp.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Plans','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cp.doSelection    = function(grid,message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        cp.reload();
                        //---------------------------------------------------
                    
                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'Plans','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    //=================================
    //Formatter to display values
    function formatBold(value){
        return "<div style='width:100%; height:100%;'><b>"+value+"</b></div>";
    }
    //===============================

 

})();//(function(){

}
