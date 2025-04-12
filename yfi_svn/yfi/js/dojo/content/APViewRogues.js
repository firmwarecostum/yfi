/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.APViewRogues"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.APViewRogues"] = true;

dojo.provide('content.APViewRogues');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var capvr                    = content.APViewRogues;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var grid;
    var nasID;
    var query                   = {'mac':'*'};

    var urlActAPRogues          = components.Const.cake+'access_points/json_actions_rogues/';
    var urlDelete               = components.Const.cake+'access_points/json_del/?';
    var urlAPRogues             = components.Const.cake+'access_points/json_rogues_index/';
    var urlChangeState          = components.Const.cake+'access_points/json_change_state/?';

    var longTimeout             = components.Const.longTimeout;


    var data_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                   { id : 'Known',       name: "Known" },
                   { id : 'Unknown',     name: "Unknown",selected:'selected'}
              //  { id : 'Known',       name: tr.tr({'module': 'APViewRogues','phrase':"Known",'lang':l}) },
              //  { id : 'Unknown',     name: tr.tr({'module': 'APViewRogues','phrase':"Unknown",'lang':l}),selected:'selected'}
            ]}};
   
    capvr.create   = function(divParent,id){

        nasID = id;
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActAPRogues,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:capvr[action_item.action],Id:nasID});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------
                var divResults      = document.createElement("div");
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

            //----Grid Start----------------
                 var layout = [
                            { field: "ssid",             name: tr.tr({'module': 'APViewRogues','phrase':"SSID",'lang':l}),      width:'auto',formatter: components.Formatters.Bold},
                            { field: "mac",              name: tr.tr({'module': 'APViewRogues','phrase':"MAC",'lang':l}),       width:'auto'},
                            { field: "mode",             name: tr.tr({'module': 'APViewRogues','phrase':"Mode",'lang':l}),      width:'auto'},
                            { field: "channel",          name: tr.tr({'module': 'APViewRogues','phrase':"Channel",'lang':l}),   width:'auto'},
                            { field: "encryption",       name: tr.tr({'module': 'APViewRogues','phrase':"Encryption",'lang':l}),width:'auto'},
                            { field: "modified",         name: tr.tr({'module': 'APViewRogues','phrase':"Last Seen",'lang':l}), width:'auto'},
                            { field: "state",            name: tr.tr({'module': 'APViewRogues','phrase':"Known / Unknown",'lang':l}),width:'auto', formatter: components.Formatters.formatStatus}
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                    dojo.connect(grid,'_onFetchComplete', function(){
                             divResults.innerHTML = "<b>"+tr.tr({'module': 'APViewRogues','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                    })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  capvr.reload_fast();
            //---- END Grid----------------
        },100);
    }

    capvr.reload_fast = function(){
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlAPRogues+nasID+'/?'+ts  });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }

    capvr.reload     = function(){
        console.log("Reload Roques");
        components.Common.dialogConfirm(capvr.reload_confirm);
        
    }

    capvr.reload_confirm    = function(){
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlAPRogues+nasID+'/true/?'+ts  });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }

    

    capvr.del      = function(){
        console.log('Delete Payments');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(capvr.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'APViewRogues','phrase':"No Selection made",'lang':l}),'error',components.Const.toasterError);
        }
    }

    capvr.del_confirm    = function(){
        var rl_function = capvr.reload_fast;
        components.Formatters.deleteWorker({'grid': grid,'message': tr.tr({'module': 'APViewRogues','phrase':"Delete Nearby Device(s)",'lang':l}),'url':urlDelete,'reload': rl_function});
    }

    capvr.edit      = function(){
        var items = grid.selection.getSelected();
        if(items.length){
            _state_dialog();
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'APViewRogues','phrase':"No Selection made",'lang':l}),'error',components.Const.toasterError);
        }
    }

    function _state_dialog(){

        console.log("weer");
        var dlgAdd  = new dijit.Dialog({
                title: 'Change Device(s) State',
                style: "width: 420px"
        });
        console.log("one");
        var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
            var ts = Number(new Date());
            components.QElements.addComboBox({ label:tr.tr({'module': 'APViewRogues','phrase':"Known / Unknown",'lang':l}),data:data_op, divToAdd: frmAdd.domNode,inpName:'state',inpRequired:true, isLast:true,searchAttr:'name', value: 'Unknown'});
         console.log("two");
            var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label: tr.tr({'module': 'APViewRogues','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnAdd.domNode,frmAdd.domNode);
        console.log("three");
                dojo.connect(btnAdd,'onClick',function(){
                    if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        var sel_rogues ='';
                        var count = 0;
                        var items = grid.selection.getSelected();
                        var itemList =[];
                        dojo.forEach(
                                items,
                                function(item) {
                                    if(item !== null) {
                                        var id = grid.store.getValue(item,'id');
                                        itemList.push(id);
                                    }
                        });
                        dojo.forEach(itemList, function(i){
                            sel_rogues = sel_rogues+count+'='+i+'&';
                            count++;
                        });
                        dojo.xhrPost({
                        url: urlChangeState+sel_rogues,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    capvr.reload_fast();
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'APViewRogues','phrase':"Change State of Device(s)",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'APViewRogues','phrase':"Problems changing state of Device(s)",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){

                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                });
        dlgAdd.attr('content',frmAdd);
        console.log("four");
        dlgAdd.show();
    }

})();//(function(){

}

