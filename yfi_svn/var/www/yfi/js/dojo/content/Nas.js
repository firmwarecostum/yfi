/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.Nas"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Nas"] = true;
dojo.provide("content.Nas");

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var cn              = content.Nas;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;


    var urlActVouchers  = components.Const.cake+'nas/json_actions/';
    var urlRealmList    = components.Const.cake+'realms/json_index_list';
    var urlPersonList   = components.Const.cake+'nas/json_user_list/';
    var urlNasAdd       = components.Const.cake+'nas/json_add/?';
    var urlNewVpnIp     = components.Const.cake+'nas/json_vpn_new';
    var urlNasIndex     = components.Const.cake+'nas/json_index/?';
    var urlNasIndexQ    = components.Const.cake+'nas/json_index/1/?';
    var urlDelete       = components.Const.cake+'nas/json_del/?';
    var urlRestartChk   = components.Const.cake+'nas/json_restart_chk/?';

    var grid;
    var intervalID;
    var newStore;
    var spanRestart;
    var query           = {'nasname':'*'};

    cn.create  = function(divParent){

        var filteringSelect;

        //Connect the onclose of this tab to clear the refresh intervals
        dojo.connect(dijit.byId('contentWorkspaceNas'),'onClose',function(){
            console.log('clear interval refresh');
            clearInterval(intervalID);
            return true;
        });

        console.log('Nas Devices List');
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
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cn[action_item.action],Id:null});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

            //-------------------Filter + Refresh------------------------
            var filter = document.createElement('span');
            filter.innerHTML ='<b>'+tr.tr({'module': 'Nas','phrase':"Filter",'lang':l})+'</b>';
            dojo.place(filter, divGridAction);
            var t = new dijit.form.TextBox({name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(t,'onKeyUp',function(e){
                    var filterOn = filteringSelect.attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = t.attr('value');

                    query = {'nasname' : val+'*'};
                    if(filterOn == 'nasname'){
                       query = {'nasname' : val+'*'};
                    }
                    if(filterOn == 'shortname'){
                       query = {'shortname' : val+'*'};
                    }
                    if(filterOn == 'type'){
                       query = {'type' : val+'*'};
                    }
                    if(filterOn == 'status'){
                       query = {'status' : val+'*'};
                    }
                    if(filterOn == 'realms'){
                       query = {'realms' : '*'+val+'*'};
                    }
                    grid.setQuery(query);
            });


            dojo.place(t.domNode, divGridAction);

            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'Nas','phrase':"Field",'lang':l})+'</b>';
            dojo.place(spanField,divGridAction);

                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'nasname',    label: tr.tr({'module': 'Nas','phrase':"IP Address",'lang':l}),selected:'selected' },
                                { id : 'shortname',     label: tr.tr({'module': 'Nas','phrase':"Name",'lang':l}) },
                                { id : 'type',          label: tr.tr({'module': 'Nas','phrase':"Type",'lang':l}) },
                                { id : 'status',        label: tr.tr({'module': 'Nas','phrase':"Status",'lang':l}) },
                                { id : 'realms',        label: tr.tr({'module': 'Nas','phrase':"Realms",'lang':l}) }
                                ]}};
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            filteringSelect = new dijit.form.FilteringSelect({
                                                                    value   :"nasname",
                                                                    name    :"state", 
                                                                    searchAttr: "name",
                                                                    store   :myNewStore,
                                                                    searchAttr  :"label",
                                                                    style: "width: 140px;"}, document.createElement("div"));

            dojo.place(filteringSelect.domNode,divGridAction);

            //--------------Update Part--------------------------
            var update = document.createElement('span');
            update.innerHTML ='<b>'+tr.tr({'module': 'Nas','phrase':"Refesh every",'lang':l})+'</b>';
            dojo.place(update, divGridAction);
            var inpNumber = new dijit.form.NumberSpinner({
                                    style: "width:100px",
                                    value: 100, //Change to 100 in order to decrease the load on the server
                                    smallDelta: 1,
                                    id: 'contentNasInterval',
                                    intermediateChanges: true,
                                    constraints: { min:1, max:360, places:0 }
                            }, document.createElement("div") );

            dojo.place(inpNumber.domNode,divGridAction);
            dojo.connect(inpNumber,'onChange',function(){

                var new_val = inpNumber.value;
                console.log("New Interval value " + new_val);
                clearInterval(intervalID);
                intervalID = setInterval(doInterval, (new_val*1000));

            });
            //Start the initial Interval execution
            intervalID = setInterval(doInterval, (inpNumber.value*1000));

            var s = document.createElement('span');
            s.innerHTML ='<b> '+tr.tr({'module': 'Nas','phrase':"seconds",'lang':l})+'</b>';
            dojo.place(s, divGridAction);

            //-----Restart Check-----------------
            spanRestart  = document.createElement('span');
            dojo.addClass(spanRestart, "spanRestart");
            dojo.style(spanRestart,'display','none');
            
            dojo.place(spanRestart,divGridAction);
            //-----------------------------------


            //----------------------------------------------------

                var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
            //-----------------------------------------------------------

        dojo.place(divGridAction,divParent);
        
        setTimeout(function () {

            var contentBox = dojo.contentBox(divParent);
            var hight = (contentBox.h-92)+'';
            var s = "height: "+hight+"px ; padding: 20px";

             var cpExp   =   new dijit.layout.ContentPane({
                                style:      s
                            },document.createElement("div"));
            dojo.place(cpExp.domNode,divParent);

            //----Grid Start----------------
                 var layout = [
                            { field: "nasname", name: tr.tr({'module': 'Nas','phrase':"IP Address",'lang':l}), width: 'auto' },
                            { field: "shortname", name: tr.tr({'module': 'Nas','phrase':"Name",'lang':l}), width: 'auto' },
                            { field: "type", name: tr.tr({'module': 'Nas','phrase':"Type",'lang':l}), width: 'auto' },
                            { field: "status", name: tr.tr({'module': 'Nas','phrase':"Status",'lang':l}), width: 'auto',formatter: formatStatus },
                            { field: "connected", name: tr.tr({'module': 'Nas','phrase':"Users Connected",'lang':l}), width: 'auto',formatter: formatBold  },
                            { field: "contact", name: tr.tr({'module': 'Nas','phrase':"Contact Person",'lang':l}), width: 'auto' },
                            { field: "realms", name: tr.tr({'module': 'Nas','phrase':"Realms",'lang':l}),width: '100px'}
                        ];

                grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px',
                                escapeHTMLInData: false
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                            //Check if the restart flag is present
                             divResults.innerHTML = "<b>"+tr.tr({'module': 'Nas','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlNasIndex+ts });
                  grid.setStore(jsonStore,query,{ignoreCase: true});
            //---- END Grid----------------
        },100);

    }


    cn.reload  = function(){
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlNasIndex+ts });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }

    cn.del      = function(){

        console.log('Delete NAS Device(s');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cn.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Nas','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cn.del_confirm      = function(){
        cn.selectionWorker(tr.tr({'module': 'Nas','phrase':"Deleting NAS Device(s)",'lang':l}),urlDelete);
    }

    cn.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

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
            cn.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Nas','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cn.doSelection    = function(grid,message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        cn.reload();
                        //---------------------------------------------------
                    
                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'Nas','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cn.add_tunnel   = function(){

        console.log('Add VPN Connected NAS Device(s)');
        //Get the value of the next IP

        dojo.xhrGet({
            url: urlNewVpnIp,
            preventCache: true,
            handleAs: "json",
            load: function(response){
                    if(response.json.status == 'ok'){
                        //console.log("New IP",response.nas.ip);
                        cn.add(response.nas.ip);
                    };
                    if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });

    }

    cn.add      = function(new_ip){
        console.log('Add NAS Device');
        var heading = tr.tr({'module': 'Nas','phrase':"New NAS Device",'lang':l});
        if(new_ip != undefined){
            heading = tr.tr({'module': 'Nas','phrase':"New VPN connected NAS Device",'lang':l})
        }

         //--Clean up is 2nd time round ----
        if(dijit.byId('contentNasAddRealms') != undefined){
            dijit.byId('contentNasAddRealms').destroyDescendants(true);
            dijit.byId('contentNasAddRealms').destroy(true);
        }
        //-------------------------------
               


        var dlgAdd  = new dijit.Dialog({
                title: heading,
                style: "width: 420px",
                onCancel: function(){
                   this.destroyRecursive(); 

                }
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());
                //VPN devices's IPs are on a register so we are not allowed to change it
                if(new_ip == undefined){
                    components.QElements.addPair({          label:tr.tr({'module': 'Nas','phrase':"IP Address",'lang':l}), divToAdd: frmAdd.domNode,   inpName:'nasname',   inpRequired:true, isLast:false});
                }else{
                    components.QElements.addPair({          label:tr.tr({'module': 'Nas','phrase':"IP Address",'lang':l}), divToAdd: frmAdd.domNode,   inpName:'nasname',   inpRequired:true, isLast:false, value: new_ip, disabled:'disabled'});
                    var hiddenId    = document.createElement("input");  //Hidden element containing the IP
                    hiddenId.type   = "hidden";
                    hiddenId.name   = "vpn_nasname";
                    hiddenId.value  = new_ip;
                    dojo.place(hiddenId,frmAdd.domNode);
                }

                components.QElements.addPair({          label:tr.tr({'module': 'Nas','phrase':"Name",'lang':l}),       divToAdd: frmAdd.domNode,   inpName:'shortname', inpRequired:true, isLast:false});
                components.QElements.addPair({          label:tr.tr({'module': 'Nas','phrase':"Secret",'lang':l}),     divToAdd: frmAdd.domNode,   inpName:'secret',inpRequired:true, isLast:false});
                components.QElements.addComboBox({      label:tr.tr({'module': 'Nas','phrase':"Contact Person",'lang':l}),url:urlPersonList, divToAdd: frmAdd.domNode,inpName:'user_id',inpRequired:true, isLast:false,searchAttr:'name'});

                var d=document.createElement('div');

                if(components.LoginLight.UserInfo.group == components.Const.admin){       //Only Available to Administrators
                    components.QElements.addCheckPair({label:tr.tr({'module': 'Nas','phrase':"Available to all",'lang':l}),divToAdd: frmAdd.domNode,inpName:'available_all', inpRequired:true,checked: 'checked',value: 'on',isLast: false, id: 'nasAvToAll'});
                    
                    //Get the checkbox
                    var ipt = dijit.byId('nasAvToAll');
                    dojo.connect(ipt,'onChange', function(){
                        var me = this;
                        if(me.checked){
                            dojo.style(d,"display","none");
                        }else{
                            dojo.style(d,"display","block");
                        }
                    });
                    //Hide by default
                    dojo.style(d,"display","none");
                }
                
                dojo.place(d,frmAdd.domNode);
                    components.QElements.addMultiSelect({
                                                            label:      tr.tr({'module': 'Nas','phrase':"Available only to",'lang':l}),
                                                            divToAdd:   d,
                                                            inpName:    'realms',
                                                            inpRequired:true,
                                                            isLast:     true,
                                                            url:        urlRealmList,
                                                            id:         'contentNasAddRealms' 
                    });
                
                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Nas','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        var realms ='';
                        var count = 0;
                        dojo.forEach(dijit.byId('contentNasAddRealms').attr('value'), function(i){
                            realms = realms+count+'='+i+'&';
                            count++;
                        });
                        dojo.xhrPost({
                        url: urlNasAdd+realms,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var ts = Number(new Date());
                                    var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlNasIndex+ts });
                                    grid.setStore(jsonStore,query,{ignoreCase: true});
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Nas','phrase':"Created NAS Device",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Nas','phrase':"Problems creating NAS device",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){

                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                })
        dlgAdd.attr('content',frmAdd);
        dlgAdd.show();
    }

    cn.edit   = function(){

        console.log("Edit action clicked");
        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = grid.store.getValue(selectedItem,'id');
                                var v_name  = grid.store.getValue(selectedItem,'nasname');
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Nas','phrase':"Opening detail for",'lang':l})+' ' +v_name+'</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/NasView", [id,v_name]);
                                //console.log("NAS with id "+id+" selected");
                            }
                        });
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Nas','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    function doInterval(){

        //When the tab is closed we stop the interval check
        if(dijit.byId('contentNasInterval')==undefined){
             console.log("last of previous loop...just return");
             clearInterval(intervalID);
             return;
        }
        var status_now = dijit.byId('componentsMainStatus').domNode.innerHTML;
        dijit.byId('componentsMainStatus').domNode.innerHTML = tr.tr({'module': 'Nas','phrase':"Fetching latest",'lang':l})+' <b>Nas</b> '+tr.tr({'module': 'Nas','phrase':"data",'lang':l});
         //Get a fresh store
        var ts = Number(new Date());
        newStore = new dojo.data.ItemFileReadStore({ url: urlNasIndexQ+ts });
        checkToRemove(newStore); //Check if there are old entries to remove

        newStore.fetch({onComplete: gotItems});


        dijit.byId('componentsMainStatus').domNode.innerHTML = status_now;

        //------Check for Restart wait--------
        dojo.xhrGet({
            url: urlRestartChk+ts,
            preventCache: true,
            handleAs: "json",
            load: function(response){
                    if(response.json.status == 'ok'){

                        if(response.restart_wait == true){
                            spanRestart.innerHTML = "<img src='img/actions/restart_wait.png' />"+tr.tr({'module': 'Nas','phrase':"Activate Changes",'lang':l})+": "+response.restart_countdown;
                            dojo.style(spanRestart,'display','inline');

                        }else{
                            dojo.style(spanRestart,'display','none');
                        }

                    };
                    if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
        //-----------------------------------

    }

    function checkToRemove(latestStore){

        //Get the original list
        grid.store.fetch({onComplete: gotOldList});

        function gotOldList(items){
            
            dojo.forEach(items,function(item){  //Start Foreach

                //Get the ID of the item
                var itemId      = grid.store.getValue(item, "id");
                //Check if present in the new store
                latestStore.fetchItemByIdentity({
                                identity: itemId,
                                onItem : function(i) {
                                            if(i == null){  //The latest list knows not of this one - remove from write store
                                                grid.store.deleteItem(item);
                                                grid.store.save();
                                            }
                                        }
                            });

            }) //End Foreach

        }
    }


    function gotItems(items){

        dojo.forEach(items,function(item){
            var itemId     = newStore.getValue(item, "id");
            var st         = newStore.getValue(item, "status");
            var conn       = newStore.getValue(item, "connected");
            grid.store.fetchItemByIdentity({
                    identity: itemId,
                    onItem : function(i, request) {
                        if(i != null){
                          //  console.log("Item Found Update it");
                            grid.store.setValue(i,"status",st);
                            grid.store.setValue(i,"connected",conn);
                            grid.store.save();
                        }else{


                        }
                    }});
        });
    }





    //=================================
    //Formatter to display values
    function formatStatus(value){

        var pattern_up     = /Up/;
        var pattern_down   = /Down/;

        var matches_up     = value.search(pattern_up);
       // console.log('Matches Up',matches_up);
        if(matches_up > -1){
            return "<div style='width:100%; height:100%; background-color:#acd87d; '><b>"+value+"</b></div>";
        }
        var matches_down     = value.search(pattern_down);
       // console.log('Matches Down',matches_down);
        if(matches_down > -1){
            return "<div style='width:100%; height:100%; background-color:#f1644d; '><b>"+value+"</b></div>";
        }
        return "<div style='width:100%; height:100%; background-color:#10ecef; '><b>"+value+"</b></div>";
    }

    //Formatter to display values
    function formatBold(value){
        return "<div style='width:100%; height:100%;'><b>"+value+"</b></div>";
    }

    //===============================



})();//(function(){

}
