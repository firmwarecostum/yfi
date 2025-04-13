/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.Maps"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Maps"] = true;
dojo.provide("content.Maps");
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    //______________ Please Change to suit your setup __________________
    var mapKey          = 'ABQIAAAAdxRtsH68Irgqk-ndlTYD4xRi_j0U6kJrkFvY4-OX2XYmEAa76BSiOIBBr9TXI7oYTHfD5Ji1RUBC0Q'; //Only works on 127.0.0.1
    //__________________________________________________________________
  
    var cm              = content.Maps;
    var urlActMaps      = components.Const.cake+'maps/json_actions/';           //Actions for the MAP
    var urlPrefsEdit    = components.Const.cake+'maps/json_edit/';
    var urlMapPrefFor   = components.Const.cake+'nas/json_nas_map_index/';     //Get the preferences  including the overlay detail
    var urlNasList      = components.Const.cake+'nas/json_nas_map_list/';      //List devices without lon and lat values
    var urlMoveMarker   = components.Const.cake+'nas/json_nas_map_move/';      //Move device's position
    var urlMapInfoFor   = components.Const.cake+'nas/json_map_view/';


    var tr              = components.Translator;
    var l               = components.LoginLight.UserInfo.l_iso;
    var userID          = components.LoginLight.UserInfo.User.id;

    var divMap;
    var g_map;          //The google map which will be created
    var new_present;
    var divResults;

    //Choice of MAPS
    var map_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'G_NORMAL_MAP',      name: tr.tr({'module': 'Maps','phrase':"Normal",'lang':l}) },
                { id : 'G_SATELLITE_MAP',   name: tr.tr({'module': 'Maps','phrase':"Satellite",'lang':l}) },
                { id : 'G_HYBRID_MAP',      name: tr.tr({'module': 'Maps','phrase':"Hybrid",'lang':l}) }
            ]}};

    //Create the Google Maps Tab
    cm.create  = function(divParent){
        
        console.log( 'Load google JS');
        new_present = false;
        var divGridAction   = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActMaps,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cm[action_item.action],Id:null});
                               // components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:null,Id:null});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

            /*
            //-------------------Filter + Refresh------------------------
            var filter = document.createElement('span');
            filter.innerHTML ='<b>'+tr.tr({'module': 'Credits','phrase':"Filter",'lang':l})+' </b>';
            dojo.place(filter, divGridAction);
            var t = new dijit.form.TextBox({name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(t,'onKeyUp',function(e){
                    var filterOn = filteringSelect.attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = t.attr('value');
                    query = {'id' : val+'*'};
                    if(filterOn == 'id'){
                       query = {'id' : val+'*'};
                    }
                    if(filterOn == 'realm'){
                       query = {'realm' : val+'*'};
                    }
                    if(filterOn == 'expires'){
                       query = {'expires' : val+'*'};
                    }
                    if(filterOn == 'creator'){
                       query = {'creator' : val+'*'};
                    }
                    if(filterOn == 'attached'){
                       query = {'attached' : val+'*'};
                    }
                    grid.setQuery(query);
            });

            dojo.place(t.domNode, divGridAction);
          
            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'Credits','phrase':"Field",'lang':l})+' </b>';
            dojo.place(spanField,divGridAction);
            
                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'id',        label: tr.tr({'module': 'Credits','phrase':"Id",'lang':l}),selected:'selected' },
                                { id : 'realm',     label: tr.tr({'module': 'Credits','phrase':"Realm",'lang':l}) },
                                { id : 'expires',   label: tr.tr({'module': 'Credits','phrase':"Expiry Date",'lang':l})},
                                { id : 'creator',   label: tr.tr({'module': 'Credits','phrase':"Creator",'lang':l}) },
                                { id : 'attached',  label: tr.tr({'module': 'Credits','phrase':"User",'lang':l}) }
                                ]}};
            
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            filteringSelect = new dijit.form.FilteringSelect({
                                                                    value   : "id",
                                                                    name    : "state",
                                                                    store   : myNewStore,
                                                                    searchAttr  :"label",
                                                                    style: "width: 140px;"}, document.createElement("div"));
            dojo.place(filteringSelect.domNode,divGridAction);
            */

                divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
            //-----------------------------------------------------------
        dojo.place(divGridAction,divParent);


        setTimeout(function () {

            var contentBox = dojo.contentBox(divParent);
            console.log(contentBox);

            var hight = (contentBox.h-92)+'';
            var s = "height: "+hight+"px ; padding: 20px";
            console.log(s);

             var cpExp   =   new dijit.layout.ContentPane({
                                style:      s
                            },document.createElement("div"));
            dojo.place(cpExp.domNode,divParent);

            divMap     = document.createElement('div');
            dojo.addClass(divMap, 'divGrid');
            dojo.place(divMap,cpExp.domNode);
            dojo.place(components.Common.divWorking(),divMap);   //Show them we are waiting

            var script = document.createElement("script");

            //Source the API from google
            script.src = "http://www.google.com/jsapi?key="+mapKey+"&callback=content.Maps.google_api_loaded"; //call google_api_loaded once the API is loaded
            script.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(script);

          
            //---- END Grid----------------
        },100); 
    }

    cm.reload   = function(){
        console.log("Reload Map");
                
        //We need to get the user's preferences to create the map
        dojo.xhrGet({
            url: urlMapPrefFor,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    new_present = false;
                    var lat     = response.maps.lat;
                    var lon     = response.maps.lon;

                    var center = new GLatLng(lat,lon);
                    g_map.setCenter(center, parseInt(response.maps.zoom));
                    if(response.maps.type == 'G_SATELLITE_MAP'){
                        g_map.setMapType(G_SATELLITE_MAP);
                    }
                    if(response.maps.type == 'G_NORMAL_MAP'){
                        g_map.setMapType(G_NORMAL_MAP);
                    }
                    if(response.maps.type == 'G_HYBRID_MAP'){
                        g_map.setMapType(G_HYBRID_MAP);
                    }
                    g_map.clearOverlays();      //Clear the map

                    //Loop through a list of the items and add their overlays
                    divResults.innerHTML = "<b>"+tr.tr({'module': 'Maps','phrase':"Result count",'lang':l})+": </b>"+ response.maps.items.length;
                    dojo.forEach(response.maps.items, function(item) {
                        //Create a marker for each item:
                        // Create our "tiny" marker icon
                        var mapIcon = new GIcon(G_DEFAULT_ICON);
                        mapIcon.image = "img/maps/blue.png";    //Default is blue

                        if(item.available == true){
                            mapIcon.image = "img/maps/green.png";
                        }
                        if(item.available == false){
                            mapIcon.image = "img/maps/red.png";
                        }
                
                        // Set up our GMarkerOptions object
                        markerOptions = { icon:mapIcon, draggable: response.maps.draggable };  //Will depend if the user has edit rights on the marker!!!

                        var position    = new GLatLng(item.lat,item.lon);
                        var mark        = new GMarker(position, markerOptions);

                        //Pop up a baloon if they click on it
                        GEvent.addListener(mark, "click", function() {
                            g_map.closeInfoWindow();

                            //Fetch the latest info on the device:
                            dojo.xhrGet({
                                url: urlMapInfoFor+item.id,
                                preventCache: true,
                                handleAs: "json",
                                load: function(response){

                                    //console.log(response);
                                    if(response.json.status == 'ok'){
                                    //------------------------------------------------------
                                         var tblInfo = '<table cellpadding="10" cellspacing="10">'+
                                                '<tr>'+
                                                '<td><b>'+tr.tr({'module': 'Maps','phrase':"IP",'lang':l})+'</b></td>'+
                                                '<td>'+response.Na.nasname+'</td>'+
                                                '</tr>'+
                                                '<tr>'+
                                                '<td><b>'+tr.tr({'module': 'Maps','phrase':"Name",'lang':l})+'</b></td>'+
                                                '<td>'+response.Na.shortname+'</td>'+
                                                '</tr>'+
                                                '<tr>'+
                                                '<td><b>'+tr.tr({'module': 'Maps','phrase':"Description",'lang':l})+'</b></td>'+
                                                '<td>'+response.Na.description+'</td>'+
                                                '</tr>'+
                                                '<tr>'+
                                                '<td><b>'+tr.tr({'module': 'Maps','phrase':"Status",'lang':l})+'</b></td>'+
                                                '<td>'+response.Na.status+'</td>'+
                                                '</tr>'+
                                                '<tr>'+
                                                '<td><b>'+tr.tr({'module': 'Maps','phrase':"Users connected",'lang':l})+'</b></td>'+
                                                '<td>'+response.Na.connected+'</td>'+
                                                '</tr>'+
                                            '</table>';
                                        var imgNas = '<h3>Photo</h3>'+
                                                    '<img src="'+components.Const.cake+'webroot/img/graphics/'+response.Na.photo_file_name+'" alt="img"'+
                                                    'style="marginTop:10px; border:10px solid #adb5c6;"'+
                                                    '/>';
 
                                    var tab_1 = new GInfoWindowTab('Info',tblInfo);
                                    var tab_2 = new GInfoWindowTab('Photo',imgNas);
                                    var tabs    = [tab_1,tab_2];
                                    mark.openInfoWindowTabsHtml(tabs);

                                    //------------------------------------------------------

                                    };
                                    if(response.json.status == 'error'){
                                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                    }
                                }
                            }); 

                        });

                        GEvent.addListener(mark, "dragstart", function() {
                            g_map.closeInfoWindow();
                        });

                        GEvent.addListener(mark, "dragend", function(j) {
                            var position    = { 'id': item.id, 'lon' : j.x, 'lat' : j.y };

                            var divMsg  = document.createElement('div');
                            var h       = document.createElement('h2');
                            dojo.addClass(h, 'autoSetupH');
                            h.innerHTML = tr.tr({'module': 'Maps','phrase':"Action Required",'lang':l});
                            dojo.place(h,divMsg);

                            var p = document.createElement('p');
                            p.innerHTML = tr.tr({'module': 'Maps','phrase':"New position",'lang':l})+':<br>'+tr.tr({'module': 'Maps','phrase':"Longitude",'lang':l})+': <b>'+position.lon+'</b><br>'+tr.tr({'module': 'Maps','phrase':"Latitude",'lang':l})+': <b>'+position.lat+'</b><br>';
                            dojo.place(p,divMsg);
                            //Save link
                            var a_save  = document.createElement('a');
                            dojo.addClass(a_save, 'link_space');
                            a_save.href='#';
                            a_save.appendChild(document.createTextNode(tr.tr({'module': 'Maps','phrase':"Save",'lang':l})));
                            dojo.connect(a_save, "onclick", function(){
                                    _update_position(position);
                            });
                            dojo.place(a_save,divMsg);
                            //Cancel Link
                            var a_cancel  = document.createElement('a');
                            dojo.addClass(a_cancel, 'link_space');
                            a_cancel.href='#';
                            a_cancel.appendChild(document.createTextNode(tr.tr({'module': 'Maps','phrase':"Cancel",'lang':l})));
                            dojo.connect(a_cancel, "onclick", function(){
                                    cm.reload();
                            });
                            dojo.place(a_cancel,divMsg);
                            //Delete Link
                            var a_del  = document.createElement('a');
                            dojo.addClass(a_del, 'link_space');
                            a_del.href='#';
                            a_del.appendChild(document.createTextNode(tr.tr({'module': 'Maps','phrase':"Delete",'lang':l})));
                            dojo.connect(a_del, "onclick", function(){
                                position.lon = null;
                                position.lat = null;
                                _update_position(position);
                            });
                            dojo.place(a_del,divMsg);

                            mark.openInfoWindow(divMsg);
                        });
                        g_map.addOverlay(mark);

                    });
                    //------------------------------------------------------

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cm.add      = function(){
        console.log("Add Map Point");

        if(new_present == true){
            dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Maps','phrase':tr.tr({'module': 'Maps','phrase':"New marker already on map",'lang':l}),'lang':l})+'</b>','error',components.Const.toasterError);
            return;
        }

        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'UserViewServices','phrase':tr.tr({'module': 'Maps','phrase':"Add Marker",'lang':l}),'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());
                 components.QElements.addComboBox({      label:tr.tr({'module': 'Maps','phrase':"Available",'lang':l}),url:urlNasList, divToAdd: frmAdd.domNode,inpName:'nas',inpRequired:true, isLast:true, searchAttr: 'name'});

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Maps','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){
                    if(frmAdd.validate()){
                        console.log("Add an add marker");
                        var frmObj = dojo.formToObject(frmAdd.domNode);
                        console.log(frmObj);
                        new_present = true;
                        dlgAdd.destroyRecursive(false); //Destroy the dialog

                        //Get the center of the map
                        var centre = g_map.getCenter();
                        //Add a white marker at the center of the current map
                        var mapIcon = new GIcon(G_DEFAULT_ICON);
                        mapIcon.image = "img/maps/white.png";

                        // Set up our GMarkerOptions object
                        markerOptions = { icon:mapIcon, draggable: true };
                        var mark      = new GMarker(centre, markerOptions);

                        GEvent.addListener(mark, "dragstart", function() {
                            g_map.closeInfoWindow();
                        });

                        GEvent.addListener(mark, "dragend", function(j) {
                            position = { 'id' : frmObj.nas, 'lon': j.x, 'lat': j.y };
                            _update_position(position);
                        });

                        g_map.addOverlay(mark);
                            var divMsg  = document.createElement('div');
                            var h       = document.createElement('h2');
                            dojo.addClass(h, 'autoSetupH');
                            h.innerHTML = tr.tr({'module': 'Maps','phrase':"Action Required",'lang':l});
                            dojo.place(h,divMsg);
                            var p = document.createElement('p');
                            p.innerHTML = tr.tr({'module': 'Maps','phrase':"Drag and drop marker to required position",'lang':l});;
                            dojo.place(p,divMsg);
                        mark.openInfoWindowHtml(divMsg);
                    }
                })
        dlgAdd.attr('content',frmAdd);
        dlgAdd.show();
    }
    cm.edit     = function(){
        console.log("Edit Map Point");
        var message = {'title': tr.tr({'module': 'Maps','phrase':"Edit a marker",'lang':l}),'heading': tr.tr({'module': 'Maps','phrase':"Instructions",'lang':l}),'body': tr.tr({'module': 'Maps','phrase':"Simply drag a marker to its new postition and click on the save link in the balloon",'lang':l})};
        _show_message(message);
    }

    cm.del     = function(){
        console.log("Del Map Point");
         var message = {'title': tr.tr({'module': 'Maps','phrase':"Delete a marker",'lang':l}),'heading': tr.tr({'module': 'Maps','phrase':"Instructions",'lang':l}),'body': tr.tr({'module': 'Maps','phrase':"Simply drag a marker to a different postition and click on the delete link in the balloon",'lang':l})};
        _show_message(message);
    }


    cm.settings  = function(){

        console.log("Google Maps Preferences");
        dojo.xhrGet({
            url: urlMapPrefFor+userID,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    _map_pref_dialog(response.maps)
                    //------------------------------------------------------

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cm.google_api_loaded = function() {
    
        //We need to determine the language ( language comes to us IE af_ZA - we only want BEFORE '_')
        var g_lang = 'en'   //Default
        g_lang = components.LoginLight.UserInfo.l_iso.replace(/_\w+/i, "");
        console.log("Google Language is ",g_lang);
        google.load("maps", "2", {"callback" : content.Maps.maps_loaded,"language" : g_lang, "other_params":"sensor=false"});  //Call maps_loaded once the Maps JS API is loaded
    }

    cm.maps_loaded = function() {
        console.log('google maps loaded ok');
        //Create a map in the divMap div
        g_map     = new google.maps.Map2(divMap);
        g_map.addControl(new GLargeMapControl());
        cm.reload();
    }


       


   function _map_pref_dialog(map){

    console.log('Change Preferences');
    var dlgPref  = new dijit.Dialog({
        title: tr.tr({'module': 'Maps','phrase':"Preferences",'lang':l}),
        style: "width: 420px"
    });
        
        var frmPref    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
        var ts = Number(new Date());

            //Add a take current view 
            var btnSnap = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Maps','phrase':"Snapshot",'lang':l}),iconClass:"snapIcon"},document.createElement("div"));
            dojo.place(btnSnap.domNode,frmPref.domNode);

            var br1=document.createElement('br');
            br1.clear = 'all';
            dojo.place(br1,frmPref.domNode);

            dojo.connect(btnSnap,'onClick', function(){
                var lat_long    = g_map.getCenter();
                var lat         = lat_long.lat();
                var lng         = lat_long.lng();
                var zoom        = g_map.getZoom();
                var pat         = /NumberSpinner/;

                dojo.query("input",frmPref.domNode).forEach(function(i){
                    if(i.name == 'lon'){
                        i.value = lng;
                    }
                    if(i.name == 'lat'){
                        i.value = lat;
                    }
                    if(i.id.match(pat)){
                        i.value = zoom;
                    }
                    if(i.name =='zoom'){
                        i.value =zoom;
                    }
                });
            });

            components.QElements.addPair({  label:tr.tr({'module': 'Maps','phrase':"Longitude",'lang':l}),  divToAdd: frmPref.domNode,  inpName:'lon',    inpRequired:true,  isLast:false, value: map.lon});
            components.QElements.addPair({  label:tr.tr({'module': 'Maps','phrase':"Latitude",'lang':l}),   divToAdd: frmPref.domNode,  inpName:'lat',  inpRequired:true,  isLast:false,   value: map.lat});
            components.QElements.addNumberSpinner({ label:tr.tr({'module': 'Maps','phrase':"Zoom Level",'lang':l}), valShow:map.zoom,   min:0,  max:20, divToAdd: frmPref.domNode,  inpName:'zoom', isLast:false,   inpRequired:true});
            components.QElements.addComboBox({ label:tr.tr({'module': 'Maps','phrase':"Type",'lang':l}),data:map_op, divToAdd: frmPref.domNode, inpName:'type',inpRequired:true, isLast:true,searchAttr:'name',value: map.type});
            
            var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Maps','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnAdd.domNode,frmPref.domNode);

            dojo.connect(btnAdd,'onClick',function(){
                var ts = Number(new Date());
                if(frmPref.validate()){

                    console.log('Form is valid...');
                    var frmObj = dojo.formToObject(frmPref.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlPrefsEdit+'?'+ts,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    dlgPref.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Maps','phrase':"Preferences updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                    cm.reload();
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Maps','phrase':"Problems updating Preferences",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){
                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                }
            })
    dlgPref.attr('content',frmPref);
    dlgPref.show();
    }

    function _show_message(message){

        var dlgMsg  = new dijit.Dialog({
                title: message.title,
                style: "width: 260px"
            });

        var divMsg  = document.createElement('div');
        var h       = document.createElement('h2');
        dojo.addClass(h, 'autoSetupH');
        h.innerHTML = message.heading;
        dojo.place(h,divMsg);

        var s = document.createElement('span');
        s.innerHTML = message.body;
        dojo.place(s,divMsg);

        dlgMsg.attr('content',divMsg);
        dlgMsg.show();
    }

    function _update_position(position){
        var ts = Number(new Date());
        dojo.xhrPost({
            url: urlMoveMarker+'/?'+ts,
            content: position, 
            handleAs: "json",
            load: function(response){
                if(response.json.status == 'ok'){
                    cm.reload();
                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Maps','phrase':"Update completed",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                }else{
                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Maps','phrase':"Problems updating markers",'lang':l})+'</b>','message',components.Const.toasterError);
                }
                if(response.json.status == 'error'){
                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                }
            }
        });
    }

})();//(function(){

}
