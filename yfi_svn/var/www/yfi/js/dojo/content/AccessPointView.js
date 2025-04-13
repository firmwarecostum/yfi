/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.AccessPointView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.AccessPointView"] = true;
dojo.provide("content.AccessPointView");

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('components.QElements');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Formatters');
dojo.require('components.Translator');

(function(){
    var capv             = content.AccessPointView;
    var nasID;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;
    
    capv.create=function(divParent,id){

        nasID = id;

        console.log("Access Point detail comming up...."+id);
        //Focus on tab
        dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId('contentWorkspaceAccessPointView'+id));

       //----------------
        //Tab Container
        var tc = new dijit.layout.TabContainer({
            tabPosition: "top",
            nested: false,
            style : "width:auto;height:100%; padding: 10px; border: 1px solid #000000;"
        },document.createElement("div"));
        

        dijit.byId('contentWorkspaceAccessPointView'+id).attr('content',tc.domNode);

            //Tab
            var tcOne    = new dijit.layout.ContentPane({title : tr.tr({'module': 'AccessPointView','phrase':"Device Info",'lang':l})});
            tcOne.nasID  = nasID;
            
            //Tab
            var tcTwo     = new dijit.layout.ContentPane({title : tr.tr({'module': 'AccessPointView','phrase':"Wireless Clients",'lang':l})});
            tcTwo.nasID   = nasID;
            //Tab
            var tcThree    = new dijit.layout.ContentPane({title : tr.tr({'module': 'AccessPointView','phrase':"Nearby Devices",'lang':l})});
            tcThree.nasID  = nasID;
            //-------------------------------
            dojo.connect(tc, 'selectChild',function(e){
                
                //------------------------------
                if(e == tcTwo){
                    //console.log("Tab Two Clicked")
                    if(e.domNode.childNodes.length == 0){
                        //console.log("Populate tab2");
                        var divClients = document.createElement("div");
                        dojo.addClass(divClients, 'divTabInTab' );
                        tcTwo.attr('content',divClients);
                        dojo.require("content.APViewClients");
                        dojo.addOnLoad(function(){
                            content.APViewClients.create(divClients,tcTwo.nasID);
                        });
                    }
                }
                //------------------------------
                //------------------------------

                if(e == tcThree){
                    if(e.domNode.childNodes.length == 0){
                        var divRogues = document.createElement("div");
                        dojo.addClass(divRogues, 'divTabInTab' );
                        tcThree.attr('content',divRogues);
                        dojo.require("content.APViewRogues");
                        dojo.addOnLoad(function(){
                            content.APViewRogues.create(divRogues,tcThree.nasID);
                        });
                    }
                }
                //----------------------------

            });
            //-----------------------------

            tc.addChild(tcOne);
            tc.addChild(tcTwo);
            tc.addChild(tcThree);
        //---------------------

        //Initialise the tabs
        tc.startup();

        
        var divSummary = document.createElement("div");
        dojo.addClass(divSummary, 'divTabForm');
        tcOne.attr('content',divSummary);
        dojo.require("content.APViewDevice");
        dojo.addOnLoad(function(){
            console.log('Device Detail loaded OK');
            content.APViewDevice.create(divSummary,tcOne.nasID);
        });

    }

})();//(function(){

}
