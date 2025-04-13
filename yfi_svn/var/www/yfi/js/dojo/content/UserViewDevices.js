/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.UserViewDevices"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.UserViewDevices"] = true;

dojo.provide('content.UserViewDevices');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var cuvd                    = content.UserViewDevices;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var grid;
    var userID;

    var urlActDevices      		= components.Const.cake+'devices/json_actions/';
    var urlDevices		        = components.Const.cake+'devices/json_index/';
    var urlDeviceAdd            = components.Const.cake+'devices/json_add/';
    var urlDelete               = components.Const.cake+'devices/json_del/';

	var query           		= {'name':'*'};

    cuvd.create   = function(divParent,id){

        userID = id;
        console.log('Devices for', userID);

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActDevices,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
								  components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action: cuvd[action_item.action] ,Id:userID});
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
                            { field: "name",     	name: tr.tr({'module': 'UserViewDevices','phrase':"MAC",'lang':l}), width:'auto',formatter: components.Formatters.Bold},
                            { field: "description", name: tr.tr({'module': 'UserViewDevices','phrase':"Description",'lang':l}),   width:'auto'},
                            { field: "last_contact",name: tr.tr({'module': 'UserViewDevices','phrase':"Last Contact",'lang':l}), width:'auto', formatter: formatStatus}
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'UserViewDevices','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();
				  cuvd.reload();
            //---- END Grid----------------
        },100);
    }
	
    cuvd.reload     = function(){
        console.log("Reload Activity");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlDevices+userID+'/?'+ts  });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }


    cuvd.add        = function(){

        console.log('Add Extra Service');
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'UserViewDevices','phrase':"Add Device",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());
                components.QElements.addPair({ 	label:tr.tr({'module': 'UserViewDevices','phrase':"MAC Address",'lang':l}),  divToAdd: frmAdd.domNode,inpName:'mac',inpRequired:true, isLast:false});
                components.QElements.addPair({ 	label:tr.tr({'module': 'UserViewDevices','phrase':"Description",'lang':l}),  divToAdd: frmAdd.domNode,inpName:'description',inpRequired:true, isLast:true});

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'UserViewDevices','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){
                   var ts = Number(new Date());
                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlDeviceAdd+userID+'/?'+ts,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cuvd.reload()
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewDevices','phrase':"Device added OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewDevices','phrase':"Problems adding device",'lang':l})+'</b>','message',components.Const.toasterError);
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

    cuvd.del      = function(){

        console.log('Delete Extra Service');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cuvd.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewDevices','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cuvd.del_confirm      = function(){
        cuvd.selectionWorker(tr.tr({'module': 'UserViewDevices','phrase':'Deleting Device(s)','lang':l}),urlDelete);
    }

    cuvd.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

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
            cuvd.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'UserViewDevices','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cuvd.doSelection    = function(grid,message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        cuvd.reload();
                        //---------------------------------------------------

                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'UserViewDevices','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    //=================================
    //Formatter to display values
    function formatStatus(value){

        var pattern_never     = /never/;
        var matches_never     = value.search(pattern_never);
       // console.log('Matches Up',matches_up);
        if(matches_never > -1){
            return "<div style='width:100%; height:100%; background-color:#f1644d; '><b>"+tr.tr({'module': 'UserViewDevices','phrase': value,'lang':l})+"</b></div>";
        }else{
			return "<div style='width:100%; height:100%; background-color:#acd87d; '><b>"+tr.tr({'module': 'UserViewDevices','phrase': value,'lang':l})+"</b></div>";
			
		}
    }

})();//(function(){

}

