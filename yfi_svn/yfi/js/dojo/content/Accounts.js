/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if(!dojo._hasResource['content.Accounts']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['content.Accounts'] = true;
dojo.provide('content.Accounts');

dojo.require('dojox.grid.DataGrid');
dojo.require('dojox.data.QueryReadStore');
dojo.require('components.QElements');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var ca               = content.Accounts;
    var urlActAccounts   = components.Const.cake+'accnts/json_actions/';
    var urlAccountsIndex = components.Const.cake+'accnts/json_index/';
    var urlBillingPlanList = components.Const.cake+'billing_plans/json_index/';
    var urlAcctntAdd    = components.Const.cake+'accnts/json_add/?';
    var urlDelete       = components.Const.cake+'accnts/json_del/?';
    var urlPayment      = components.Const.cake+'accnts/json_payment_add/?';
    var urlPDF          = components.Const.cake+'accnts/pdf_latest/?';
    var urlMail         = components.Const.cake+'accnts/json_send_mail/?';
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;
    
    var longTimeout     = components.Const.longTimeout;

    var grid;
    var query           = {'username':'*'};

    ca.create=function(divParent){

        console.log('Accounts List');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActAccounts,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:ca[action_item.action],Id:null});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

            //-------------------Filter + Refresh------------------------
            var filter = document.createElement('span');
            filter.innerHTML ='<b>'+tr.tr({'module': 'Accounts','phrase':"Filter",'lang':l})+' </b>';
            dojo.place(filter, divGridAction);
            var t = new dijit.form.TextBox({name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(t,'onKeyUp',function(e){
                    var filterOn = filteringSelect.attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = t.attr('value');
                    query = {'username' : val+'*'};
                    if(filterOn == 'username'){
                       query = {'username' : val+'*'};
                    }
                    if(filterOn == 'realm'){
                       query = {'realm' : val+'*'};
                    }
                    grid.setQuery(query);
            });

            dojo.place(t.domNode, divGridAction);

            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'Accounts','phrase':"Field",'lang':l})+' </b>';
            dojo.place(spanField,divGridAction);

                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'username', label: tr.tr({'module': 'Accounts','phrase':"Username",'lang':l}),selected:'selected' },
                                { id : 'realm', label: tr.tr({'module': 'Accounts','phrase':"Realm",'lang':l}) }
                                ]}};
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            filteringSelect = new dijit.form.FilteringSelect({
                                                                    value   :"username",
                                                                    name    :"state",
                                                                    store   :myNewStore,
                                                                    searchAttr  :"label",
                                                                    style: "width: 140px;"}, document.createElement("div"));
            dojo.place(filteringSelect.domNode,divGridAction);

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
                            { field: "realm",       name: tr.tr({'module': 'Accounts','phrase':"Realm",'lang':l}),      width: 'auto' },
                            { field: "username",    name: tr.tr({'module': 'Accounts','phrase':"Username",'lang':l}),   width: 'auto',formatter: components.Formatters.Bold },
                            { field: "start",       name: tr.tr({'module': 'Accounts','phrase':"Latest Start Date",'lang':l}),width: 'auto' },
                            { field: "end",         name: tr.tr({'module': 'Accounts','phrase':"Latest End Date",'lang':l}),  width: 'auto' },
                            { field: "plan",        name: tr.tr({'module': 'Accounts','phrase':"Billing Plan",'lang':l}),   width: 'auto' },
                            { field: "outstanding", name: tr.tr({'module': 'Accounts','phrase':"Outstanding",'lang':l}),    width: 'auto',formatter: components.Formatters.CreditCheck},
                            { field: "paid",        name: tr.tr({'module': 'Accounts','phrase':"Paid",'lang':l}),           width: 'auto' }    
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));
                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                grid.canSort = function(index) {  //index is 1-based - Only Column one and two are sortable
                    if(Math.abs(index) == 1 || Math.abs(index) == 2) return true;
                        return false;
                }

                  grid.startup();

                  dojo.connect(grid,'_onFetchComplete', function(){

                        divResults.innerHTML = "<b>"+tr.tr({'module': 'Accounts','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                  })

                  var ts = Number(new Date());
                  var jsonStore = new dojox.data.QueryReadStore({ url: urlAccountsIndex+ts });
                  grid.setStore(jsonStore,query,{ignoreCase: true});
            //---- END Grid----------------
        },100);

    }

     ca.edit   = function(){
        console.log("Edit action clicked");
        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = grid.store.getValue(selectedItem,'id');
                                var username  = grid.store.getValue(selectedItem,'username');
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Accounts','phrase':"Account detail for",'lang':l})+' '+username+'</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/AccountView", [id,username]);
                            }
                        });
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Accounts','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ca.reload  = function(){

        var ts          = Number(new Date());
        var jsonStore   = new dojox.data.QueryReadStore({ url: urlAccountsIndex+ts });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }

    ca.note     = function(){
        console.log("Add a note");
        var items       = grid.selection.getSelected();
        var user_list   = [];
        var counter     = 0;
        if(items.length){
            dojo.forEach(
            items,
            function(selectedItem) {
                if(selectedItem !== null) {
                    var id = grid.store.getValue(selectedItem,'id');
                    user_list[counter] = id;
                    counter = counter +1;
                }
            });
            //Pop up the note dialog with a list of users to add notes to
            dojo.require('content.Notes');
            dojo.addOnLoad(function(){
                content.Notes.add_to_list(user_list);
            });

        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Users','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ca.add      = function(){

        console.log("Add New Invoices");
        var items = grid.selection.getSelected();
        if(items.length){
            _add_dialog();
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Accounts','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ca.payment      = function(){

        console.log("Add Payment");
        var items = grid.selection.getSelected();
        if(items.length){
            _payment_dialog(items);
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Accounts','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ca.pdf  = function(){

        console.log("Generating PDF");
        var items = grid.selection.getSelected();
        if(items.length){
            var itemList ='';
            var count = 0;
            dojo.forEach(
                items,
                function(selectedItem) {
                    if(selectedItem !== null) {
                        var id = grid.store.getValue(selectedItem,'id');
                        itemList = itemList+count+'='+id+'&';
                        count++;
                    }
                });
            window.open(urlPDF+itemList);
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Accounts','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ca.del      = function(){
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(ca.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Accounts','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ca.del_confirm      = function(){
        var rl_function = ca.reload;
        components.Formatters.deleteWorker({'grid': grid,'message': tr.tr({'module': 'Accounts','phrase':"Delete Last Invoice",'lang':l}),'url':urlDelete,'reload': rl_function});
    }

    ca.mail  = function(){

        var items = grid.selection.getSelected();
        var itemList =[];
        if(items.length){
            dojo.forEach(
            items,
            function(selectedItem) {
                if(selectedItem !== null) {
                    var id = grid.store.getValue(selectedItem,'id');
                    itemList.push(id);
                }
            });

            //-------EDIT TEST PASSED---------
            console.log("Send Mail");
            dlgMsg = new dijit.Dialog({
                title: tr.tr({'module': 'Accounts','phrase':"Send e-Mail to users",'lang':l}),
                style: "width: 420px"
            });
                var frmMsg    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                    components.QElements.addPair({label:tr.tr({'module': 'Accounts','phrase':"Subject",'lang':l}),      divToAdd: frmMsg.domNode,inpName:'subject',     inpRequired:true, isLast:false});
                    components.QElements.addTextArea({label:tr.tr({'module': 'Accounts','phrase':"Message",'lang':l}),  divToAdd: frmMsg.domNode,inpName:'message',     inpRequired:true, isLast:false});
                    components.QElements.addCheckPair({label:tr.tr({'module': 'Accounts','phrase':"Attach Invoice",'lang':l}),divToAdd: frmMsg.domNode,inpName:'attach_invoice', inpRequired:true,checked: 'checked',value: 'on',isLast: true});
                    var btnMsg = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'Accounts','phrase':"OK",'lang':l}),iconClass:"okIcon"},document.createElement("div"));
                //-----------------------------------
                dojo.connect(btnMsg,'onClick',function(){

                    if(frmMsg.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmMsg.domNode); //Convert the Form to an object
                        dlgMsg.attr('content',components.Common.divWorking());
                        
                        dojo.xhrPost({
                            url: urlMail+dojo.objectToQuery(itemList),
                            content: frmObj,
                            timeout: longTimeout,
                            handleAs: "json",
                            load: function(response){
                                    if(response.json.status == 'ok'){
                                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Accounts','phrase':"e-Mail send OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
                                        dlgMsg.destroyRecursive(false); //Destroy the dialog
                                    }
                                    if(response.json.status == 'error'){
                                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                    }
                                },
                            error : function(response, ioArgs) {
                                        dijit.byId('componentsMainToaster').setContent(response.message,'error');
                                        dlgMsg.destroyRecursive(false); //Destroy the dialog
                                    }
                        });
                        
                    }
                });
                //------------------------------------
                dojo.place(btnMsg.domNode,frmMsg.domNode);
            dlgMsg.attr('content',frmMsg);
            dlgMsg.show();
            //-------------------------------

        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Accounts','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    function _payment_dialog(){

        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'Accounts','phrase':"New Payment",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());
                components.QElements.addPair({          label:tr.tr({'module': 'Accounts','phrase':"Amount",'lang':l}),       divToAdd: frmAdd.domNode,   inpName:'amount', inpRequired:false, isLast:false});
                components.QElements.addCheckPair({label:tr.tr({'module': 'Accounts','phrase':"All outstanding",'lang':l}),divToAdd: frmAdd.domNode,inpName:'all_outstanding', inpRequired:true,value: 'on',isLast: false});
                components.QElements.addDateTextBox({   label:tr.tr({'module': 'Accounts','phrase':"Date Received",'lang':l}),divToAdd: frmAdd.domNode,inpName:'received_date',inpRequired:true,isLast:false,inpRequired:true});
                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Accounts','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){
                    if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        var sel_users ='';
                        var count = 0;
                        var items = grid.selection.getSelected();
                        var itemList =[];
                        dojo.forEach(
                                items,
                                function(item) {
                                    if(item !== null) {
                                        var id = grid.store.getValue(item,'id');
                                        itemList.push(id);
                                    }
                        });
                        dojo.forEach(itemList, function(i){
                            sel_users = sel_users+count+'='+i+'&';
                            count++;
                        });
                        dojo.xhrPost({
                        url: urlPayment+sel_users,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    ca.reload();
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Accounts','phrase':"New payment(s) added",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Accounts','phrase':"Problems adding new payments",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){

                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                });
        dlgAdd.attr('content',frmAdd);
        dlgAdd.show();
    }

     function _add_dialog(itemList){

        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'Accounts','phrase':"Create New Set of Invoices",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());
                components.QElements.addDateTextBox({   label:tr.tr({'module': 'Accounts','phrase':"Start Date",'lang':l}),divToAdd: frmAdd.domNode,inpName:'start_date',inpRequired:true,isLast:false,inpRequired:true});
                components.QElements.addDateTextBox({   label:tr.tr({'module': 'Accounts','phrase':"End Date",'lang':l}),divToAdd: frmAdd.domNode,inpName:'end_date',inpRequired:true,isLast:false,inpRequired:true});
                components.QElements.addComboBox({      label:tr.tr({'module': 'Accounts','phrase':"Billing Plan",'lang':l}),url:urlBillingPlanList, divToAdd: frmAdd.domNode,inpName:'billing_plan',inpRequired:true, isLast:true,searchAttr:'name'});

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Accounts','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){
                    var start_date;
                    var end_date;
                    var itemList =[];
                    var fail_flag = false;

                    if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        start_date  = new Date(frmObj.start_date.replace(/-/g,','));    //Convert 2009-07-01 to 2009,07,01
                        end_date    = new Date(frmObj.end_date.replace(/-/g,','));
                        //--CHECK--
                        //Ensure the end date is bigger than the start date
                        if(start_date.getTime()>= end_date.getTime()){
                            dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Accounts','phrase':"End date must be AFTER Start date",'lang':l})+'</b>','error',components.Const.toasterError);
                            fail_flag = true;
                        } 
                        //--CHECK--
                        //Loop through selected list and ensure there's no overlap + it start after the last end
                        var items = grid.selection.getSelected();
                        
                        dojo.every(items, function(item){
                            var username = grid.store.getValue(item,'username');
                            var end      = grid.store.getValue(item,'end');
                            var user_end = new Date(end.replace(/-/g,','));
                            if(end != 'NA'){
                                if(start_date.getTime() <= user_end.getTime()){
                                    dijit.byId('componentsMainToaster').setContent('<b>'+username+':<br>'+tr.tr({'module': 'Accounts','phrase':"Start Date must be AFTER Latest End Date",'lang':l})+'</b>','error',components.Const.toasterError);
                                    fail_flag = true;
                                    return false; //Only show the first
                                }else{
                                    return true;
                                }
                            }
                        });
                        if(fail_flag == false){
                            console.log("All Tests Passed... Continiue please");
                            //Get a list of selected users's ids
                            dojo.forEach(
                                items,
                                function(item) {
                                    if(item !== null) {
                                        var id = grid.store.getValue(item,'id');
                                        itemList.push(id);
                                    }
                            });
                            //Call the back-end
                            var sel_users ='';
                            var count = 0;
                            dojo.forEach(itemList, function(i){
                                sel_users = sel_users+count+'='+i+'&';
                                count++;
                            });
                            //Change the face of the dialog box
                            dlgAdd.attr('content',components.Common.divWorking());

                            dojo.xhrPost({
                                url: urlAcctntAdd+sel_users,
                                preventCache: true,
                                content: frmObj,
                                handleAs: "json",
                                timeout: longTimeout,
                                load: function(response){
                                    //console.log(response);
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    if(response.json.status == 'ok'){
                                        
                                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Accounts','phrase':"New Set Complete",'lang':l})+'<b>','message',components.Const.toasterInfo);
                                        ca.reload();
                                    };
                                    if(response.json.status == 'error'){
                                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                    }
                                    },
                                error : function(response, ioArgs) {
                                        dijit.byId('componentsMainToaster').setContent(response.message,'error');
                                        //------------------------------------------------------
                                        dlgAdd.destroyRecursive(false); //Destroy the dialog
                                        //---------------------------------------------------
                                    }
                            });
                        }
                    }
                })
        dlgAdd.attr('content',frmAdd);
        dlgAdd.show();
    }

})();//(function(){

}
