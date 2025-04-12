/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.Actions"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Actions"] = true;
dojo.provide("content.Actions");
dojo.require("dijit.layout.AccordionContainer");

dojo.require("components.QElements");
dojo.require('components.Translator');

(function(){

    var cua                 = content.Actions;
    var urlActionLayout     = components.Const.cake+'json_layouts/left_pane';
    var tr                  = components.Translator; 
    var l                   = components.LoginLight.UserInfo.l_iso;

    cua.create   = function(cpNavigator){
        //-------------------------------------------------------------------------------------------
        //--- This function will contact the server and depending on the return json's structure ----
        //--- it will build the accordion - Thus Enabling various levels of complexity --------------
        //-------------------------------------------------------------------------------------------
        var accordion = new dijit.layout.AccordionContainer({}, document.createElement("div"));
        dojo.xhrGet({
            url: urlActionLayout,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                if(response.json.status == 'ok'){

                    //-------------------------------------------
                    //-----------------Dynamic Menu Creation-----
                    //-------------------------------------------

                    var action_structure = response.menu;
                    for(var pane in action_structure){
                        console.log(pane);
                        addPaneNew(accordion,action_structure,pane);
                    }
                    //------------------------------------- 

                    //remove the dummy
                    accordion.removeChild(dummy);
                };

                if(response.json.status == 'error'){
                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                }
            }
        });

        var dummy      = new dijit.layout.AccordionPane({}, document.createElement("div")); //
        accordion.addChild(dummy);

        cpNavigator.attr('content',accordion.domNode);
        accordion.startup();
    }

    function addPaneNew(accordion,action_structure,pane){

        var img     = action_structure[pane]['img'];    //The img key contains the image to display in the banner
        var ap      = new dijit.layout.AccordionPane({title:pane,selected:false}, document.createElement("div"));

        ap.onSelected = function(){
            dijit.byId("componentsMainStatus").attr('content','<b>'+pane+'</b> '+tr.tr({'module': 'Actions','phrase':"selected",'lang':l}));
            content.Banner.changeHeading(pane);
            if(img != undefined){
                content.Banner.changeLogo(img);
            }
        }

        //------------------------------------------------
        //Dynamically add modules and their content (Modules usually start AM (Action Module) and the 'create' method thakes an accordion pane as argument.)
        if(action_structure[pane]['module'] != undefined){

            var mod_file    = action_structure[pane]['module']['file'];
            var mod_name    = action_structure[pane]['module']['name'];
            dojo.require(mod_file);
            dojo.addOnLoad(function(){
                var f = content[mod_name];
                f.create(ap);
            });
        }
        //-----------------------------------------------------

        //---------------------------------------------------------------
        //--If the action pane does not contain modules - we can add links that will publish events--
        if(action_structure[pane]['links'] != undefined){
            var a_list  = action_structure[pane]['links'];  //The links key contains a list of pairs => link and event to publish
            var ul      =document.createElement('ul');

            for(var action in a_list){
                var action_name = action;
                var event_name  = a_list[action_name];
                console.log(event_name);
                ul.appendChild(components.QElements.liAnchor({name:action_name,eventToPublish:event_name}));
            }
            ap.attr('content',ul);
        }
        //-----------------------------------------------------------

        accordion.addChild(ap);
    }

})();//(function(){

}
