/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.ASView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.ASView"] = true;
dojo.provide("content.ASView");

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('components.QElements');
dojo.require('components.Formatters');
dojo.require('components.Translator');

(function(){
    var asv             = content.ASView;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;
    var asID;
    
    asv.create=function(divParent,id){

        asID = id;

        console.log("Aout Setup detail comming up...."+id);
        //Focus on tab
        dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId('contentWorkspaceASView'+id));

       //----------------
        //Tab Container
        var tc = new dijit.layout.TabContainer({
            tabPosition: "top",
            nested: false,
            style : "width:auto;height:100%; padding: 10px; border: 1px solid #000000;"
        },document.createElement("div"));

        dijit.byId('contentWorkspaceASView'+id).attr('content',tc.domNode);

            //Tab
            var tcOne    = new dijit.layout.ContentPane({title : tr.tr({'module': 'ASView','phrase':"Network",'lang':l})});
            tcOne.asID   = asID;
            //Tab
            var tcTwo    = new dijit.layout.ContentPane({title : tr.tr({'module': 'ASView','phrase':"Wireless",'lang':l})});
            tcTwo.asID   = asID;
            //Tab
            var tcThree  = new dijit.layout.ContentPane({title : tr.tr({'module': 'ASView','phrase':"OpenVPN",'lang':l})});
            tcThree.asID = asID;
            //-------------------------------
            dojo.connect(tc, 'selectChild',function(e){

                //------------------------------
                if(e == tcTwo){
                    if(e.domNode.childNodes.length == 0){

                        var divWireless = document.createElement("div");
                        dojo.addClass(divWireless, 'divTabForm');
                        tcTwo.attr('content',divWireless);
                        dojo.require("content.ASViewWireless");
                        dojo.addOnLoad(function(){
                            console.log("Wireless Detail Loaded Fine");
                            content.ASViewWireless.add(divWireless,tcTwo.asID);
                        });
                    }
                }
                //------------------------------

                //------------------------------
                if(e == tcThree){
                    if(e.domNode.childNodes.length == 0){

                        var divVpn = document.createElement("div");
                        dojo.addClass(divVpn, 'divTabForm' );
                        //Widen it a bit
                        dojo.style(divVpn,'width', '40em');
                        tcThree.attr('content',divVpn);
                        dojo.require("content.ASViewVpn");
                        dojo.addOnLoad(function(){
                            console.log("VPN Detail Loaded Fine");
                            content.ASViewVpn.add(divVpn,tcThree.asID);
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

        var divNetwork = document.createElement("div");
        dojo.addClass(divNetwork, 'divTabForm');
        tcOne.attr('content',divNetwork);

        dojo.require("content.ASViewNetwork");
        dojo.addOnLoad(function(){
            console.log('Auto Setup Network loaded OK');
            content.ASViewNetwork.add(divNetwork,tcOne.asID);
        });
    }

})();//(function(){

}
