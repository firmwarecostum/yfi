/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.Firewall"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Firewall"] = true;
dojo.provide("content.Firewall");

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Common');

(function(){

    var cf              = content.Firewall;
    var urlActFirewall  = components.Const.cake+'billing_plans/json_actions/';
    var urlProfileList  = components.Const.cake+'profiles/json_index';
    var urlRulesList    = components.Const.cake+'/iptable_rules/json_index/';
    var urlRuleAdd      = components.Const.cake+'/iptable_rules/json_add/';
    var urlDelete       = components.Const.cake+'/iptable_rules/json_del/';
    var urlRuleView     = components.Const.cake+'/iptable_rules/json_view/';
    var urlRuleEdit     = components.Const.cake+'/iptable_rules/json_edit/';

    var grid;
    var profile_id;
    var query           = {'profile':'*'};

    var data_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'allow', name: 'Allow' },
                { id : 'block', name: 'Block'}
            ]}};

    var data_protocol = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'all', name: "All" },
                { id : 'tcp', name: "TCP"},
                { id : 'udp', name: "UDP"},
                { id : 'icmp', name: "ICMP"},
                { id : 'gre', name: "GRE"}
            ]}};


    cf.create  = function(divParent){

        var filteringSelect;
        console.log('Dynamic Firewall');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActFirewall,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cf[action_item.action],Id:null});
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

                var spanField  = document.createElement('span');
                spanField.innerHTML = '<b>Profile </b>';
                dojo.place(spanField,divGridAction);
                var myNewStore=new dojo.data.ItemFileReadStore({url: urlProfileList});

                var filteringSelect = new dijit.form.FilteringSelect({
                                                                    name    :"profile", 
                                                                    searchAttr: "name",
                                                                    store   :myNewStore,
                                                                    intermediateChanges : true,
                                                                    onChange: getRules,
                                                                    style: "width: 240px;"}, document.createElement("div"));

            dojo.place(filteringSelect.domNode,divGridAction);

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
                            { field: "profile", name: "Profile", width: 'auto' },
                            { field: "priority", name: "Priority", width: 'auto' },
                            { field: "action", name: "Action", width: 'auto' },
                            { field: "destination", name: "Destination", width: 'auto'},
                            { field: "protocol", name: "Protocol", width: 'auto'},
                            { field: "port", name: "Port", width: 'auto'}
                        ];

                grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                            //Check if the restart flag is present
                             divResults.innerHTML = "<b>Result count: </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                //  var jsonStore = new dojo.data.ItemFileReadStore({ url: urlPlansIndex+ts });
                 // grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);

    }

    cf.reload  = function(){
       var ts = Number(new Date());
       var jsonStore = new dojo.data.ItemFileReadStore({ url: urlRulesList+profile_id+'/?'+ts });
       grid.setStore(jsonStore,query,{ignoreCase: true});
    }

    cf.add      = function(new_ip){

        if(profile_id == undefined ){
            dijit.byId('componentsMainToaster').setContent('<b>Select a profile fist!</b>','error',components.Const.toasterError);
            return;
        }
        console.log('Add Firewall rule');
        var heading = "New Billing Plan";

        var dlgAdd  = new dijit.Dialog({
                title: 'Add Firewall Rule',
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var hiddenId    = document.createElement("input");  //Hidden element containing the User's ID
                hiddenId.type   = "hidden";
                hiddenId.name   = "id";
                hiddenId.value  = profile_id;
                dojo.place(hiddenId,frmAdd.domNode);


                var ts = Number(new Date());
                components.QElements.addNumberSpinner({ label:'Priority',valShow:1,min:1,max:100,divToAdd: frmAdd.domNode,inpName:'priority',isLast:false,inpRequired:true});
                components.QElements.addComboBox({ label:'Action',data:data_op, divToAdd: frmAdd.domNode,inpName:'action',inpRequired:true, isLast:false,searchAttr:'name',value: 'accept'});
                components.QElements.addPair({          label:'Host or Subnet/mask',divToAdd: frmAdd.domNode,inpName:'destination',inpRequired:true, isLast:false});
                components.QElements.addComboBox({ label:'Protocol',data:data_protocol, divToAdd: frmAdd.domNode,inpName:'protocol',inpRequired:true, isLast:false,searchAttr:'name',value: 'all'});
                components.QElements.addPair({          label:'Port',divToAdd: frmAdd.domNode,inpName:'port',inpRequired:true, isLast:true});
                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:'Save',iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlRuleAdd,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var ts = Number(new Date());
                                    cf.reload();
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>Created new Dynamic Firewall rule</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>Problems creating Dynamic Firewall rule</b>','message',components.Const.toasterError);
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

     cf.del      = function(){

        console.log('Delete Firewall Rules');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cf.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent('No Selection made','error',components.Const.toasterError);
        }
    }

    cf.del_confirm      = function(){
        cf.selectionWorker('Deleting Friewall Rule(s)',urlDelete);
    }

    cf.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

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
            cf.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent('No Selection made','error',components.Const.toasterError);
        }
    }

    cf.doSelection    = function(grid,message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        cf.reload();
                        //---------------------------------------------------

                        dijit.byId('componentsMainToaster').setContent(message+' Complete','message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cf.edit   = function(){

        var items = grid.selection.getSelected();
        var rule_id;
        if(items.length){
            //--------------------
            //Only a single item can be edited
            if(items.length > 1){
                dijit.byId('componentsMainToaster').setContent('<b>Edit of Firewall Rules Limited to one</b>','error',components.Const.toasterError);
                return;
            }else{
                rule_id          = grid.store.getValue(items[0],'id');
                dojo.xhrGet({
                    url: urlRuleView+rule_id,
                    preventCache: true,
                    handleAs: "json",
                    load: function(response){
                        if(response.json.status == 'ok'){
                            //------------------------------------------------------
                            _dlgEdit(response.iptable_rule);
                            //------------------------------------------------------
                        };
                        if(response.json.status == 'error'){
                                dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
                });
            }
            //-------------------------
        }else{

            dijit.byId('componentsMainToaster').setContent('No Selection made','error',components.Const.toasterError);
        }
    }

  
    
    function _dlgEdit(rule){

        console.log(rule);
        console.log('Edit Firewall Rule');
        var dlgEdit  = new dijit.Dialog({
                title: "Edit Firewall Rule",
                style: "width: 420px"
        });
            var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var hiddenId    = document.createElement("input");  //Hidden element containing the User's ID
                hiddenId.type   = "hidden";
                hiddenId.name   = "id";
                hiddenId.value  = rule.id;
                dojo.place(hiddenId,frmEdit.domNode);


                var ts = Number(new Date());
                components.QElements.addNumberSpinner({ label:'Priority',valShow:1,min:1,max:100,divToAdd: frmEdit.domNode,inpName:'priority',isLast:false,inpRequired:true, value: rule.priority});
                components.QElements.addComboBox({ label:'Action',data:data_op, divToAdd: frmEdit.domNode,inpName:'action',inpRequired:true, isLast:false,searchAttr:'name',value: rule.action});
                components.QElements.addPair({          label:'Host or Subnet/mask',divToAdd: frmEdit.domNode,inpName:'destination',inpRequired:true, isLast:false, value: rule.destination});
                components.QElements.addComboBox({ label:'Protocol',data:data_protocol, divToAdd: frmEdit.domNode,inpName:'protocol',inpRequired:true, isLast:false,searchAttr:'name',value: rule.protocol});
                components.QElements.addPair({          label:'Port',divToAdd: frmEdit.domNode,inpName:'port',inpRequired:true, isLast:true, value: rule.port});

                var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:'Save',iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);

                dojo.connect(btnEdit,'onClick',function(){
                   var ts = Number(new Date());
                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlRuleEdit+ts,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cf.reload()
                                    dlgEdit.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>Firewall Rule updated OK</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>Problems updating Friewall Rule</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){
                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                })
        dlgEdit.attr('content',frmEdit);
        dlgEdit.show();
    }

    function getRules(newValue){
        profile_id  = newValue;
        console.log("Getting rules for ",newValue);
        dijit.byId('componentsMainToaster').setContent('<b>Fetching profile rules</b>','message',components.Const.toasterInfo); //Notify the use that we added it
        cf.reload();
    }

})();//(function(){

}
