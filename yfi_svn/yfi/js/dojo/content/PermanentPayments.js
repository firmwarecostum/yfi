/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.PermanentPayments"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PermanentPayments"] = true;

dojo.provide('content.PermanentPayments');
dojo.require('components.Formatters');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var cpp                     = content.PermanentPayments;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var grid;
    var userID                  = components.LoginLight.UserInfo.User.id;

    var urlAccntPayments        = components.Const.cake+'accnts/json_payments_for/';
    var urlPDF                  = components.Const.cake+'accnts/pdf_payments/?';
    var urlMail                 = components.Const.cake+'accnts/json_send_mail_payments/?';
    var longTimeout             = components.Const.longTimeout;

    cpp.create   = function(divParent){

        console.log('Invoices');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
                components.QElements.addAction({Name:tr.tr({'module': 'PermanentPayments','phrase':"Reload Data",'lang':l}),Type:'reload',Parent: divActions,Action:cpp['reload'],Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'PermanentPayments','phrase':"Generate PDF",'lang':l}),Type:'pdf',Parent: divActions,Action:cpp['pdf'],Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'PermanentPayments','phrase':"Send e-Mail",'lang':l}),Type:'mail',Parent: divActions,Action:cpp['mail'],Id:null});
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
                            { field: "date",             name: tr.tr({'module': 'PermanentPayments','phrase':"Date",'lang':l}),    width:'auto'},
                            { field: "amount",           name: tr.tr({'module': 'PermanentPayments','phrase':"Amount",'lang':l}),  width:'auto',formatter: components.Formatters.Bold},
                            { field: "invoice_sum",      name: tr.tr({'module': 'PermanentPayments','phrase':"Sum of Invoices",'lang':l}),  width:'auto'},
                            { field: "payment_sum",      name: tr.tr({'module': 'PermanentPayments','phrase':"Sum of Payments",'lang':l}),  width:'auto'},
                            { field: "outstanding",      name: tr.tr({'module': 'PermanentPayments','phrase':"Outstanding",'lang':l}),  width:'auto',formatter: components.Formatters.CreditCheck}
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'PermanentPayments','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
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

    cpp.reload     = function(){
        console.log("Reload Invoices");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlAccntPayments+userID+'/?'+ts  });
        grid.setStore(jsonStore,{'date':'*'},{ignoreCase: true});
    }


   cpp.pdf  = function(){

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
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'PermanentPayments','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

     cpp.mail  = function(){

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
                title: tr.tr({'module': 'PermanentPayments','phrase':"Send e-Mail to myself",'lang':l}),
                style: "width: 420px"
            });
                var frmMsg    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                    components.QElements.addPair({label:tr.tr({'module': 'PermanentPayments','phrase':"Subject",'lang':l}),      divToAdd: frmMsg.domNode,inpName:'subject',     inpRequired:true, isLast:false});
                    components.QElements.addTextArea({label:tr.tr({'module': 'PermanentPayments','phrase':"Message",'lang':l}),  divToAdd: frmMsg.domNode,inpName:'message',     inpRequired:true, isLast:false});
                    components.QElements.addCheckPair({label:tr.tr({'module': 'PermanentPayments','phrase':"Attach Payment(s)",'lang':l}),divToAdd: frmMsg.domNode,inpName:'attach_payment', inpRequired:true,checked: 'checked',value: 'on',isLast: true});
                    var btnMsg = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'PermanentPayments','phrase':"OK",'lang':l}),iconClass:"okIcon"},document.createElement("div"));
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
                                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'PermanentPayments','phrase':"e-Mail send OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
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
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'PermanentPayments','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

})();//(function(){
}

