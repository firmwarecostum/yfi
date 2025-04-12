/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.NasView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.NasView"] = true;
dojo.provide("content.NasView");

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('components.QElements');
dojo.require('components.Translator');
dojo.require('components.Common');


(function(){
    var cnv                     = content.NasView;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var urlNasViewCompulsory    = components.Const.cake+'nas/json_view/';
    var urlNasViewOptional      = components.Const.cake+'nas/json_view_optional/';
    var urlPersonList           = components.Const.cake+'nas/json_user_list/';
    var urlTypeList             = components.Const.cake+'nas/json_type_list/';
    var urlRealmsForNas         = components.Const.cake+'nas/json_realms_for_nas/';
    var urlNasEdit              = components.Const.cake+'nas/json_edit/?';
    var urlNasEditOptional      = components.Const.cake+'nas/json_edit_optional/';
    var urlNasState             = components.Const.cake+'nas/json_state/';
    var urlActVouchers          = components.Const.cake+'nas/json_actions_view/';
    var urlDeleteAvail          = components.Const.cake+'nas/json_delete_avail/';

    var urlRealmList            = components.Const.cake+'realms/json_index_list/';
    
    var nasID;
    var grid;

    cnv.create=function(divParent,id){

        console.log("Nas Detail comming up...."+id);
        nasID = id;
        //Focus on tab
        dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId('contentWorkspaceNasView'+id));

       //----------------
         //Tab Container
        var tc = new dijit.layout.TabContainer({
            tabPosition: "top",
            style : "width:auto;height:100%; padding: 10px; border: 1px solid #000000;"
        },document.createElement("div") );
        dijit.byId('contentWorkspaceNasView'+id).attr('content',tc.domNode);

            //Tab
            var tcOne   = new dijit.layout.ContentPane({title : tr.tr({'module': 'NasView','phrase':"Compulsory Info",'lang':l})});
            //Tab
            var tcTwo   = new dijit.layout.ContentPane({title : tr.tr({'module': 'NasView','phrase':"Optional Info",'lang':l})});
            //Tab
            var tcThree = new dijit.layout.ContentPane({title : tr.tr({'module': 'NasView','phrase':"Availablilty",'lang':l})});
            //Tab
            var tcFour  = new dijit.layout.ContentPane({title : tr.tr({'module': 'NasView','phrase':"Photo",'lang':l})});
            tcFour.nID = nasID;
            //Tab
  	        var tcFive  = new dijit.layout.ContentPane({title : 'Actions'});
	  	    tcFive.nID = nasID;


            //----------------------------------------------------------------
            var divContainer     = document.createElement('div');
            dojo.addClass(divContainer, 'divTabForm');

                cnv.getNasCompulsory(divContainer);    //Populate the container div

            tcOne.attr('content',divContainer);
            //-----------------------------------------------------------------


            //-------------------------------
            dojo.connect(tc, 'selectChild',function(e){

                 //--------------------------
                if(e == tcThree){
                    console.log('Availibility');
                    //It it already has children do not populate it
                    if(e.domNode.childNodes.length == 0){

                        var divAvailability = document.createElement("div");
                       // dojo.addClass(divAvailability, 'divTabForm');
                        dojo.style(divAvailability,"height","90%");
                        dojo.style(divAvailability,"width","50em");

                        tcThree.attr('content',divAvailability);
                        getNasAvailability(divAvailability);

                    }
                }
                //------------------------


                //------------------------------
                if(e == tcTwo){
                    console.log('Optional Data');
                    if(e.domNode.childNodes.length == 0){

                        var divOptional = document.createElement("div");
                        dojo.addClass(divOptional, 'divTabForm');
                        tcTwo.attr('content',divOptional);
                        getNasOptional(divOptional);
                    }
                }
                //----------------------------

                 //------------------------------
                if(e == tcFour){
                    if(e.domNode.childNodes.length == 0){

                        var divPhoto = document.createElement("div");
                       // dojo.addClass(divPhoto, 'divTabForm' );
                        tcFour.attr('content',divPhoto);
                        dojo.require("content.NasViewPhoto");
                        dojo.addOnLoad(function(){
                            console.log("Nas View Photo loaded fine");
                            content.NasViewPhoto.add(divPhoto,tcFour.nID);
                        });
                    }
                }
                //----------------------------

                //------------------------------
                if(e == tcFive){
                    if(e.domNode.childNodes.length == 0){
	      	            var divActions = document.createElement("div");
                        dojo.addClass(divActions, 'divTabInTab' );
                        tcFive.attr('content',divActions);
                        dojo.require("content.NasViewActions");
                        dojo.addOnLoad(function(){
                            console.log("Nas View Actions loaded fine");
                            content.NasViewActions.create(divActions,tcFive.nID);
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
        //---------------------

        //Initialise the tabs
        tc.startup();
 
    }

     cnv.getNasCompulsory   = function(divContainer){

         dojo.xhrGet({
            url: urlNasViewCompulsory+nasID,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    populateNasCompulsory(divContainer,response.Na);
                    //------------------------------------------------------
                    

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });

    }


    function populateNasCompulsory(divContainer,nas){

        //----Clean up first----------
        if(dijit.byId('contentNasEditRealm'+nasID) != undefined){
            dijit.byId('contentNasEditRealm'+nasID).destroyDescendants(true);
            dijit.byId('contentNasEditRealm'+nasID).destroy(true);
        }
        //----------------------------

        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

        var hiddenId    = document.createElement("input");  //Hidden element containing the IP
        hiddenId.type   = "hidden";
        hiddenId.name   = "id";
        hiddenId.value  = nasID;
        dojo.place(hiddenId,frmEdit.domNode);
        var ts = Number(new Date());
                //VPN devices's IPs are on a register so we are not allowed to change it
        if(nas.vpn_nasname == undefined){
            components.QElements.addPair({          label:tr.tr({'module': 'NasView','phrase':"IP Address",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'nasname',   inpRequired:true, isLast:false, value : nas.nasname});
        }else{
            components.QElements.addPair({          label:tr.tr({'module': 'NasView','phrase':"IP Address",'lang':l}), divToAdd: frmEdit.domNode,   inpName:'nasname',   inpRequired:true, isLast:false, value: nas.vpn_nasname, disabled:'disabled'});
        }
        components.QElements.addPair({          label:tr.tr({'module': 'NasView','phrase':"Name",'lang':l}),       divToAdd: frmEdit.domNode,   inpName:'shortname', inpRequired:true, isLast:false, value: nas.shortname});
        components.QElements.addPair({          label:tr.tr({'module': 'NasView','phrase':"Secret",'lang':l}),     divToAdd: frmEdit.domNode,   inpName:'secret',    inpRequired:true, isLast:false, value: nas.secret});
        components.QElements.addComboBox({      label:tr.tr({'module': 'NasView','phrase':"Contact Person",'lang':l}),url:urlPersonList, divToAdd: frmEdit.domNode,inpName:'user_id',inpRequired:true, isLast:false,searchAttr:'name',value: nas.user_id});
       
        var d=document.createElement('div');
 
        if(components.LoginLight.UserInfo.group == components.Const.admin){       //Only Available to Administrators
            if(nas.available_to_all == true){
                components.QElements.addCheckPair({label:tr.tr({'module': 'NasView','phrase':"Available to all",'lang':l}),divToAdd: frmEdit.domNode,inpName:'available_all', inpRequired:true,checked: 'checked',value: 'on',isLast: false,id:'all'+nasID });
                dojo.style(d,"display","none");
            }else{
                components.QElements.addCheckPair({label:tr.tr({'module': 'NasView','phrase':"Available to all",'lang':l}),divToAdd: frmEdit.domNode,inpName:'available_all', inpRequired:true,value: 'on',isLast: false,id:'all'+nasID});
                dojo.style(d,"display","block");
            }

            //Get the checkbox
            var ipt = dijit.byId('all'+nasID);
            dojo.connect(ipt,'onChange', function(){
                    var me = this;
                     if(me.checked){
                        dojo.style(d,"display","none");
                    }else{
                        dojo.style(d,"display","block");
                    }
            });

        }

            dojo.place(d,frmEdit.domNode);
                components.QElements.addMultiSelect({
                                                       label:      tr.tr({'module': 'NasView','phrase':"Available only to",'lang':l}),
                                                       divToAdd:   d,
                                                       inpName:    'realms',
                                                       inpRequired:true,
                                                       isLast:     true,
                                                       url:        urlRealmsForNas+nasID,
                                                       id:         'contentNasEditRealm'+nasID
                });
                
            
            var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'NasView','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);

            dojo.connect(btnEdit,'onClick',function(){

                if(frmEdit.validate()){
                    console.log('Form is valid...');
                    var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                    var realms ='';
                    var count = 0;
                    dojo.forEach(dijit.byId('contentNasEditRealm'+nasID).attr('value'), function(i){
                        realms = realms+count+'='+i+'&';
                        count++;
                    });
                    dojo.xhrPost({
                        url: urlNasEdit+realms,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                   
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'NasView','phrase':"NAS compulsory data updated",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'NasView','phrase':"Problems updating compulsory data",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){

                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                }
            })
        dojo.place(frmEdit.domNode,divContainer);
        console.log("Step 5");
    }

    function getNasOptional(divContainer){

         dojo.xhrGet({
            url: urlNasViewOptional+nasID,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    populateNasOptional(divContainer,response.Na);
                    //------------------------------------------------------
                    

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });

    }


    function populateNasOptional(divContainer,nas){


        if(nas.vpn_nasname != undefined){
            var divVPN     = document.createElement('div');
            dojo.addClass(divVPN, 'divInfoForm');
                var h3VPN =document.createElement('h3');
                h3VPN.innerHTML = tr.tr({'module': 'NasView','phrase':"PPTP Client Detail",'lang':l});
                dojo.place(h3VPN,divVPN);
                components.QElements.addPair({      label:tr.tr({'module': 'NasView','phrase':"Username",'lang':l}),  divToAdd: divVPN,  inpName:'nun',    inpRequired:true,  isLast:false,    value: nas.vpn_user, disabled:'disabled'});
                components.QElements.addPair({      label:tr.tr({'module': 'NasView','phrase':"Password",'lang':l}),  divToAdd: divVPN,  inpName:'npw',    inpRequired:true,  isLast:false,    value: nas.vpn_password, disabled:'disabled'});
                components.QElements.addPair({      label:tr.tr({'module': 'NasView','phrase':"Server Name",'lang':l}),  divToAdd: divVPN,  inpName:'nsn',    inpRequired:true,  isLast:false, value: nas.vpn_server_name, disabled:'disabled'});
                components.QElements.addPair({      label:tr.tr({'module': 'NasView','phrase':"Server IP",'lang':l}),  divToAdd: divVPN,  inpName:'nsip',    inpRequired:true,  isLast:false,  value: nas.vpn_server_ip, disabled:'disabled'});
            dojo.place(divVPN,divContainer);
        }

        console.log(nas);

        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

        var hiddenId    = document.createElement("input");  //Hidden element containing the IP
        hiddenId.type   = "hidden";
        hiddenId.name   = "id";
        hiddenId.value  = nasID;
        dojo.place(hiddenId,frmEdit.domNode);
        var ts = Number(new Date());
        components.QElements.addComboBox({  label:tr.tr({'module': 'NasView','phrase':"Type",'lang':l}),   divToAdd: frmEdit.domNode,  inpName:'type',     inpRequired:false,  isLast:false, url:urlTypeList,searchAttr:'name',value: nas.type});
        components.QElements.addPair({      label:tr.tr({'module': 'NasView','phrase':"Port",'lang':l}),  divToAdd: frmEdit.domNode,  inpName:'ports',    inpRequired:false,  isLast:false,           value: nas.ports});
        components.QElements.addPair({      label:tr.tr({'module': 'NasView','phrase':"Community",'lang':l}),  divToAdd: frmEdit.domNode,  inpName:'community',    inpRequired:false,  isLast:false,   value: nas.community});
        components.QElements.addTextArea({  label:tr.tr({'module': 'NasView','phrase':"Description",'lang':l}), divToAdd: frmEdit.domNode,inpName:'description',   inpRequired:false,  isLast:false,   value: nas.description });
        if(nas.monitor == '0'){
            components.QElements.addCheckPair({label:tr.tr({'module': 'NasView','phrase':"Active Monitor",'lang':l}),divToAdd: frmEdit.domNode,inpName:'monitor',inpRequired:false,value: 'on',isLast: false});
        }else{
            components.QElements.addCheckPair({label:tr.tr({'module': 'NasView','phrase':"Active Monitor",'lang':l}),divToAdd: frmEdit.domNode,inpName:'monitor',checked:'checked',inpRequired:false,value: 'on',isLast: false});
        }
        components.QElements.addPair({      label:tr.tr({'module': 'NasView','phrase':"Longitude",'lang':l}),  divToAdd: frmEdit.domNode,  inpName:'lon',    inpRequired:false,  isLast:false, value: nas.lon});
        components.QElements.addPair({      label:tr.tr({'module': 'NasView','phrase':"Latitude",'lang':l}),  divToAdd: frmEdit.domNode,  inpName:'lat',    inpRequired:false,  isLast:false,   value: nas.lat});

        //Add a default realm for the NAS (optional for the dynamic login pages)
        components.QElements.addComboBox({  label:'Default realm',   divToAdd: frmEdit.domNode,  inpName:'realm_id', inpRequired:false,  isLast:true, url:urlRealmList,searchAttr:'name', value: nas.realm_id});


        var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'NasView','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
        dojo.place(btnEdit.domNode,frmEdit.domNode);


        dojo.connect(btnEdit,'onClick',function(){

            if(frmEdit.validate()){
                console.log('Form is valid...');
                var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                dojo.xhrPost({
                    url: urlNasEditOptional,
                    content: frmObj, //Form: does not work in this context -> convert to object and use object
                    handleAs: "json",
                    load: function(response){
                        if(response.json.status == 'ok'){
                            dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'NasView','phrase':"NAS optional data updated",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                        }else{
                            dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'NasView','phrase':"Problems updating optional data",'lang':l})+'</b>','message',components.Const.toasterError);
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


    function getNasAvailability(divAvailability){

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

             //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActVouchers,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cnv[action_item.action],Id:null});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

            //----------------------------------------------------
                var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
            //-----------------------------------------------------------


        dojo.place(divGridAction,divAvailability);

        //----Grid Start----------------
                 var layout = [
                            { field: "state", name: tr.tr({'module': 'NasView','phrase':"State",'lang':l}), width: 'auto',formatter: formatState },
                            { field: "time", name: tr.tr({'module': 'NasView','phrase':"Duration",'lang':l}), width: 'auto',formatter: formatBold },
                            { field: "start", name: tr.tr({'module': 'NasView','phrase':"Started",'lang':l}), width: 'auto' },
                            { field: "end", name: tr.tr({'module': 'NasView','phrase':"Ended",'lang':l}), width: 'auto' },
                        ];

                grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                dojo.connect(grid,'_onFetchComplete', function(){
                    //Check if the restart flag is present
                    divResults.innerHTML = "<b>"+tr.tr({'module': 'NasView','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,divAvailability);

                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileReadStore({ url: urlNasState+nasID+'/?'+ts });
                  grid.setStore(jsonStore,{'state':'*'},{ignoreCase: true});
            //---- END Grid----------------
    }

    cnv.reload  = function(){

        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlNasState+nasID+'/?'+ts });
        grid.setStore(jsonStore,{'state':'*'},{ignoreCase: true});
    }

     cnv.del      = function(){

        console.log('Delete NAS Device(s) Availability');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cnv.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'NasView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cnv.del_confirm      = function(){
        cnv.selectionWorker(tr.tr({'module': 'NasView','phrase':"Deleting Avialibility Entries",'lang':l}),urlDeleteAvail);
    }

    cnv.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

        var items = dijit.byId(grid).selection.getSelected();

        if(items.length){
            dijit.byId('componentsMainToaster').setContent(message,'message',components.Const.toasterInfo);
            var itemList =[];
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id = grid.store.getValue(selectedItem,'id');
                                itemList.push(id);
                            }
                        });
            cnv.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'NasView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cnv.doSelection    = function(grid,message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        cnv.reload();
                        //---------------------------------------------------
                    
                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'NasView','phrase':"complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }



    function formatBold(value){
        return "<div style='width:100%; height:100%;'><b>"+value+"</b></div>";
    }

    function formatState(value){

        if(value == 1){
            return "<div style='width:100%; height:100%; background-color:#acd87d; '><b>"+tr.tr({'module': 'NasView','phrase':"Up",'lang':l})+"</b></div>";
        }
        if(value == 0){
            return "<div style='width:100%; height:100%; background-color:#f1644d; '><b>"+tr.tr({'module': 'NasView','phrase':"Down",'lang':l})+"</b></div>";
        }
        return value;
    }


})();//(function(){

}
