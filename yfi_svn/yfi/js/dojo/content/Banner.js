/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.Banner"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Banner"] = true;
dojo.provide("content.Banner");
dojo.require("dijit.form.Button");
dojo.require('components.Translator');
dojo.require('components.Const');
dojo.require('components.Common');

(function(){

    var cb              = content.Banner;    //To save some typing
    var urlPassword     = components.Const.cake+'users/json_password';
    var urlLanguages    = components.Const.cake+'users/json_languages';
    var urlChangeLang   = components.Const.cake+'users/json_change_language';
    var tr              = components.Translator;
    var l               = components.LoginLight.UserInfo.l_iso;


    //The dynamic scaling script
    var imgHeight           = 80;
    var imgWidth            = 80;
    var urlDynamic          = '/c2/yfi_cake/files/image.php?height='+imgHeight+'&width='+imgWidth+'&image=';
    var urlMasterImages     = '/c2/yfi_cake/webroot/img/graphics/';

    cb.create = function(parent_dom){

            var lo = new Image();

            if(typeof components.LoginLight.UserInfo.logo_file != 'undefined'){
                lo.src  = urlDynamic+urlMasterImages+components.LoginLight.UserInfo.logo_file;
            }else{
                lo.src = urlDynamic+urlMasterImages+"logo.jpg";
            }
            lo.align="right";
        dojo.place(lo,parent_dom);

            
            var divBannerUser  = document.createElement("div");    //A Div to indicate if it is busy
            dojo.addClass(divBannerUser, "divBannerUser");
            var user_string  =      tr.tr({'module': 'Banner','phrase':"Username",'lang':l})+
                                    ': '+
                                    components.LoginLight.UserInfo.User.username +
                                    '<br>'+tr.tr({'module': 'Banner','phrase':"Group",'lang':l})+': '+
                                    components.LoginLight.UserInfo.group+' <br>';
            var info = document.createElement('span');
            info.innerHTML = user_string;
            components.QElements.addAction({Name:tr.tr({'module': 'Banner','phrase':"Change Language",'lang':l}),Type:l,Parent: divBannerUser,Action:cb.lang,Id:null});
            components.QElements.addAction({Name:tr.tr({'module': 'Banner','phrase':"Change Password",'lang':l}),Type:'password',Parent: divBannerUser,Action:cb.password,Id:null});
            dojo.place(info,divBannerUser);
           // divBannerUser.innerHTML= user_string;
           // console.log(components.Security.UserInfo);

        dojo.place(divBannerUser,parent_dom);
        

            var logo = new Image();
            logo.id  = "contentBannerLogo";
            logo.src = "img/banner/voucher.jpg";
        dojo.place(logo,parent_dom);

            var h2Descr =document.createElement('h1');
            h2Descr.id        = "contentBannerHeading";
            dojo.style(h2Descr,"display",'inline');

        dojo.place(h2Descr,parent_dom);

            var btnSingleVoucher = new dijit.form.Button({
                style:"margin:1px; margin-left:350px",
                label:tr.tr({'module': 'Banner','phrase':"Exit",'lang':l}),
                iconClass:"cancelIcon",
                onClick: function(){ components.LoginLight.logout(); },
                id:'contentBannerLogout'
            },document.createElement("div"));
        dojo.place(btnSingleVoucher.domNode, parent_dom);


                        //Add a periodic check which will report if reprepro is working
    }

    cb.changeLogo   = function(logo_name){
        dojo.byId("contentBannerLogo").src = "img/banner/"+logo_name;
    };

    cb.changeHeading = function(heading){
        dojo.byId("contentBannerHeading").innerHTML = heading;
    }

    cb.password  = function(){
        console.log("Change Password");
        dlgPwd = new dijit.Dialog({
                    title: tr.tr({'module': 'Banner','phrase':"Change Password for",'lang':l})+" "+components.LoginLight.UserInfo.User.username,
                    style: "width: 420px"
                });
            var frmPwd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
                hiddenId.type   = "hidden";
                hiddenId.name   = "id";
                hiddenId.value  = components.LoginLight.UserInfo.User.id;
            dojo.place(hiddenId,frmPwd.domNode);

                components.QElements.addPair({label:tr.tr({'module': 'Banner','phrase':"New Password",'lang':l}), divToAdd: frmPwd.domNode,inpName:'password', inpRequired:true, isLast:true});
                var btnPwd = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'Banner','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));

            //-----------------------------------
            dojo.connect(btnPwd,'onClick',function(){

                if(frmPwd.validate()){
                    components.Common.dialogConfirm(cb.confirm_ok,{'frmPwd':frmPwd,'dlgPwd': dlgPwd});
                }
                /*
                if(frmPwd.validate()){
                    console.log('Form is valid...');
                    var frmObj = dojo.formToObject(frmPwd.domNode); //Convert the Form to an object
                    dojo.xhrPost({
                        url: urlPassword,
                        content: frmObj,
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Banner','phrase':"Password Changed OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
                                    dlgPwd.destroyRecursive(false); //Destroy the dialog
                                }
                                if(response.json.status == 'error'){
                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                            }
                    });
                }
                */
            });
            //------------------------------------

        dojo.place(btnPwd.domNode,frmPwd.domNode);
        dlgPwd.attr('content',frmPwd);
        dlgPwd.show();
        //-------------------------------
        
   }

    cb.lang  = function(){
        console.log("Change Language");
        
        dlgLang = new dijit.Dialog({
                    title: tr.tr({'module': 'Banner','phrase':"Change Language for",'lang':l})+" "+components.LoginLight.UserInfo.User.username,
                    style: "width: 420px"
                });
            var frmLang    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
                hiddenId.type   = "hidden";
                hiddenId.name   = "id";
                hiddenId.value  = components.LoginLight.UserInfo.User.id;
            dojo.place(hiddenId,frmLang.domNode);
                components.QElements.addComboBox({ label:tr.tr({'module': 'Banner','phrase':"Language",'lang':l}),url:urlLanguages, divToAdd: frmLang.domNode,inpName:'language',inpRequired:true, isLast:true,searchAttr:'name',value: components.LoginLight.UserInfo.User.language_id});
                var btnLang = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'Banner','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));

            //-----------------------------------
            dojo.connect(btnLang,'onClick',function(){

                if(frmLang.validate()){
                    console.log('Form is valid...');

                    var frmObj = dojo.formToObject(frmLang.domNode); //Convert the Form to an object

                    dojo.xhrPost({
                        url: urlChangeLang,
                        content: frmObj,
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Banner','phrase':"Language Changed OK",'lang':l})+'</b><br><b>'+tr.tr({'module': 'Banner','phrase':"Log out to activate",'lang':l})+'</b>','message',components.Const.toasterInfo);
                                    dlgLang.destroyRecursive(false); //Destroy the dialog
                                }
                                if(response.json.status == 'error'){
                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                            }
                    });
                }
            });
            //------------------------------------

        dojo.place(btnLang.domNode,frmLang.domNode);
        dlgLang.attr('content',frmLang);
        dlgLang.show();
        //-------------------------------
    }

    cb.confirm_ok   = function(attr_basket){
            console.log('Form is valid...');
            var frmObj = dojo.formToObject(attr_basket.frmPwd.domNode); //Convert the Form to an object
            dojo.xhrPost({
                url: urlPassword,
                content: frmObj,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Banner','phrase':"Password Changed OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
                            attr_basket.dlgPwd.destroyRecursive(false); //Destroy the dialog
                        }
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                }
            });
        }

})();//(function(){

}
