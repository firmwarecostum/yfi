/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["components.LoginLight"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["components.LoginLight"] = true;
dojo.provide("components.LoginLight");
dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Form");

//Add the grid on this one
dojo.require("dojox.grid.DataGrid");

dojo.require('components.Const');
dojo.require('components.QElements');
dojo.require('components.Translator');
//---------------------------------------------------------------------------------
//--This Security component will become the most important component--------------
//--of our application - It will create the main view if already authenticated----
//--or will pop up a login box if not---------------------------------------------
//--------------------------------------------------------------------------------
(function(){

    var cll                 = components.LoginLight;
    var urlUsersLoginCheck  = components.Const.cake+'users/json_login_check';
    var urlUsersLogin       = components.Const.cake+'users/json_login';
    var urlUsersLogout      = components.Const.cake+'users/logout';
    var urlLanguages        = components.Const.cake+'users/json_languages/true/';
    var tr                  = components.Translator;
    var lang;


    cll.isLoggedin   = function(divParent,l){
        var l   = (l == null) ? "en" : l;       //Make the defaul language 'en'
        lang    = l;

         //--Clean up is 2nd time round ----
        if(dijit.byId('componentLoginLightLanguage') != undefined){
            dijit.byId('componentLoginLightLanguage').destroyDescendants(true);
            dijit.byId('componentLoginLightLanguage').destroy(true);
        }
        //-------------------------------


        console.log("Check if we are logged in");
        dojo.xhrGet({
            handleAs: 'json',
            preventCache: true,
            url: urlUsersLoginCheck ,
            load: function(response){
                console.log(response);
                if(response.authenticated == false){
                    console.log("User in NOT logged in");
                    cll.addLogin(divParent);
               
                }else{
                    console.log("User is logged in");
                    cll.UserInfo = response.user;
                    dojo.require("components.Main");
                    dojo.addOnLoad(function(){
                        components.Main.startUp();               //Checked if we need to log in
                    });
                }
            },

            error: function(error){
                console.log(error.message);
            }
        });
    };

    cll.addLogin    = function(divParent){

 
        var frmLogin    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
            var divLogInFeedback = document.createElement("div");
            divLogInFeedback.id  = 'componentLoginLightFeedback';
            dojo.place(divLogInFeedback,frmLogin.domNode);


            components.QElements.addPair({label:"Username",divToAdd:  frmLogin.domNode,inpName:'Username',inpRequired:true, isLast:false, id:'componentLoginLightUsername',focus:true});
            components.QElements.addPair({label:"Password",divToAdd:  frmLogin.domNode,inpName:'Password',inpRequired:true, isLast:false, pw:true, id:'componentLoginLightPassword'});
            components.QElements.addComboBox({ label:"Language",url:urlLanguages+lang, divToAdd: frmLogin.domNode,inpName:'language',inpRequired:true, isLast:true,searchAttr:'name',value: lang, id :'componentLoginLightLanguage'});
            var btnClear = new dijit.form.Button({style:"margin:10px; margin-left:1px;",label:"Clear",iconClass:"clearIcon"},document.createElement("div"));
            dojo.connect(btnClear,"onClick",function(e){
                console.log('Clear form');
                dijit.byId('componentLoginLightUsername').attr('value','');
                dijit.byId('componentLoginLightPassword').attr('value','');
                dojo.byId('componentLoginLightFeedback').innerHTML = "";
            });


        dojo.place(btnClear.domNode,frmLogin.domNode);
        
            var btnOk = new dijit.form.Button({style:"margin:10px; margin-left:1px;",label:"OK",iconClass:"okIcon"},document.createElement("div"));
            dojo.connect(btnOk,"onClick",function(e){

                if(frmLogin.validate()){
                    console.log("Valid input ...try and log in");
                    _authenticate(frmLogin);
                }
            });
      
        dojo.place(btnOk.domNode,frmLogin.domNode);
        dojo.place(frmLogin.domNode,divParent);

        //Catch the Enter key
        dojo.connect(dojo.byId('divLoadingMessage'), 'onkeypress', function(evt) {
            key = evt.keyCode;
            if (key == dojo.keys.ENTER){
                if(frmLogin.validate()){
                        console.log("Valid input ...try and log in");
                        _authenticate(frmLogin);
                }
            }
        });

        //---Language-----
        dijit.byId('componentLoginLightLanguage').attr('intermediateChanges',true);
        dojo.connect(dijit.byId('componentLoginLightLanguage'),'onChange',
            function(newValue){

                lang = newValue;    //Change the language setting
                var list = dojo.query('label',divParent).forEach(function(l){       //Query and Change the labels
                    console.log("Hit");
                    console.log(l.innerHTML);
                    l.innerHTML = tr.tr({'module': 'LoginLight','phrase':l.en,'lang':lang});
                });
                btnOk.attr('label',tr.tr({'module': 'LoginLight','phrase':btnOk.en,'lang':lang}));
                btnClear.attr('label',tr.tr({'module': 'LoginLight','phrase':btnClear.en,'lang':lang}));
                var store           = new dojo.data.ItemFileReadStore({url:urlLanguages+lang});
                dijit.byId('componentLoginLightLanguage').attr('store',store);  //Change tha language of the dropdown
                dijit.byId('componentLoginLightLanguage').attr('value',lang);  //Change tha language of the dropdown
            });

        //-----------------------------------------------------------------------------------
        //--We have to set an attribute on the labels in order to know their english phrase--
        //--We then translate them to the selected language----------------------------------
        //-----------------------------------------------------------------------------------
        var list = dojo.query('label',divParent).forEach(function(l){       //Query and Change the labels
            l.en = l.innerHTML;
            l.innerHTML = tr.tr({'module': 'LoginLight','phrase':l.en,'lang':lang});
        });
        btnOk.attr('en','OK');
        btnOk.attr('label',     tr.tr({'module': 'LoginLight','phrase':btnOk.en,'lang':lang}));
        btnClear.attr('en','Clear');
        btnClear.attr('label',  tr.tr({'module': 'LoginLight','phrase':btnClear.en,'lang':lang}));
        //---------------------------------------------------------------------------------
        //---END Language-----

        dijit.byId('componentLoginLightUsername').focus();
    }

    function _authenticate(frmLogin){

        var frmObj = dojo.formToObject(frmLogin.domNode); //Convert the Form to an object
        console.log(frmObj);

        //------------------
        dojo.xhrPost({
            url: urlUsersLogin,
            handleAs: 'json',
            content: frmObj,
            //---xhttp OK------
            load:   function(response){
                        //--Error--(auth)
                        if(response.json.status == 'error'){
                                                 dojo.byId('componentLoginLightFeedback').innerHTML = tr.tr({'module': 'LoginLight','phrase':"Authentication Failed",'lang':lang});
                                             };
                        //--OK---
                        if(response.json.status == 'ok'){

                            dijit.byId('componentLoginLightUsername').destroyRecursive(true);
                            dijit.byId('componentLoginLightPassword').destroyRecursive(true);
                            cll.UserInfo = response.user;
                            dojo.require("components.Main");
                            dojo.addOnLoad(function(){

                                components.Main.startUp();               //Checked if we need to log in
                            }); 
                        }
                    },

            //---xhttp error---
            error:  function(error){
                        console.log(error);
                        dojo.byId('componentLoginLightFeedback').innerHTML = tr.tr({'module': 'LoginLight','phrase':"Authentication Failed",'lang':lang})+": "+ error.message;
                    }
        });
        //-----------------------
    }


    cll.logout  = function(){

        console.log("Log out of YFi Hotspot manager");

        //console.debug("Log User Out");
        dojo.xhrGet({
            handleAs: 'json',
            preventCache: true,
            url: urlUsersLogout ,
            load:   function(response){
                        console.log(response.json.status);

                        if(dijit.byId('componentsMainBorderContainer') != undefined){
                            dijit.byId('componentsMainBorderContainer').destroyRecursive(false);
                        }

                        if(dijit.byId('componentsMainToaster') != undefined){
                            dijit.byId('componentsMainToaster').destroyRecursive(true);
                        }

                         if(dijit.byId('contentWorkspaceTabcontainer') != undefined){
                            dijit.byId('contentWorkspaceTabcontainer').destroyRecursive(true);
                        }

                        //Unsubscribe all the events
                        console.log("Unsubscribe to events!");
                        dojo.forEach(content.Workspace.subscribedList,function(handle){
                            dojo.unsubscribe(handle);
                        });

                        cll._createLoginView();
                        //--Experiment to reload 2 overcome language change problem
                        window.location.reload();
                    },
            error:  function(error){
                        console.log(error.message);
                    }
        });
    }

    cll._createLoginView = function(){

        //------------------------------------------
        //---ID's defined---------------------------
        //- 1.) divLoadingMessage ------------------
        //- 2.) divLoadinMessageSplashWrap ---------
        //------------------------------------------
        var divLM   = document.createElement("div");
        divLM.id    = 'divLoadingMessage';

            var divRCSplit   = document.createElement("div");
            dojo.addClass(divRCSplit, 'rc_split');
            dojo.place(divRCSplit,divLM);

                var head3       = document.createElement('h3');
                dojo.place(head3,divRCSplit);

                    var span3   = document.createElement('div');
                    span3.innerHTML = 'YFi Hotspot Manager';
                    dojo.place(span3,head3);

                var divRCContent    = document.createElement('div');
                dojo.addClass(divRCContent, 'content');
                dojo.place(divRCContent,divRCSplit);

                    var divSplashWrap   = document.createElement('div');
                    divSplashWrap.id    = 'divLoadingMessageSplashWrap';
                    dojo.place(divSplashWrap,divRCContent);

        dojo.place(divLM, dojo.body());
        //Round coners NOW!
        splitBorderBottom.render(divRCContent);
        splitBorderTop.render(head3);
         //Add the login part
        cll.isLoggedin(divSplashWrap,lang);               //Checked if we need to log in
    }

})();

}
