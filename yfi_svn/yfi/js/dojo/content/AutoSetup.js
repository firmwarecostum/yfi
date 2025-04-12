/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if(!dojo._hasResource['content.AutoSetup']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['content.AutoSetup'] = true;
dojo.provide('content.AutoSetup');

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.QElements');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var ca              = content.AutoSetup;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var urlIndex        = components.Const.cake+'auto_setups/json_index/';
    var urlAdd          = components.Const.cake+'auto_setups/json_add/';
    var urlDelete       = components.Const.cake+'auto_setups/json_del/';

    var longTimeout     = components.Const.longTimeout;

    var grid;
    var query           = {'mac':'*'};

    ca.create=function(divParent){

        console.log('Auto Setup Tab');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");

                //Add the action stuff
                components.QElements.addAction({Name:tr.tr({'module': 'AutoSetup','phrase':"Reload List",'lang':l}),Type:'reload',Parent: divActions,Action:ca['reload'],Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'AutoSetup','phrase':"Edit Selected",'lang':l}),Type:'edit',Parent: divActions,Action:ca.edit,Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'AutoSetup','phrase':"Add",'lang':l}),Type:'add',Parent: divActions,Action:ca.add,Id:null});
                components.QElements.addAction({Name:tr.tr({'module': 'AutoSetup','phrase':"Delete Selected",'lang':l}),Type:'delete',Parent: divActions,Action:ca.del,Id:null})

            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

                var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
            dojo.place(divResults,divGridAction);
            //-----------------------------------------------------------
        dojo.place(divGridAction,divParent);


        setTimeout(function () {
            console.log('Create Grid! - WIP');

            var contentBox = dojo.contentBox(divParent);
            var hight = (contentBox.h-92)+'';
            var s = "height: "+hight+"px ; padding: 20px";

            var cpExp   =   new dijit.layout.ContentPane({
                                style:      s
                            },document.createElement("div"));
            dojo.place(cpExp.domNode,divParent);

            //----Grid Start----------------
                var layout = [
                            { field: "mac",     name: tr.tr({'module': 'AutoSetup','phrase':"MAC Address",'lang':l}), width: 'auto',formatter: components.Formatters.Bold },
                            { field: "ip",      name: tr.tr({'module': 'AutoSetup','phrase':"IP Address",'lang':l}), width: 'auto'},
                            { field: "vpn_ip",  name: tr.tr({'module': 'AutoSetup','phrase':"VPN IP Address",'lang':l}), width: 'auto' },
                            { field: "contact_ip", name: tr.tr({'module': 'AutoSetup','phrase':"Contact IP",'lang':l}), width: 'auto',formatter: components.Formatters.Bold },
                            { field: "last_contact", name: tr.tr({'module': 'AutoSetup','phrase':"Last Contact",'lang':l}), width: 'auto',formatter: formatStatus }
                        ];

                grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                dojo.connect(grid,'_onFetchComplete', function(){
                    //Check if the restart flag is present
                    divResults.innerHTML = "<b>"+tr.tr({'module': 'AutoSetup','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                })

                dojo.addClass(grid.domNode,'divGrid');
                dojo.place(grid.domNode,cpExp.domNode);
                grid.startup();
                ca.reload();
            //---- END Grid----------------
        },100);

    }

    ca.reload   = function(){
        console.log("Reload List");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlIndex+ts });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }

    ca.edit     = function(){
        console.log("Edit Selected");
        var items = grid.selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = grid.store.getValue(selectedItem,'id');
                                var mac     = grid.store.getValue(selectedItem,'mac');
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AutoSetup','phrase':"Opening detail for",'lang':l})+' '+mac+'</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/ASView", [id,mac]);
                            }
                        });
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AutoSetup','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ca.add      = function(){
        console.log("Add Item");
        _add();

    }

    ca.del      = function(){
        console.log('Delete AutoSetup');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(ca.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AutoSetup','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


    ca.del_confirm      = function(){
        ca.selectionWorker(tr.tr({'module': 'AutoSetup','phrase':'Deleting Auto Setup(s)','lang':l}),urlDelete);
    }

    ca.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

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
            ca.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AutoSetup','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    ca.doSelection    = function(grid,message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        ca.reload();
                        //---------------------------------------------------

                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'AutoSetup','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    function _add(){
        console.log('Add Dialog');
        var heading = tr.tr({'module': 'AutoSetup','phrase':"New Auto Setup Device",'lang':l});

        var dlgAdd  = new dijit.Dialog({
                title: heading,
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());
                components.QElements.addPair({  label:tr.tr({'module': 'AutoSetup','phrase':"MAC Address",'lang':l}), divToAdd: frmAdd.domNode,   inpName:'mac',    inpRequired:true, isLast:false});
                components.QElements.addPair({  label:tr.tr({'module': 'AutoSetup','phrase':"IP Address",'lang':l}),  divToAdd: frmAdd.domNode,   inpName:'ip',     inpRequired:true, isLast:false});
                components.QElements.addPair({  label:tr.tr({'module': 'AutoSetup','phrase':"Subnet Mask",'lang':l}), divToAdd: frmAdd.domNode,   inpName:'mask',    inpRequired:true, isLast:false});
                components.QElements.addPair({  label:tr.tr({'module': 'AutoSetup','phrase':"Gateway",'lang':l}),     divToAdd: frmAdd.domNode,   inpName:'gateway', inpRequired:true, isLast:false});
                components.QElements.addPair({  label:tr.tr({'module': 'AutoSetup','phrase':"DNS Server",'lang':l}),  divToAdd: frmAdd.domNode,   inpName:'dns',     inpRequired:true, isLast:true});
              
                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'AutoSetup','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                       
                        dojo.xhrPost({
                        url: urlAdd,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){

                                    ca.reload();
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AutoSetup','phrase':"Created New Auto Setup Device",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                   
                                }else{
                                    
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AutoSetup','phrase':"Problems creating Auto Setup Device",'lang':l})+'</b>','message',components.Const.toasterError);
                                    
                                }

                                if(response.json.status == 'error'){
                                    
                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                    
                                }
                             }
                        });
                    }
                });
        dlgAdd.attr('content',frmAdd);
        dlgAdd.show();
    }

    //=================================
    //Formatter to display values
    function formatStatus(value){

        var pattern_never     = /never/;
        var matches_never     = value.search(pattern_never);
       // console.log('Matches Up',matches_up);
        if(matches_never > -1){
            return "<div style='width:100%; height:100%; background-color:#f1644d; '><b>"+tr.tr({'module': 'AutoSetup','phrase':value,'lang':l})+"</b></div>";
        }else{
            return "<div style='width:100%; height:100%; background-color:#acd87d; '><b>"+tr.tr({'module': 'AutoSetup','phrase':value,'lang':l})+"</b></div>";
            
        }
    }




})();//(function(){

}
