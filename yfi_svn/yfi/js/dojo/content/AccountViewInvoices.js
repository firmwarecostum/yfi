/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if(!dojo._hasResource["content.AccountViewInvoices"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.AccountViewInvoices"] = true;

dojo.provide('content.AccountViewInvoices');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');
dojo.require('components.Common');

(function(){
    var cavi                    = content.AccountViewInvoices;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var grid;
    var userID;

    var urlActUserExtras        = components.Const.cake+'accnts/json_actions_invoices/';
    var urlAccntInvoices        = components.Const.cake+'accnts/json_invoices_for/';
    var urlBillingPlanList      = components.Const.cake+'billing_plans/json_index/';
    var urlDelete               = components.Const.cake+'accnts/json_del_invoice/?';
    var urlAdd                  = components.Const.cake+'accnts/json_add/?';
    var urlPDF                  = components.Const.cake+'accnts/pdf_invoices/?';
    var urlMail                 = components.Const.cake+'accnts/json_send_mail_invoices/?';

    var longTimeout             = components.Const.longTimeout;
    
    cavi.create   = function(divParent,id){

        userID = id;
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActUserExtras,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cavi[action_item.action],Id:userID});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
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
                            { field: "start_date",       name: tr.tr({'module': 'AccountViewInvoices','phrase':"Start Date",'lang':l}),    width:'auto'},
                            { field: "end_date",         name: tr.tr({'module': 'AccountViewInvoices','phrase':"End Date",'lang':l}),      width:'auto'},
                            { field: "billing_plan",     name: tr.tr({'module': 'AccountViewInvoices','phrase':"Billing Plan",'lang':l}),  width:'auto'},
                            { field: "total",            name: tr.tr({'module': 'AccountViewInvoices','phrase':"Total",'lang':l}),  width:'auto',formatter: components.Formatters.Bold},
                            { field: "invoice_sum",      name: tr.tr({'module': 'AccountViewInvoices','phrase':"Sum of Invoices",'lang':l}),  width:'auto'},
                            { field: "payment_sum",      name: tr.tr({'module': 'AccountViewInvoices','phrase':"Sum of Payments",'lang':l}),  width:'auto'},
                            { field: "outstanding",      name: tr.tr({'module': 'AccountViewInvoices','phrase':"Outstanding",'lang':l}),  width:'auto',formatter: components.Formatters.CreditCheck}
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'AccountViewInvoices','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileReadStore({ url: urlAccntInvoices+userID+'/?'+ts  });
                  grid.setStore(jsonStore,{'start_date':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);
    }

    
    cavi.reload     = function(){
        console.log("Reload Invoices");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlAccntInvoices+userID+'/?'+ts  });
        grid.setStore(jsonStore,{'start_date':'*'},{ignoreCase: true});
    }

    cavi.del      = function(){
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cavi.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccountViewInvoices','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cavi.del_confirm      = function(){
        var rl_function = cavi.reload;
        components.Formatters.deleteWorker({'grid': grid,'message': tr.tr({'module': 'AccountViewInvoices','phrase':"Delete Invoice(s)",'lang':l}),'url':urlDelete,'reload': rl_function});
    }


    cavi.add            = function(){

        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'AccountViewInvoices','phrase':"Create New Invoice",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());
                components.QElements.addDateTextBox({   label:tr.tr({'module': 'AccountViewInvoices','phrase':"Start Date",'lang':l}),divToAdd: frmAdd.domNode,inpName:'start_date',inpRequired:true,isLast:false,inpRequired:true});
                components.QElements.addDateTextBox({   label:tr.tr({'module': 'AccountViewInvoices','phrase':"End Date",'lang':l}),divToAdd: frmAdd.domNode,inpName:'end_date',inpRequired:true,isLast:false,inpRequired:true});
                components.QElements.addComboBox({      label:tr.tr({'module': 'AccountViewInvoices','phrase':"Billing Plan",'lang':l}),url:urlBillingPlanList, divToAdd: frmAdd.domNode,inpName:'billing_plan',inpRequired:true, isLast:true,searchAttr:'name'});

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'AccountViewInvoices','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){
                    var start_date;
                    var end_date;
                    var itemList =[];
                    if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        start_date  = new Date(frmObj.start_date.replace(/-/g,','));    //Convert 2009-07-01 to 2009,07,01
                        end_date    = new Date(frmObj.end_date.replace(/-/g,','));
                        //--CHECK--
                        //Ensure the end date is bigger than the start date
                        if(start_date.getTime()>= end_date.getTime()){
                            dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccountViewInvoices','phrase':"End date must be AFTER Start date",'lang':l})+'</b>','error',components.Const.toasterError);
                        } 
                        //--CHECK--
                        //Loop through list and ensure there's no overlap + it start after the last end
                        var items =[];
                        grid.store.fetch({
                            query: {'start_date' : '*'},
                            queryOptions:{ignoreCase : true},
                            onItem :    function(item, request) {
                                            items.push(item);
                                        }
                        });
                        var fail_flag = false;
                        dojo.every(items, function(item){
                            var start       = grid.store.getValue(item,'start_date');
                            var end         = grid.store.getValue(item,'end_date');
                            var user_end    = new Date(end.replace(/-/g,','));
                            var user_start  = new Date(start.replace(/-/g,','));

                            if((start_date.getTime() < user_start.getTime()||start_date.getTime() > user_end.getTime())&&(end_date.getTime() < user_start.getTime()||end_date.getTime() > user_end.getTime())){
                                    return true; 
                            }else{
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccountViewInvoices','phrase':"Selected Dates in Existing Invoice",'lang':l})+'!</b>','error',components.Const.toasterError);
                                fail_flag = true;
                                return false;   //Drop out on first failure!
                            }

                        });
                        if(fail_flag == false){
                            console.log("All Tests Passed... Continue please");
                            //Get a list of selected users's ids
                            dojo.forEach(
                                items,
                                function(item) {
                                    if(item !== null) {
                                        var id = grid.store.getValue(item,'id');
                                        itemList.push(id);
                                    }
                            });
                            dojo.xhrPost({
                                url: urlAdd+'0='+userID,
                                preventCache: true,
                                content: frmObj,
                                handleAs: "json",
                                load: function(response){

                                    //console.log(response);
                                    if(response.json.status == 'ok'){
                                        //------------------------------------------------------
                                        dlgAdd.destroyRecursive(false); //Destroy the dialog
                                        cavi.reload();
                                        //---------------------------------------------------
                                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccountViewInvoices','phrase':"New Invoice Added",'lang':l})+'<b>','message',components.Const.toasterInfo);
                                    };
                                    if(response.json.status == 'error'){
                                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                    }
                                }
                            });
                        }
                    }
                })
        dlgAdd.attr('content',frmAdd);
        dlgAdd.show();
    }
    
    cavi.pdf  = function(){

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

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccountViewInvoices','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

     cavi.mail  = function(){

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
                title: tr.tr({'module': 'AccountViewInvoices','phrase':"Send e-Mail to user",'lang':l}),
                style: "width: 420px"
            });
                var frmMsg    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                    components.QElements.addPair({label:tr.tr({'module': 'AccountViewInvoices','phrase':"Subject",'lang':l}),      divToAdd: frmMsg.domNode,inpName:'subject',     inpRequired:true, isLast:false});
                    components.QElements.addTextArea({label:tr.tr({'module': 'AccountViewInvoices','phrase':"Message",'lang':l}),  divToAdd: frmMsg.domNode,inpName:'message',     inpRequired:true, isLast:false});
                    components.QElements.addCheckPair({label:tr.tr({'module': 'AccountViewInvoices','phrase':"Attach Invoice(s)",'lang':l}),divToAdd: frmMsg.domNode,inpName:'attach_invoice', inpRequired:true,checked: 'checked',value: 'on',isLast: true});
                    var btnMsg = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'AccountViewInvoices','phrase':"OK",'lang':l}),iconClass:"okIcon"},document.createElement("div"));
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
                                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccountViewInvoices','phrase':"e-Mail send OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
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
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccountViewInvoices','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

})();//(function(){

}

