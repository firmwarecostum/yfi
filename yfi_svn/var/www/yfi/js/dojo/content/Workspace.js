/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.Workspace"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Workspace"] = true;
dojo.provide("content.Workspace");

dojo.require("dijit.layout.TabContainer");
dojo.require("content.Homepage");

//SDM
//added for the translation
dojo.require('components.Translator');
//SDM

(function(){

    var cw= content.Workspace;

//SDM
//added for the translation
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;
//SDM

    var urlEventsToSubscribe   = components.Const.cake+'json_layouts/workspace';
    cw.subscribedList           = new Array();

    cw.create=function(cpWorkspace){

            var tcWorkarea      = new dijit.layout.TabContainer({
                id: 'contentWorkspaceTabcontainer',
                tabPosition: "top",
                style : "width:100%;height:100%; background-color: green;"
            },document.createElement("div"));
            cpWorkspace.attr('content',tcWorkarea.domNode);
            
            //---------------------------------------------
            //Get a list of events to subscribe to - events will create tabs inside 'contentWorkspaceTabcontainer'
            dojo.xhrGet({
                url: urlEventsToSubscribe,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                       // var mod_file = '';
                       //// console.log(response);
                        if(response.json.status == 'ok'){
                            for(var tabData in response.menu){

                                subscribeTab(response,tabData);
                               //// console.log(response.menu[tabData]);
                            }
                            dojo.publish('/actions/Homepage', []);  //Prime the home tab
                        };

                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            //---------------------------------------------
            tcWorkarea.startup();
            tcWorkarea.layout();

    }

    function subscribeTab(response,tabData){

        var mod_file = response.menu[tabData]['file'];
       //// console.log('mod_file',mod_file);
        makeTab({
            eventToSubscribe : response.menu[tabData]['eventToSubscribe'],
            tabToCreate      : response.menu[tabData]['tabToCreate'],
            tabTitle         : response.menu[tabData]['tabTitle'],
            closable         : response.menu[tabData]['closable'],
            requireModule    : response.menu[tabData]['module'],
            style            : response.menu[tabData]['style'],
            contentFunc      :  function(domItem,id){
                                    var fnc = content[mod_file];
                                    fnc.create(domItem,id);
                                }
        });
    }


    function makeTab(ao){

    var h = dojo.subscribe(ao.eventToSubscribe,function(id,tabName){    //id and tabName gets passed with the event when grid items are selected

            if(id == undefined){
                if(dijit.byId(ao.tabToCreate)){
                    dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId(ao.tabToCreate));
                }else{
//SDM
//added translation and changed tabToCreate to tabTitle for a userfriendly message
//                  dijit.byId('componentsMainToaster').setContent('<b>Loading '+ao.tabToCreate+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it 
                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Workspace','phrase':"Loading",'lang':l})+' '+ao.tabTitle+'</b>','message',components.Const.toasterInfo); //Notify the user that we added it
//SDM
                    var tabCreated  = new dijit.layout.ContentPane({id:ao.tabToCreate, title: ao.tabTitle, closable: ao.closable, selected: "true",iconClass:ao.style}, document.createElement("div"));
                    dijit.byId("contentWorkspaceTabcontainer").addChild(tabCreated);
                    dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId(ao.tabToCreate));

                    dojo.require(ao.requireModule);
                    dojo.addOnLoad(function(){
                        ao.contentFunc(tabCreated.domNode);
                    });

                }
            }else{
                if(dijit.byId(ao.tabToCreate+id)){
                    dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId(ao.tabToCreate+id));
                }else{
//SDM
//added translation and changed tabToCreate to tabTitle for a userfriendly message
//                  dijit.byId('componentsMainToaster').setContent('<b>Loading '+ao.tabToCreate+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it 
                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Workspace','phrase':"Loading",'lang':l})+' '+ao.tabTitle+'</b>','message',components.Const.toasterInfo); //Notify the user that we added it
//SDM
                    var tabCreated  = new dijit.layout.ContentPane({id:ao.tabToCreate+id, title: ao.tabTitle+' '+tabName, closable: ao.closable, selected: "true",iconClass:ao.style}, document.createElement("div"));
                    dijit.byId("contentWorkspaceTabcontainer").addChild(tabCreated);

                    dojo.require(ao.requireModule);
                    dojo.addOnLoad(function(){
                        ao.contentFunc(tabCreated.domNode,id);
                    });

                    dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId(ao.tabToCreate+id));
                }
            }
        });
        //Add it to the list aof subscribed events
        cw.subscribedList.push(h);

    };

})();//(function(){

}
