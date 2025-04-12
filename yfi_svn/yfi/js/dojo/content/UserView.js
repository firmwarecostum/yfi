/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.UserView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.UserView"] = true;
dojo.provide("content.UserView");

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('components.QElements');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('components.Formatters');
dojo.require('components.Translator');

(function(){
    var cuv             = content.UserView;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var userID;
    
    cuv.create=function(divParent,id){

        userID = id;

        console.log("User Detail comming up...."+id);

        //Focus on tab
        dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId('contentWorkspaceUser'+id));

       //----------------
        //Tab Container
        var tc = new dijit.layout.TabContainer({
            tabPosition: "top",
            nested: false,
            style : "width:auto;height:100%; padding: 10px; border: 1px solid #000000;"
        },document.createElement("div"));

        dijit.byId('contentWorkspaceUser'+id).attr('content',tc.domNode);

            //Tab
            var tcOne    = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"User Detail",'lang':l})});
            tcOne.userID  = userID;
            //Tab
            var tcTwo     = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Notification",'lang':l})});
            tcTwo.userID  = userID;
            //Tab
            var tcThree     = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Usage",'lang':l})});
            tcThree.userID  = userID;
            //Tab
            var tcFour    = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Profile Attributes",'lang':l})});
            tcFour.userID  = userID;
            //Tab
            var tcFive     = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Private Attributes",'lang':l})});
            tcFive.userID  = userID;
            //Tab
            var tcSix     = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Activity",'lang':l})});
            tcSix.userID  = userID;
            //Tab
            var tcSeven     = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Extra Services",'lang':l})});
            tcSeven.userID  = userID;
			//Tab
            var tcEight     = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Devices",'lang':l})});
            tcEight.userID  = userID;
            //Tab
            var tcNine     = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Internet Credit",'lang':l})});
            tcNine.userID  = userID;
            //Tab
            var tcTen       = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Rights",'lang':l})});
            tcTen.userID    = userID;
            //Tab
            var tcEleven    = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Notes",'lang':l})});
            tcEleven.userID = userID;

            //-------------------------------
            dojo.connect(tc, 'selectChild',function(e){

                //------------------------------
                if(e == tcTwo){
                    if(e.domNode.childNodes.length == 0){

                        var divNotify = document.createElement("div");
                        dojo.addClass(divNotify, 'divTabForm');
                        tcTwo.attr('content',divNotify);
                        dojo.require("content.UserViewNotify");
                        dojo.addOnLoad(function(){
                            console.log("Notify Loaded Fine");
                            content.UserViewNotify.add(divNotify,tcTwo.userID);
                        });
                    }
                }
                //------------------------------
                //------------------------------
                if(e == tcThree){
                    if(e.domNode.childNodes.length == 0){

                        var divUsage = document.createElement("div");
                        dojo.addClass(divUsage, 'divTabInTab' );
                        tcThree.attr('content',divUsage);
                        dojo.require("content.UserViewUsage");
                        dojo.addOnLoad(function(){
                            console.log("Usage Loaded Fine");
                            content.UserViewUsage.add(divUsage,tcThree.userID);
                        });
                    }
                }
                //----------------------------


                //------------------------------
                if(e == tcFour){
                    if(e.domNode.childNodes.length == 0){

                        var divProfile = document.createElement("div");
                        dojo.addClass(divProfile, 'divTabInTab' );
                        tcFour.attr('content',divProfile);
                        dojo.require("content.UserViewProfile");
                        dojo.addOnLoad(function(){
                            content.UserViewProfile.addProfile(divProfile,tcFour.userID);
                        });
                    }
                }
                //----------------------------

                //------------------------------
                if(e == tcFive){
                    if(e.domNode.childNodes.length == 0){

                        var divPrivate = document.createElement("div");
                        dojo.addClass(divPrivate, 'divTabInTab' );
                        tcFive.attr('content',divPrivate);
                        dojo.require("content.UserViewPrivate");
                        dojo.addOnLoad(function(){
                            content.UserViewPrivate.addPrivate(divPrivate,tcFive.userID);
                        });
                    }
                }
                //----------------------------

                 //------------------------------
                if(e == tcSix){
                    if(e.domNode.childNodes.length == 0){

                        var divActivity = document.createElement("div");
                        dojo.addClass(divActivity, 'divTabInTab' );
                        tcSix.attr('content',divActivity);
                        dojo.require("content.UserViewActivity");
                        dojo.addOnLoad(function(){
                            content.UserViewActivity.add(divActivity,tcSix.userID);
                        });
                    }
                }
                //----------------------------

                //------------------------------
                if(e == tcSeven){
                    if(e.domNode.childNodes.length == 0){

                        var divServices = document.createElement("div");
                        dojo.addClass(divServices, 'divTabInTab' );
                        tcSeven.attr('content',divServices);
                        dojo.require("content.UserViewServices");
                        dojo.addOnLoad(function(){
                            content.UserViewServices.create(divServices,tcSeven.userID);
                        });
                    }
                }
                //----------------------------

				//------------------------------
                if(e == tcEight){
                    if(e.domNode.childNodes.length == 0){

                        var divDevices = document.createElement("div");
                        dojo.addClass(divDevices, 'divTabInTab' );
                        tcEight.attr('content',divDevices);
                        dojo.require("content.UserViewDevices");
                        dojo.addOnLoad(function(){
                            content.UserViewDevices.create(divDevices,tcEight.userID);
                        });
                    }
                }
                //----------------------------

                //------------------------------
                if(e == tcNine){
                    if(e.domNode.childNodes.length == 0){

                        var divCredits = document.createElement("div");
                        dojo.addClass(divCredits, 'divTabInTab' );
                        tcNine.attr('content',divCredits);
                        dojo.require("content.UserViewCredits");
                        dojo.addOnLoad(function(){
                            content.UserViewCredits.create(divCredits,tcNine.userID);
                        });
                    }
                }
                //----------------------------

                //------------------------------
                if(e == tcTen){
                    console.log('Rights tab clicked');
                    if(e.domNode.childNodes.length == 0){

                        e.attr('content',components.Common.divWorking());

                        dojo.require('content.UserRights');
                        dojo.addOnLoad(function(){
                            content.UserRights.create(e.domNode,tcTen.userID);
                        });

                    }
                }
                //----------------------------

                //------------------------------
                if(e == tcEleven){
                    console.log('Notes tab clicked');
                    if(e.domNode.childNodes.length == 0){
                        dojo.require('content.Notes');
                        dojo.addOnLoad(function(){
                            content.Notes.create(e.domNode,{'id': tcEleven.userID,'tab':'user'});
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
            tc.addChild(tcFive);
            tc.addChild(tcSix);
            tc.addChild(tcSeven);
			tc.addChild(tcEight);
            tc.addChild(tcNine);
            tc.addChild(tcTen);
            tc.addChild(tcEleven);
        //---------------------

        //Initialise the tabs
        tc.startup();

        
        var divPersonal = document.createElement("div");
        dojo.addClass(divPersonal, 'divTabForm');
        tcOne.attr('content',divPersonal);

        dojo.require("content.UserViewPersonal");
        dojo.addOnLoad(function(){

            console.log('Personal View Loaded OK');
            content.UserViewPersonal.getUserDetail(divPersonal,userID);
        });

    }

})();//(function(){

}
