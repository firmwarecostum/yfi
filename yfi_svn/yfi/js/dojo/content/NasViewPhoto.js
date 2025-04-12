/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.NasViewPhoto"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.NasViewPhoto"] = true;
dojo.provide("content.NasViewPhoto");
dojo.require('dojo.io.iframe'); 
dojo.require('dijit.ProgressBar');
dojo.require('components.Translator');


(function(){
    var cnvp            = content.NasViewPhoto;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var nasID;
    var container;
    var imgPhoto;

    var urlASVpnView        = components.Const.cake+'auto_setups/json_vpn_view/';
    var urlASVpnSave        = components.Const.cake+'auto_setups/json_vpn_edit/';
    var urlUpload           = components.Const.cake+'nas/json_upload_image/';
    var urlLogo             = components.Const.cake+'nas/json_photo_for_nas/';
    var urlGraphics         = components.Const.cake+'img/graphics/';

    //The dynamic scaling script
    var imgHeight           = 400;
    var imgWidth            = 400;
    var urlDynamic          = '/c2/yfi_cake/files/image.php?height='+imgHeight+'&width='+imgWidth+'&image=';
    var urlMasterImages     = '/c2/yfi_cake/webroot/img/graphics/';
    

    cnvp.add   = function(divContainer,id){
        
        nasID       = id;
        container   = divContainer;

        console.log("Create Photo View");
        var divUpload   = document.createElement("div");
        divUpload.id    = 'divUpload'+id;
        dojo.addClass(divUpload, "divUpload");
        dojo.style(divUpload,{width: '30em'});
            //Add the action stuff
                var frmUpload       = new dijit.form.Form({id:'frmUpload'+id, encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
                hiddenId.type   = "hidden";
                hiddenId.name   = "id";
                hiddenId.value  = nasID;
            dojo.place(hiddenId,frmUpload.domNode);


                var upload      = document.createElement('input');
                upload.type = 'file';
                upload.name = 'fileToUpload'+id;
                upload.id   = 'ContentViewItemGraphic';
                dojo.place(upload,frmUpload.domNode);

            dojo.place(frmUpload.domNode,divUpload);
            var divActions = document.createElement('div');
                components.QElements.addAction({Name:tr.tr({'module': 'RealmView','phrase':"Upload",'lang':l}),Type:'upload',Parent: divActions,Action:cnvp.upload,Id:id});
            dojo.style(divActions,{'float': 'right','display': 'inline'});
            dojo.place(divActions,divUpload);
        dojo.place(divUpload,divContainer);

        //--Progressbar
        var divProgress = document.createElement("div");
        dojo.addClass(divProgress, "divProgress");
        dojo.style(divProgress,{width: '30em'});
        divProgress.id  = 'divProgress'+id;
        dojo.style(divProgress,"display","none");   //hide it

            var pb = new dijit.ProgressBar({style:"width:380px",indeterminate: "true"},document.createElement('div'));
        dojo.place(pb.domNode,divProgress);
            var txt=document.createTextNode(tr.tr({'module': 'RealmView','phrase':"Uploading, please wait",'lang':l})+'....');
        dojo.place(txt,divProgress);
        dojo.place(divProgress,divContainer);

        //---------Current Graphics-----------------------
         dojo.xhrGet({
            url: urlLogo+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){
                if(response.json.status == 'ok'){
                    cnvp.addPhoto(response.logo.file_name,id);
                };
                if(response.json.status == 'error'){
                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                }
            }
        });
        //---------------------------------------------
    }

    cnvp.addPhoto      = function(file_name,id){

        if(imgPhoto != undefined){
            console.log('Destroy existing one');
            dojo._destroyElement(imgPhoto);
        }
        //file_name = '5.jpg';
        //Destroy previous one if existed
        imgPhoto    = new Image();
        var ts      = Number(new Date());
        dojo.style(imgPhoto,{"marginTop":"10px","border":"10px solid #adb5c6","padding":'10px;'});
        //Add a dynamic scalable image
        //imgPhoto.src= urlGraphics+file_name+'&'+ts;
        imgPhoto.src= urlDynamic+urlMasterImages+file_name+'&time='+ts;
        dojo.place(imgPhoto,container);
    }

    cnvp.upload  = function(id){

        console.log("Uploading for "+id);
        //
        /* Hide the upload div */
        dojo.style(dojo.byId('divUpload'+id),"display","none");
        dojo.style(dojo.byId('divProgress'+id),"display","block");
        
        dojo.io.iframe.send({
            url: urlUpload+id,
            method: "post",
            handleAs: "text",
            form: dijit.byId('frmUpload'+id).domNode,
            handle: function(data,ioArgs){
                var response = dojo.fromJson(data);
                if (response.json.status == 'ok'){
                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'RealmView','phrase':"Image uploaded OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
                    dojo.style(dojo.byId('divUpload'+id),"display","block");
                    dojo.style(dojo.byId('divProgress'+id),"display","none");
                    cnvp.addPhoto(response.image.file,id);
                }
                if(response.json.status == 'error'){
                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                }
            }
        });
    }

})();//(function(){

}
