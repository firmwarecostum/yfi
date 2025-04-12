/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.UserViewUsage"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.UserViewUsage"] = true;

dojo.provide('content.UserViewUsage');
dojo.require('components.Formatters');

dojo.require('dijit.form.TimeTextBox');
dojo.require('components.Translator');


(function(){
    var cuvu                    = content.UserViewUsage;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var grid;
    var userID;

    var urlActUserExtras        = components.Const.cake+'extras/json_actions/';
    var urlUserUsage            = components.Const.cake+'permanent_users/json_usage/';
    var urlTimeAdd              = components.Const.cake+'extras/json_time_add/';
    var urlDataAdd              = components.Const.cake+'extras/json_data_add/';
    var urlDelDataList          = components.Const.cake+'extras/json_data_list/';
    var urlDel                  = components.Const.cake+'extras/json_cap_del/';
    var urlDelTimeList          = components.Const.cake+'extras/json_time_list/';


  
     var data_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'kb', name: tr.tr({'module': 'UserViewUsage','phrase':"Kb",'lang':l}) },
                { id : 'mb', name: tr.tr({'module': 'UserViewUsage','phrase':"Mb",'lang':l}) },
                { id : 'gb', name: tr.tr({'module': 'UserViewUsage','phrase':"Gb",'lang':l}) }
            ]}};

    cuvu.add   = function(divParent,id){

        userID = id;
        console.log('Usage Detail');

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActUserExtras+userID,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cuvu[action_item.action],Id:userID});
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
                            { field: "start",       name: tr.tr({'module': 'UserViewUsage','phrase':"Start date",'lang':l}), width:'auto'},
                            { field: "end",         name: tr.tr({'module': 'UserViewUsage','phrase':"End date",'lang':l}),   width:'auto'},
                            { field: "extra_time",  name: tr.tr({'module': 'UserViewUsage','phrase':"Extra time",'lang':l}), width:'auto',formatter: components.Formatters.Bold},
                            { field: "extra_data",  name: tr.tr({'module': 'UserViewUsage','phrase':"Extra data",'lang':l}), width:'auto',formatter: components.Formatters.FormatOctets},
                            { field: "time_used",   name: tr.tr({'module': 'UserViewUsage','phrase':"Time Used",'lang':l}),  width:'auto',formatter: formatTimeUsed},
                            { field: "time_avail",  name: tr.tr({'module': 'UserViewUsage','phrase':"Time Avail",'lang':l}), width:'auto',formatter: formatTimeAvail},
                            { field: "data_used",   name: tr.tr({'module': 'UserViewUsage','phrase':"Data Used",'lang':l}),  width:'auto',formatter: formatDataUsed},
                            { field: "data_avail",  name: tr.tr({'module': 'UserViewUsage','phrase':"Data Avail",'lang':l}), width:'auto',formatter: formatDataAvail},
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'UserViewUsage','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlUserUsage+userID+'/?'+ts  });
                  grid.setStore(jsonStore,{'start':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);
    }

    cuvu.reload     = function(){
        console.log("Reload Activity");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlUserUsage+userID+'/?'+ts  });
        grid.setStore(jsonStore,{'start':'*'},{ignoreCase: true});
    }

    cuvu.add_time    = function(){
        console.log("Add Time");
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'UserViewUsage','phrase':"Add Extra Time",'lang':l}),
                style: "width: 300px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());

            
                 var lbl =document.createElement('label');
                    var txt=document.createTextNode(tr.tr({'module': 'UserViewUsage','phrase':"Hours",'lang':l})+':'+tr.tr({'module': 'UserViewUsage','phrase':"Minutes",'lang':l}));
                    lbl.appendChild(txt);
                dojo.place(lbl,frmAdd.domNode);
                dojo.addClass(lbl, "frmRequired");

                var t = new dijit.form.TimeTextBox({name:'extra_time', constraints:{timePattern:'HH:mm', clickableIncrement:'T00:15:00', visibleIncrement:'T00:15:00', visibleRange:'T01:00:00'}},document.createElement("div"));
                dojo.place(t.domNode,frmAdd.domNode);

                var br2=document.createElement('BR');
                br2.clear = 'all';
                dojo.place(br2,frmAdd.domNode);

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'UserViewUsage','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){
                    
                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlTimeAdd+userID,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var ts = Number(new Date());
                                    var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlUserUsage+userID+'/?'+ts  });
                                    grid.setStore(jsonStore,{'start':'*'},{ignoreCase: true});
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewUsage','phrase':"Extra Time add OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
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

    cuvu.add_data    = function(){
        console.log("Add Data");
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'UserViewUsage','phrase':"Add Extra Data",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());

                components.QElements.addNumberSpinner({ label:tr.tr({'module': 'UserViewUsage','phrase':"Amount",'lang':l}),valShow:100,min:1,max:500,divToAdd: frmAdd.domNode,inpName:'bytes',isLast:false,inpRequired:true});
                components.QElements.addComboBox({ label:tr.tr({'module': 'UserViewUsage','phrase':"Unit",'lang':l}),data:data_op, divToAdd: frmAdd.domNode,inpName:'units',inpRequired:true, isLast:true,searchAttr:'name',value: 'mb'});

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'UserViewUsage','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlDataAdd+userID,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var ts = Number(new Date());
                                   var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlUserUsage+userID+'/?'+ts  });
                                    grid.setStore(jsonStore,{'start':'*'},{ignoreCase: true});
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewUsage','phrase':"Extra Data add OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
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

    cuvu.del_data   = function(){
        console.log("Remove time....");
        var look_for    = "extra_data";
        var last_empty  = 0;
        var dlg_title   = tr.tr({'module': 'UserViewUsage','phrase':"Delete Data Cap",'lang':l});
        var list        = urlDelDataList+userID;
        _delWorker({'look_for':look_for,'last_empty':last_empty,'dlg_title':dlg_title,'list':list });
    }

   cuvu.del_time   = function(){

        console.log("Remove time....");
        var look_for    = "extra_time";
        var last_empty  = "00:00:00";
        var dlg_title   = tr.tr({'module': 'UserViewUsage','phrase':"Delete Time Cap",'lang':l});
        var list        = urlDelTimeList+userID;
        _delWorker({'look_for':look_for,'last_empty':last_empty,'dlg_title':dlg_title,'list':list });
    }

    function _delWorker(in_data){

        //See if there is data to remove?
        var counter = 0;
        var last_value = 0;
        grid.store.fetch({
                query: {start : "*"},
                queryOptions:{ignoreCase : true},
                onItem : function(item, request) {
                            if(counter ==0){
                                last_value = grid.store.getValue(item, in_data.look_for);
                            }
                            counter ++;
                        }
        });

        if(last_value == in_data.last_empty){
            dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewUsage','phrase':"Nothing to remove",'lang':l})+'</b>','error');
        }else{


            //--Clean up is 2nd time round ----
            if(dijit.byId('contentUserViewDelCap'+userID) != undefined){
                dijit.byId('contentUserViewDelCap'+userID).destroyDescendants(true);
                dijit.byId('contentUserViewDelCap'+userID).destroy(true);
            }
            //-------------------------------

            var dlgDel  = new dijit.Dialog({
                title: in_data.dlg_title,
                style: "width: 320px"
            });
                var frmDel    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                //components.QElements.addPair({          label:'Name',       divToAdd: frmDel.domNode,   inpName:'shortname', inpRequired:true, isLast:false});
                var d=document.createElement('div');
                dojo.place(d,frmDel.domNode);
                components.QElements.addMultiSelect({
                                                            label:      tr.tr({'module': 'UserViewUsage','phrase':"Existing Caps",'lang':l}),
                                                            divToAdd:   d,
                                                            inpName:    'time_caps',
                                                            inpRequired:true,
                                                            isLast:     true,
                                                            url:        in_data.list,
                                                            id:         'contentUserViewDelCap'+userID
                });
                var btnDel = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'UserViewUsage','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnDel.domNode,frmDel.domNode);

                dojo.connect(btnDel,'onClick',function(){
                    //See if there was any value selected
                    var toDelete = [];
                    dojo.forEach(dijit.byId('contentUserViewDelCap'+userID).attr('value'), function(i){
                            toDelete.push(i);
                    });
                    if(toDelete.length < 1){
                        dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewUsage','phrase':"No selection made",'lang':l}),'error');
                    }else{

                        dojo.xhrPost({
                        url: urlDel,
                        content: toDelete, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    dlgDel.destroyRecursive(false); //Destroy the dialog
                                    cuvu.reload();
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewUsage','phrase':"Deleted Cap",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewUsage','phrase':"Problem deleting Cap",'lang':l})+'</b>','message',components.Const.toasterError);
                                }
                                if(response.json.status == 'error'){
                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                });
                dlgDel.attr('content',frmDel);
                dlgDel.show();
        }
    }

    function formatTimeUsed(value){

        return "<div style='widgth:100%; height:100%; background-color:#b9e8fb;'><b>"+value+"</b></div>";
    }

    function formatTimeAvail(value){

        return "<div style='widgth:100%; height:100%; background-color:#c2e5c8'><b>"+value+"</b></div>";
    }

    function formatDataUsed(value){
        var s = components.Formatters.FormatOctets(value);
        return "<div style='widgth:100%; height:100%; background-color:#b9e8fb;'><b>"+s+"</b></div>";
    }

    function formatDataAvail(value){
        var s = components.Formatters.FormatOctets(value);
        return "<div style='widgth:100%; height:100%; background-color:#c2e5c8'><b>"+s+"</b></div>";
    }

})();//(function(){

}
