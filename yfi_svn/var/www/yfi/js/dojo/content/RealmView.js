/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.RealmView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.RealmView"] = true;
dojo.provide("content.RealmView");

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('dojo.io.iframe'); 
dojo.require('dijit.ProgressBar');
dojo.require('components.Translator');

//Add on
dojo.require('custom.PhotoUploader');

(function(){
    var cvu                 = content.RealmView;
    var tr                  = components.Translator; 
    var l                   = components.LoginLight.UserInfo.l_iso;

    var urlRealmDetail      = components.Const.cake+'realms/json_view/';
    var urlEdit             = components.Const.cake+'realms/json_edit';
    var urlLogo             = components.Const.cake+'realms/json_logo_for_realm/';
    var urlUpload           = components.Const.cake+'realms/json_upload_image/';
    var urlGraphics         = components.Const.cake+'img/graphics/';
    var urlPhotos           = components.Const.cake+'realms/json_photos_for_realm/';


    //The dynamic scaling script
    var imgHeight           = 400;
    var imgWidth            = 400;
    var urlDynamic          = '/c2/yfi_cake/files/image.php?height='+imgHeight+'&width='+imgWidth+'&image=';
    var urlMasterImages     = '/c2/yfi_cake/webroot/img/graphics/';

    cvu.create=function(divParent,id){

        //--------------------------------------
        //-- Container Hierarchy: divParent->divWrapper->cp.domNode->divTC->tc.domNode->[tab,tab,tab] 
        console.log("Realm Detail comming up...."+id);

        dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId('contentWorkspaceRealmView'+id));

       //----------------
         //Tab Container
        var tc = new dijit.layout.TabContainer({
            tabPosition: "top",
            style : "width:auto;height:100%; padding: 10px; border: 1px solid #000000;"
        },document.createElement('div'));

        dijit.byId('contentWorkspaceRealmView'+id).attr('content',tc.domNode);

            //Tab
            var tcOne    = new dijit.layout.ContentPane({title : tr.tr({'module': 'RealmView','phrase':"Detail",'lang':l})});

            //----------------------------------------------------------------
            var divContainer     = document.createElement('div');
            dojo.addClass(divContainer, 'divTabForm');

                cvu.getRealmDetail(divContainer,id);    //Populate the container div

            tcOne.attr('content',divContainer);
            //-----------------------------------------------------------------
            //Tab
            var tcTwo     = new dijit.layout.ContentPane({title : tr.tr({'module': 'RealmView','phrase':"Logo",'lang':l}), id: 'ContentViewRealmLogo'+id});

            //Tab for images of Realm (Eye candy for login pages)
            var tcThree     = new dijit.layout.ContentPane({title : tr.tr({'module': 'RealmView','phrase':"Gallery",'lang':l}), id: 'ContentViewRealmGallery'+id});

        tc.addChild(tcOne);
        tc.addChild(tcTwo);
        tc.addChild(tcThree);

        //-----------------------------------------------
        dojo.connect(tc, 'selectChild',function(e){

            //------------------------------
            if(e == tcTwo){
                console.log('Graphics');
                if(e.domNode.childNodes.length == 0){
                    var divTwo     = document.createElement('div');
                    dojo.addClass(divTwo, 'divTabForm');
                    cvu.getGraphicDetail(divTwo,id);    //Populate the container div
                    e.attr('content',divTwo);
                }
            }
            //----------------------------

              if(e == tcThree){
                console.log('Gallery');
                if(e.domNode.childNodes.length == 0){
                    var divThree    = document.createElement('div');
                   // dojo.addClass(divThree, 'divTabForm');
                    cvu.getGalleryDetail(divThree,id);    //Populate the container div
                    e.attr('content',divThree);
                }
            }

        });
        //---------------------

        //Initialise the tabs
        tc.startup();
    }

    //----- Get the Gallery Detail-----
    cvu.getGalleryDetail    = function(divContainer,id){

        //-- Add a div at the top to carry global actions --
        var divActions = document.createElement("div");
        dojo.addClass(divActions, 'divTabForm');
        dojo.place(divActions,divContainer); 


            //--Add instructions plus a button to upload new images
            var lbl =document.createElement('label');
                    var txt=document.createTextNode('Add new photo -> ');
                lbl.appendChild(txt);
            dojo.place(lbl,divActions);
            dojo.addClass(lbl, "frmRequired");

            var btnNew = new dijit.form.Button({style:" margin:10px; margin-left:1px",label:"New",iconClass:"addIcon"},document.createElement("div"));
            dojo.place(btnNew.domNode,divActions);
            
            dojo.connect(btnNew,'onClick',function(){
            //Add the Photo uploader
            //'49d09ec6-5480-45d4-a5ae-2b0ea509ff00'
            var pul = new custom.PhotoUploader({realm_id: id});
            pul.show_dialog(divContainer);
     
        });

        //-----------------------------------------------
        //-- Poplulate the page with existing photos ----
        //-----------------------------------------------
        var def = dojo.xhrGet({
					url: urlPhotos+id,
					handleAs: 'json',
                    preventCache: true
		});

        // Once ready, process the authors
    	def.then(function(gallery){
	        dojo.forEach(gallery.items, function(picture){
						// Create our widget and place it
                        //console.log(picture.title);
						var widget = new custom.PhotoWidget(picture).placeAt(divContainer);
		    });         
        });
    }

    cvu.getRealmDetail   = function(divContainer,id){

         dojo.xhrGet({
            url: urlRealmDetail+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    cvu.populateRealmDetail(divContainer,response.Realm);
                    //------------------------------------------------------

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });

    }


    cvu.populateRealmDetail = function(divContainer,realm){

        console.log(realm);

        
        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = realm.id;
        dojo.place(hiddenId,frmEdit.domNode);

            var ts = Number(new Date());
            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"Name",'lang':l}),             divToAdd: frmEdit.domNode,inpName:'Name',       inpRequired:true,  isLast:false,value: realm.name});
            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"Append String",'lang':l}),    divToAdd: frmEdit.domNode,inpName:'Append',     inpRequired:true,  isLast:false, value: realm.append_string_to_user});
            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"Phone",'lang':l}),            divToAdd: frmEdit.domNode,inpName:'Phone',      inpRequired:false, isLast:false, value: realm.phone});
            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"Fax",'lang':l}),              divToAdd: frmEdit.domNode,inpName:'Fax',        inpRequired:false, isLast:false, value: realm.fax});
            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"Cell",'lang':l}),             divToAdd: frmEdit.domNode,inpName:'Cell',       inpRequired:false, isLast:false, value: realm.cell});
            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"email",'lang':l}),            divToAdd: frmEdit.domNode,inpName:'Email',      inpRequired:false, isLast:false,  value: realm.email});
            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"url",'lang':l}),              divToAdd: frmEdit.domNode,inpName:'Url',        inpRequired:false, isLast:false,  value: realm.url});
            
            //Add a more granular adress for Goecoding:
                var lbl =document.createElement('label');
                    var txt=document.createTextNode(tr.tr({'module': 'RealmView','phrase':"Address",'lang':l}));
                lbl.appendChild(txt);
                dojo.addClass(lbl, "frmRequired");
            dojo.place(lbl,frmEdit.domNode);
                var br=document.createElement('br');
                br.clear = 'all';
            dojo.place(br,frmEdit.domNode);

            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"Street Number",'lang':l}),    divToAdd: frmEdit.domNode,inpName:'StreetNo',  inpRequired:false, isLast:false,  value: realm.street_no});
            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"Street",'lang':l}),           divToAdd: frmEdit.domNode,inpName:'Street',    inpRequired:false, isLast:false,  value: realm.street});
            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"Town / Suburb",'lang':l}),    divToAdd: frmEdit.domNode,inpName:'TownSuburb',inpRequired:false, isLast:false,  value: realm.town_suburb});
            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"City",'lang':l}),             divToAdd: frmEdit.domNode,inpName:'City',      inpRequired:false, isLast:false,  value: realm.city});

            //Add a more granular adress for Goecoding:
                var lbl1 =document.createElement('label');
                    var txt=document.createTextNode(tr.tr({'module': 'RealmView','phrase':"Location",'lang':l}));
                lbl1.appendChild(txt);
            dojo.addClass(lbl1, "frmRequired");
            dojo.place(lbl1,frmEdit.domNode);
                var br1=document.createElement('br');
                br1.clear = 'all';
            dojo.place(br1,frmEdit.domNode);

            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"Longitude",'lang':l}),divToAdd: frmEdit.domNode,inpName:'Lon',  inpRequired:false, isLast:false,  value: realm.lon, id: 'RealmLon'+realm.id});
            components.QElements.addPair({label:tr.tr({'module': 'RealmView','phrase':"Latitude",'lang':l}), divToAdd: frmEdit.domNode,inpName:'Lat',  inpRequired:false, isLast:true,   value: realm.lat, id: 'RealmLat'+realm.id});
           // components.QElements.addTextArea({label:tr.tr({'module': 'RealmView','phrase':"Address",'lang':l}),      divToAdd: frmEdit.domNode,inpName:'Address',    inpRequired:false, isLast:true,value: realm.address})     

            var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left:1px",label:tr.tr({'module': 'RealmView','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnEdit.domNode,frmEdit.domNode);


             dojo.connect(btnEdit,'onClick',function(){
                    
                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlEdit,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    console.log(frmObj);
                                    //Check if we should update the users data store
                                    if(dijit.byId('contentRealmsViewGrid') != undefined){
                                        //--Get the item for this id
                                        dijit.byId('contentRealmsViewGrid').store.fetchItemByIdentity({
                                            identity:   realm.id,
                                            onItem :    function(item, request) {
                                                            dijit.byId('contentRealmsViewGrid').store.setValue(item,'name',frmObj.Name);
                                                            dijit.byId('contentRealmsViewGrid').store.setValue(item,'append_string_to_user',frmObj.Append);
                                                            dijit.byId('contentRealmsViewGrid').store.setValue(item,'phone',frmObj.Phone);
                                                            dijit.byId('contentRealmsViewGrid').store.setValue(item,'cell',frmObj.Cell);
                                                            dijit.byId('contentRealmsViewGrid').store.setValue(item,'email',frmObj.Email);

                                                        }
                                        });
                                    }

                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'RealmView','phrase':"Realm updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                    //Update the lon and lat values
                                    //See if we can add a value to the longitude thing...
                                    dijit.byId('RealmLon'+realm.id).attr('value',response.json.location.lon);
                                    dijit.byId('RealmLat'+realm.id).attr('value',response.json.location.lat);
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'RealmView','phrase':"Problems updating realm",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){

                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                })
        dojo.place(frmEdit.domNode,divContainer);
    }


    cvu.getGraphicDetail    = function(divContainer,id){

        var divUpload   = document.createElement("div");
        divUpload.id    = 'divUpload'+id;
        dojo.addClass(divUpload, "divUpload");
            //Add the action stuff
            var frmUpload    = new dijit.form.Form({ id: 'frmUpload'+id, encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var hiddenId    = document.createElement("input");  //Hidden element containing the Realm ID
                hiddenId.type   = "hidden";
                hiddenId.name   = "id";
                hiddenId.value  = id;
            dojo.place(hiddenId,frmUpload.domNode);


                var upload      = document.createElement('input');
                upload.type = 'file';
                upload.name = 'fileToUpload'+id;
                upload.id   = 'ContentViewItemGraphic';
                //dojo.addClass(upload,'inputUpload');

                dojo.place(upload,frmUpload.domNode);

            dojo.place(frmUpload.domNode,divUpload);
            var divActions = document.createElement('div');
                components.QElements.addAction({Name:tr.tr({'module': 'RealmView','phrase':"Upload",'lang':l}),Type:'upload',Parent: divActions,Action:cvu.upload,Id:id});
            dojo.style(divActions,{'float': 'right','display': 'inline'});
            dojo.place(divActions,divUpload);
        dojo.place(divUpload,divContainer);

        //--Progressbar
        var divProgress = document.createElement("div");
        dojo.addClass(divProgress, "divProgress");
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
                    cvu.addLogo(response.logo.file_name,id);
                };
                if(response.json.status == 'error'){
                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                }
            }
        });
        //---------------------------------------------
        
    }
    
    cvu.addLogo      = function(file_name,id){
        //Destroy previous one if existed
        if(dojo.byId('divLogo'+id) != undefined){
            console.log('Destroy existing one');
            dojo._destroyElement(dojo.byId('divLogo'+id));
        }

        var divLogo     = document.createElement("div");
        divLogo.id   = 'divLogo'+id;

            var img = new Image();
            var ts = Number(new Date());
            //img.src = urlGraphics+file_name+'?'+ts;
            img.src     = urlDynamic+urlMasterImages+file_name+'&time='+ts;
            img.align   = "left";
            dojo.style(img,{display:'block'});
            dojo.place(img,divLogo);

        dojo.place(divLogo,dijit.byId("ContentViewRealmLogo"+id).domNode);
        dojo.addClass(divLogo, "divLogo");
          
    }

     cvu.upload  = function(id){

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
                console.log(data);
                if (response.json.status == 'ok'){
                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'RealmView','phrase':"Image uploaded OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
                    dojo.style(dojo.byId('divUpload'+id),"display","block");
                    dojo.style(dojo.byId('divProgress'+id),"display","none");
                    cvu.addLogo(response.image.file,id);
                }
                
                if(response.json.status == 'error'){
                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                }
            }
        });
    }

})();//(function(){

}
