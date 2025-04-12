/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.AccountViewPayments"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.AccountViewPayments"] = true;

dojo.provide('content.AccountViewPayments');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var cavp                    = content.AccountViewPayments;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;


    var grid;
    var userID;
    var urlActAccntPayments     = components.Const.cake+'accnts/json_actions_payments/';
    var urlAccntPayments        = components.Const.cake+'accnts/json_payments_for/';
    var urlDelete               = components.Const.cake+'accnts/json_del_payment/?';
    var urlAdd                  = components.Const.cake+'accnts/json_payment_add/?';
    var urlPDF                  = components.Const.cake+'accnts/pdf_payments/?';
    var urlMail                 = components.Const.cake+'accnts/json_send_mail_payments/?';

    var longTimeout             = components.Const.longTimeout;
   
    cavp.create   = function(divParent,id){

        userID = id;
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActAccntPayments,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cavp[action_item.action],Id:userID});
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
                            { field: "date",             name: tr.tr({'module': 'AccountViewPayments','phrase':"Date",'lang':l}),    width:'auto'},
                            { field: "amount",           name: tr.tr({'module': 'AccountViewPayments','phrase':"Amount",'lang':l}),  width:'auto',formatter: components.Formatters.Bold},
                            { field: "invoice_sum",      name: tr.tr({'module': 'AccountViewPayments','phrase':"Sum of Invoices",'lang':l}),  width:'auto'},
                            { field: "payment_sum",      name: tr.tr({'module': 'AccountViewPayments','phrase':"Sum of Payments",'lang':l}),  width:'auto'},
                            { field: "outstanding",      name: tr.tr({'module': 'AccountViewPayments','phrase':"Outstanding",'lang':l}),  width:'auto',formatter: components.Formatters.CreditCheck}
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'AccountViewPayments','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileReadStore({ url: urlAccntPayments+userID+'/?'+ts  });
                  grid.setStore(jsonStore,{'date':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);
    }

    cavp.reload     = function(){
        console.log("Reload Payments");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlAccntPayments+userID+'/?'+ts  });
        grid.setStore(jsonStore,{'date':'*'},{ignoreCase: true});
    }

    cavp.del      = function(){
        console.log('Delete Payments');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cavp.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccountViewPayments','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cavp.del_confirm    = function(){
        var rl_function = cavp.reload;
        components.Formatters.deleteWorker({'grid': grid,'message': 'Delete Payment(s)','url':urlDelete,'reload': rl_function});
    }

    cavp.add            = function(){

        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'AccountViewPayments','phrase':"New Payment",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());
                components.QElements.addPair({          label:tr.tr({'module': 'AccountViewPayments','phrase':'Amount','lang':l}), divToAdd: frmAdd.domNode,   inpName:'amount', inpRequired:true, isLast:false});
                components.QElements.addDateTextBox({   label:tr.tr({'module': 'Accounts','phrase':"Date Received",'lang':l}),divToAdd: frmAdd.domNode,inpName:'received_date',inpRequired:true,isLast:false,inpRequired:true});
                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'AccountViewPayments','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);
                dojo.connect(btnAdd,'onClick',function(){
                    if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlAdd+'0='+userID,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cavp.reload();
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccountViewPayments','phrase':"New payment(s) added",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccountViewPayments','phrase':"Problems adding new payments",'lang':l})+'</b>','message',components.Const.toasterError);
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

   cavp.pdf  = function(){

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
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccountViewPayments','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

     cavp.mail  = function(){

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
                title: tr.tr({'module': 'AccountViewPayments','phrase':"Send e-Mail to user",'lang':l}),
                style: "width: 420px"
            });
                var frmMsg    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                    components.QElements.addPair({label:tr.tr({'module': 'AccountViewPayments','phrase':"Subject",'lang':l}),      divToAdd: frmMsg.domNode,inpName:'subject',     inpRequired:true, isLast:false});
                    components.QElements.addTextArea({label:tr.tr({'module': 'AccountViewPayments','phrase':"Message",'lang':l}),  divToAdd: frmMsg.domNode,inpName:'message',     inpRequired:true, isLast:false});
                    components.QElements.addCheckPair({label:tr.tr({'module': 'AccountViewPayments','phrase':"Attach Payment(s)",'lang':l}),divToAdd: frmMsg.domNode,inpName:'attach_payment', inpRequired:true,checked: 'checked',value: 'on',isLast: true});
                    var btnMsg = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'AccountViewPayments','phrase':"OK",'lang':l}),iconClass:"okIcon"},document.createElement("div"));
                //-----------------------------------
                dojo.connect(btnMsg,'onClick',function(){

                    if(frmMsg.validate()){
                        console.log('Form is valid...');

                        var frmObj = dojo.formToObject(frmMsg.domNode); //Convert the Form to an object
                        dlgMsg.attr('content',components.Common.divWorking());
                        
                        dojo.xhrPost({
                            url: urlMail+dojo.objectToQuery(itemList),
                            content: frmObj,
                            handleAs: "json",
                            timeout: longTimeout,
                            load: function(response){
                                    if(response.json.status == 'ok'){
                                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AccountViewPayments','phrase':"e-Mail send OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
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
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AccountViewPayments','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

})();//(function(){

}

