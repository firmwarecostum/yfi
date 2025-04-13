/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.Realms"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Realms"] = true;
dojo.provide("content.Realms");

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var cr              = content.Realms;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var urlRealmList    = components.Const.cake+'realms/json_index/?';
    var urlRealmAdd     =  components.Const.cake+'realms/json_add';
    var urlDelete       = components.Const.cake+'realms/json_delete/';
    var urlRestartChk   = components.Const.cake+'realms/json_restart_chk/?';

    var grid;
    var intervalID;

    cr.create   =function(divParent){


        //Connect the onclose of this tab to clear the refresh intervals
        dojo.connect(dijit.byId('contentWorkspaceRealms'),'onClose',function(){
            console.log('clear interval refresh');
            clearInterval(intervalID);
            return true;
        });

        console.log('Realm List');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');
            
            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");

                components.QElements.addAction({Name:tr.tr({'module': 'Realms','phrase':"Reload List",'lang':l}),Type:'reload',Parent: divActions,Action:cr['reload'],Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'Realms','phrase':"Edit Selected",'lang':l}),Type:'edit',Parent: divActions,Action:cr['edit'],Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'Realms','phrase':"Add Realm",'lang':l}),Type:'add',Parent: divActions,Action:cr['add'],Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'Realms','phrase':"Delete Selected",'lang':l}),Type:'delete',Parent: divActions,Action:cr['del'],Id:null});
        dojo.place(divActions,divGridAction);


            //--------------Update Part--------------------------
            var update = document.createElement('span');
            update.innerHTML ='<b>'+tr.tr({'module': 'Realms','phrase':"Activate changes check every",'lang':l})+' </b>';
            dojo.place(update, divGridAction);
            var inpNumber = new dijit.form.NumberSpinner({
                                    style: "width:100px",
                                    value: components.Const.defaultInterval,
                                    smallDelta: 1,
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
            s.innerHTML ='<b> '+tr.tr({'module': 'Realms','phrase':"seconds",'lang':l})+'</b>';
            dojo.place(s, divGridAction);

            //-----Restart Check-----------------
            spanRestart  = document.createElement('span');
            dojo.addClass(spanRestart, "spanRestart");
            dojo.style(spanRestart,'display','none');
            
            dojo.place(spanRestart,divGridAction);
            //-----------------------------------


             //---Result Feedback----
             var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
            //---------------------------------


        dojo.place(divGridAction,divParent);
            //-----------------------------------------------------------


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

            //----Grid Start----------------
                 var layout = [
                                { field: "name", name: tr.tr({'module': 'Realms','phrase':"Name",'lang':l}), width: 'auto' },
                                { field: "append_string_to_user", name: tr.tr({'module': 'Realms','phrase':"Append To Name",'lang':l}), width: 'auto' },
                                { field: "phone", name: tr.tr({'module': 'Realms','phrase':"Phone",'lang':l}), width: 'auto' },
                                { field: "cell", name: tr.tr({'module': 'Realms','phrase':"Cell",'lang':l}), width: 'auto' },
                                { field: "email", name: tr.tr({'module': 'Realms','phrase':"e-mail",'lang':l}), width: 'auto' }
                            ];

                grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                dojo.connect(grid,'_onFetchComplete', function(){
                             divResults.innerHTML = '<b>'+tr.tr({'module': 'Realms','phrase':"Result count",'lang':l})+': </b>'+ grid.rowCount;
                    })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();
                  cr.reload();
            //---- END Grid----------------
        },100);

    }

    cr.reload = function(){
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlRealmList+ts });
        grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
    }


     cr.add  = function(){
        console.log("Add Realm");
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'Realms','phrase':"Add Realm",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());

                components.QElements.addPair({label:tr.tr({'module': 'Realms','phrase':"Name",'lang':l}),         divToAdd: frmAdd.domNode,inpName:'Name',        inpRequired:true, isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Realms','phrase':"Append String",'lang':l}),divToAdd: frmAdd.domNode,inpName:'Append',      inpRequired:true, isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Realms','phrase':"Phone",'lang':l}),        divToAdd: frmAdd.domNode,inpName:'Phone',       inpRequired:false,isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Realms','phrase':"Fax",'lang':l}),          divToAdd: frmAdd.domNode,inpName:'Fax',         inpRequired:false,isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Realms','phrase':"Cell",'lang':l}),         divToAdd: frmAdd.domNode,inpName:'Cell',        inpRequired:false,isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Realms','phrase':"e-mail",'lang':l}),       divToAdd: frmAdd.domNode,inpName:'Email',       inpRequired:false,isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Realms','phrase':"url",'lang':l}),          divToAdd: frmAdd.domNode,inpName:'Url',         inpRequired:false,isLast:false});
                 //Add a more granular adress for Goecoding:
                    var lbl =document.createElement('label');
                        var txt=document.createTextNode(tr.tr({'module': 'Realms','phrase':"Address",'lang':l}));
                    lbl.appendChild(txt);
                dojo.addClass(lbl, "frmRequired");
                dojo.place(lbl,frmAdd.domNode);
                    var br=document.createElement('br');
                    br.clear = 'all';
                dojo.place(br,frmAdd.domNode);

                components.QElements.addPair({label:tr.tr({'module': 'Realms','phrase':"Street Number",'lang':l}),    divToAdd: frmAdd.domNode,inpName:'StreetNo',  inpRequired:false, isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Realms','phrase':"Street",'lang':l}),           divToAdd: frmAdd.domNode,inpName:'Street',    inpRequired:false, isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Realms','phrase':"Town / Suburb",'lang':l}),    divToAdd: frmAdd.domNode,inpName:'TownSuburb',inpRequired:false, isLast:false});
                components.QElements.addPair({label:tr.tr({'module': 'Realms','phrase':"City",'lang':l}),             divToAdd: frmAdd.domNode,inpName:'City',      inpRequired:false, isLast:true });

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Realms','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                
                dojo.connect(btnAdd,'onClick',function(){
                    
                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlRealmAdd,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var newItem  = grid.store.newItem({
                                            id          : response.Realm.id,
                                            name        : frmObj.Name,
                           append_string_to_user        : frmObj.Append,
                                            phone       : frmObj.Phone,
                                            cell        : frmObj.Cell,
                                            email       : frmObj.Email
                                    });
                                    grid.store.save();

                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Realms','phrase':"Realm added OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Realms','phrase':"Problems adding realm",'lang':l})+'</b>','message',components.Const.toasterError);
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


    cr.del      = function(){
        console.log('Delete Realms');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cr.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Realms','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cr.del_confirm  = function(){
        console.log("Remove Realm");
        cr.selectionWorker(tr.tr({'module': 'Realms','phrase':"Deleting Realms",'lang':l}),urlDelete);
    }

    cr.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

        var items = grid.selection.getSelected();

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
            cr.doSelection(message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Realms','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cr.doSelection    = function(message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        if(urlToCall == urlDelete){     //Dirty hack to add a delete of the data store if successfull
                            var items = grid.selection.getSelected();
                            dojo.forEach(items, function(selectedItem){
                                if(selectedItem !== null){
                                    grid.store.deleteItem(selectedItem);
                                    grid.store.save();
                                }
                            });
                        }
                        //---------------------------------------------------
                    
                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'Realms','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

     cr.edit   = function(){

        console.log("Edit action clicked");
        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = grid.store.getValue(selectedItem,'id');
                                var v_name  = grid.store.getValue(selectedItem,'name');
                                dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Realms','phrase':"Opening detail for",'lang':l})+' '+v_name,'message',components.Const.toasterInfo);
                                dojo.publish("/actions/RealmView", [id,v_name]);
                                console.log("Realm with id "+id+" selected");
                            }
                        });
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Realms','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


     function doInterval(){

        //------Check for Restart wait--------
        var ts = Number(new Date());
        dojo.xhrGet({
            url: urlRestartChk+ts,
            preventCache: true,
            handleAs: "json",
            load: function(response){
                    if(response.json.status == 'ok'){

                        if(response.restart_wait == true){
                            spanRestart.innerHTML = "<img src='img/actions/restart_wait.png' />"+tr.tr({'module': 'Realms','phrase':"Activate Changes",'lang':l})+": "+response.restart_countdown;
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


})();//(function(){

}
