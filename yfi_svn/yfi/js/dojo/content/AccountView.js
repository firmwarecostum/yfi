/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.AccountView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.AccountView"] = true;
dojo.provide("content.AccountView");

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('components.QElements');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Formatters');
dojo.require('components.Translator');

(function(){
    var cav             = content.AccountView;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var userID;

    
    cav.create=function(divParent,id){

        userID = id;

        console.log("Account Detail comming up...."+id);
        //Focus on tab
        dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId('contentWorkspaceAccountView'+id));

       //----------------
        //Tab Container
        var tc = new dijit.layout.TabContainer({
            tabPosition: "top",
            nested: false,
            style : "width:auto;height:100%; padding: 10px; border: 1px solid #000000;"
        },document.createElement("div"));
        

        dijit.byId('contentWorkspaceAccountView'+id).attr('content',tc.domNode);

            //Tab
            var tcOne    = new dijit.layout.ContentPane({title : tr.tr({'module': 'AccountView','phrase':"User Detail",'lang':l})});
            
            //Tab
            var tcTwo       = new dijit.layout.ContentPane({title : tr.tr({'module': 'AccountView','phrase':"Invoices",'lang':l})});
            tcTwo.userID    = userID;
            //Tab
            var tcThree     = new dijit.layout.ContentPane({title : tr.tr({'module': 'AccountView','phrase':"Payments",'lang':l})});
            tcThree.userID  = userID;
            //Tab
            var tcFour      = new dijit.layout.ContentPane({title : tr.tr({'module': 'AccountView','phrase':"Notes",'lang':l})});
            tcFour.userID   = userID;


            //-------------------------------
            dojo.connect(tc, 'selectChild',function(e){

                //------------------------------
                if(e == tcTwo){
                    if(e.domNode.childNodes.length == 0){

                        var divInvoices = document.createElement("div");
                        dojo.addClass(divInvoices, 'divTabInTab');
                        tcTwo.attr('content',divInvoices);
                        dojo.require("content.AccountViewInvoices");
                        dojo.addOnLoad(function(){
                            console.log("Invoices Loaded Fine");
                            content.AccountViewInvoices.create(divInvoices,e.userID);
                        });
                    }
                }
                //------------------------------
                //------------------------------
                if(e == tcThree){
                    if(e.domNode.childNodes.length == 0){
                        var divPayments = document.createElement("div");
                        dojo.addClass(divPayments, 'divTabInTab' );
                        tcThree.attr('content',divPayments);
                        dojo.require("content.AccountViewPayments");
                        dojo.addOnLoad(function(){
                            console.log("Payments Loaded Fine");
                            content.AccountViewPayments.create(divPayments,e.userID);
                        });
                    }
                }
                //----------------------------

                //------------------------------
                if(e == tcFour){
                    console.log('Notes tab clicked');
                    if(e.domNode.childNodes.length == 0){
                        dojo.require('content.Notes');
                        dojo.addOnLoad(function(){
                            content.Notes.create(e.domNode,{'id': tcFour.userID,'tab':'account'});
                        });
                    }
                }
                //----------------------------


            });
            //-----------------------------

            tc.addChild(tcOne);
            tc.addChild(tcTwo);
            tc.addChild(tcThree);
            tc.addChild(tcFour);
        //---------------------

        //Initialise the tabs
        tc.startup();

        
        var divSummary = document.createElement("div");
        dojo.addClass(divSummary, 'divTabForm');
        tcOne.attr('content',divSummary);
        dojo.require("content.UserViewPersonal");
        dojo.addOnLoad(function(){
            console.log('Personal View Loaded OK');
            content.UserViewPersonal.getUserDetail(divSummary,userID);
        });
       
    }

})();//(function(){

}
