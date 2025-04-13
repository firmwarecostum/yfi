/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.PlanView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PlanView"] = true;
dojo.provide("content.PlanView");

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('components.QElements');
dojo.require('components.Formatters');
dojo.require('components.Translator');

(function(){
    var cpv             = content.PlanView;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;
    var planID;
    
    cpv.create=function(divParent,id){

        planID = id;

        console.log("Billing Plan Detail comming up...."+id);
        //Focus on tab
        dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId('contentWorkspacePlanView'+id));

       //----------------
        //Tab Container
        var tc = new dijit.layout.TabContainer({
            tabPosition: "top",
            nested: false,
            style : "width:auto;height:100%; padding: 10px; border: 1px solid #000000;"
        },document.createElement("div"));

        dijit.byId('contentWorkspacePlanView'+id).attr('content',tc.domNode);

            //Tab
            var tcOne    = new dijit.layout.ContentPane({title : tr.tr({'module': 'PlanView','phrase':"Basic",'lang':l})});
            //Tab
            var tcTwo     = new dijit.layout.ContentPane({title : tr.tr({'module': 'PlanView','phrase':"Promotions",'lang':l})});
            //Tab
            var tcThree     = new dijit.layout.ContentPane({title : tr.tr({'module': 'PlanView','phrase':"Extra Caps",'lang':l})});
            //-------------------------------
            dojo.connect(tc, 'selectChild',function(e){

                //------------------------------
                if(e == tcTwo){
                    if(e.domNode.childNodes.length == 0){

                        var divPromo = document.createElement("div");
                        dojo.addClass(divPromo, 'divTabForm');
                        tcTwo.attr('content',divPromo);
                        dojo.require("content.PlanViewPromotions");
                        dojo.addOnLoad(function(){
                            console.log("Promotions Loaded Fine");
                            content.PlanViewPromotions.add(divPromo,planID);
                        });
                    }
                }
                //------------------------------
                //------------------------------
                if(e == tcThree){
                    if(e.domNode.childNodes.length == 0){

                        var divExtra = document.createElement("div");
                        dojo.addClass(divExtra, 'divTabForm' );
                        //Widen it a bit
                        dojo.style(divExtra,'width', '40em');
                        tcThree.attr('content',divExtra);
                        dojo.require("content.PlanViewExtra");
                        dojo.addOnLoad(function(){
                            console.log("Extra Usage Loaded Fine");
                            content.PlanViewExtra.add(divExtra,planID);
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

        
        var divBasic = document.createElement("div");
        dojo.addClass(divBasic, 'divTabForm');
        tcOne.attr('content',divBasic);

        dojo.require("content.PlanViewBasic");
        dojo.addOnLoad(function(){

            console.log('Basic Plan Loaded OK');
            content.PlanViewBasic.add(divBasic,planID);
        });
        

    }

})();//(function(){

}
