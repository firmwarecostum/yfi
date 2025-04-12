/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.PermanentGeneral"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PermanentGeneral"] = true;
dojo.provide("content.PermanentGeneral");

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('components.QElements');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Formatters');
dojo.require('components.Translator');

(function(){
    var cpg                     = content.PermanentGeneral;
    var userID;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;
    var urlTabs                 = components.Const.cake+'permanent_users/json_tabs/'+components.LoginLight.UserInfo.User.id+'/?';

    cpg.create=function(divParent){

        userID = components.LoginLight.UserInfo.User.id;    //The user ID is the user who logged in

        console.log("General Detail comming up...."+userID);
        //Focus on tab
        dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId('contentPermanentGeneral'));

       //----------------
        //Tab Container
        var tc = new dijit.layout.TabContainer({
            tabPosition: "top",
            nested: false,
            style : "width:auto;height:100%; padding: 10px; border: 1px solid #000000;"
        },document.createElement("div"));

        dijit.byId('contentPermanentGeneral').attr('content',tc.domNode);

        //Add the tabs -> Which Tabs will depend on the feedback on the rights of user
        var ts = Number(new Date());
        dojo.xhrGet({
            url: urlTabs+ts,
            preventCache: true,
            handleAs: "json",
            load: function(response){
                if(response.json.status == 'ok'){

                    var counter = 0;
                    dojo.forEach(response.tabs,function(item){
                       // console.log("Tab is...");
                       // console.log(item);
                        var t    = new dijit.layout.ContentPane({title : tr.tr({'module': 'PermanentGeneral','phrase':item.name,'lang':l})});
                        tc.addChild(t);
                        dojo.connect(tc,'selectChild',function(e){
                            if(e == t){
                              //  console.log("Clicked on ",item.name);
                                if(e.domNode.childNodes.length == 0){
                                    var d = document.createElement("div");
                                    dojo.addClass(d, item.class);
                                    t.attr('content',d);
                                    dojo.require(item.module);
                                    dojo.addOnLoad(function(){
                                        console.log("Tab Module Loaded Fine ",item.module);
                                        content[item.file]['create'](d,userID);
                                    });
                                }
                            }
                        });

                        //The first one should be auto populated
                        if(counter == 0){
                            var first = document.createElement("div");
                            dojo.addClass(first, item.class);
                            t.attr('content',first);
                            dojo.require(item.module);
                            dojo.addOnLoad(function(){
                                console.log("Tab Module Loaded Fine ",item.module);
                                content[item.file]['create'](first,userID);
                            });

                        }
                        counter = counter + 1;
                    });
                    tc.startup();
                };
                if(response.json.status == 'error'){
                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                }
            }
        });

        /*

            //Tab
            var tcOne    = new dijit.layout.ContentPane({title : tr.tr({'module': 'PermanentGeneral','phrase':"User Detail",'lang':l})});
            //Tab
            var tcTwo     = new dijit.layout.ContentPane({title : tr.tr({'module': 'PermanentGeneral','phrase':"Notification",'lang':l})});
            //Tab
            var tcThree     = new dijit.layout.ContentPane({title : tr.tr({'module': 'PermanentGeneral','phrase':"Usage",'lang':l})});
            //Tab
            var tcFour    = new dijit.layout.ContentPane({title : tr.tr({'module': 'PermanentGeneral','phrase':"Profile Attributes",'lang':l})});
            //Tab
            var tcFive     = new dijit.layout.ContentPane({title : tr.tr({'module': 'PermanentGeneral','phrase':"Private Attributes",'lang':l})});
            //Tab
            var tcSix     = new dijit.layout.ContentPane({title : tr.tr({'module': 'PermanentGeneral','phrase':"Activity",'lang':l})});
            //Tab
            var tcSeven     = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Extra Services",'lang':l})});
            tcSeven.userID  = userID;
            //Tab
            var tcEight     = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Devices",'lang':l})});
            tcEight.userID  = userID;
            //Tab
            var tcNine     = new dijit.layout.ContentPane({title : tr.tr({'module': 'UserView','phrase':"Internet Credit",'lang':l})});
            tcNine.userID  = userID;


            
            //-------------------------------
            dojo.connect(tc, 'selectChild',function(e){

                //------------------------------
                if(e == tcTwo){
                    if(e.domNode.childNodes.length == 0){

                        var divNotify = document.createElement("div");
                        dojo.addClass(divNotify, 'divTabForm');
                        tcTwo.attr('content',divNotify);
                        dojo.require("content.PermanentGeneralNotify");
                        dojo.addOnLoad(function(){
                            console.log("Notify Loaded Fine");
                            content.PermanentGeneralNotify.add(divNotify,userID);
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
                        dojo.require("content.PermanentGeneralUsage");
                        dojo.addOnLoad(function(){
                            console.log("Usage Loaded Fine");
                            content.PermanentGeneralUsage.add(divUsage,userID);
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
                        dojo.require("content.PermanentGeneralProfile");
                        dojo.addOnLoad(function(){
                            content.PermanentGeneralProfile.add(divProfile,userID);
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
                        dojo.require("content.PermanentGeneralPrivate");
                        dojo.addOnLoad(function(){
                            content.PermanentGeneralPrivate.add(divPrivate,userID);
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
                        dojo.require("content.PermanentGeneralActivity");
                        dojo.addOnLoad(function(){
                            content.PermanentGeneralActivity.add(divActivity,userID);
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
                        dojo.require("content.PermanentGeneralServices");
                        dojo.addOnLoad(function(){
                            content.PermanentGeneralServices.create(divServices,tcSeven.userID);
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
                        dojo.require("content.PermanentGeneralDevices");
                        dojo.addOnLoad(function(){
                            content.PermanentGeneralDevices.create(divDevices,tcEight.userID);
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
                        dojo.require("content.PermanentGeneralCredits");
                        dojo.addOnLoad(function(){
                            content.PermanentGeneralCredits.create(divCredits,tcNine.userID);
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
        //---------------------


        //Initialise the tabs
        tc.startup();


        var divPersonal = document.createElement("div");
        dojo.addClass(divPersonal, 'divTabForm');
        tcOne.attr('content',divPersonal);

        dojo.require("content.PermanentGeneralPersonal");
        dojo.addOnLoad(function(){

            console.log('Permanent Personal View Loaded OK');
            content.PermanentGeneralPersonal.add(divPersonal,userID);
        });
        */

    }

})();//(function(){

}
