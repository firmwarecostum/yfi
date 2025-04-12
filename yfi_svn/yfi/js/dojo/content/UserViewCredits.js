/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.UserViewCredits"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.UserViewCredits"] = true;

dojo.provide('content.UserViewCredits');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var cuvc                    = content.UserViewCredits;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var grid;
    var userID;

    var urlActCredits      		= components.Const.cake+'credits/json_user_actions/';
    var urlCredits		        = components.Const.cake+'credits/json_user_index/';
    var urlRealmList            = components.Const.cake+'realms/json_index_list';
    var urlUserList             = components.Const.cake+'permanent_users/json_prepaid_list/';
    var urlCreditAtt            = components.Const.cake+'credits/json_attach/';
    var urlCreditView           = components.Const.cake+'credits/json_view/';
    var urlCreditEdit           = components.Const.cake+'credits/json_edit/';
    var urlDelete               = components.Const.cake+'credits/json_del/';

	var query           		= {'id':'*'};

    var data_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'kb', name: tr.tr({'module': 'Credits','phrase':"Kb",'lang':l}) },
                { id : 'mb', name: tr.tr({'module': 'Credits','phrase':"Mb",'lang':l}) },
                { id : 'gb', name: tr.tr({'module': 'Credits','phrase':"Gb",'lang':l}) }
            ]}};

     var time_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'm', name: tr.tr({'module': 'Credits','phrase':"Minutes",'lang':l}) },
                { id : 'h', name: tr.tr({'module': 'Credits','phrase':"Hours",'lang':l}) },
                { id : 'd', name: tr.tr({'module': 'Credits','phrase':"Days",'lang':l}) }
            ]}};


    cuvc.create   = function(divParent,id){

        userID = id;
        console.log('Devices for', userID);

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActCredits,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
								  components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action: cuvc[action_item.action] ,Id:userID});
                                  //components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action: null ,Id:userID});
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
                            { field: "id",          name: tr.tr({'module': 'Credits','phrase':"Id",'lang':l}),      width: 'auto' },
                            { field: "expires",     name: tr.tr({'module': 'Credits','phrase':"Expiry date",'lang':l}),   width: 'auto'},
                            { field: "time",        name: tr.tr({'module': 'Credits','phrase':"Time",'lang':l}),   width: 'auto',formatter: components.Formatters.FormatTime },
                            { field: "data",        name: tr.tr({'module': 'Credits','phrase':"Data",'lang':l}),    width: 'auto',formatter: components.Formatters.FormatOctets}
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'Credits','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();
				  cuvc.reload();
            //---- END Grid----------------
        },100);

    }

    cuvc.reload     = function(){
        console.log("Reload Activity");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlCredits+userID+'/?'+ts  });
        grid.setStore(jsonStore,query,{ignoreCase: true});
    }


    cuvc.edit      = function(){

       console.log('Edit Internet Credit');
        var items = grid.selection.getSelected();
        if(items.length){
            //--------------------
            //Only a single item can be edited
            if(items.length > 1){
                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Edit of Internet Credit limited to one",'lang':l})+'</b>','error',components.Const.toasterError);
                return;
            }else{
                var ic_id        = grid.store.getValue(items[0],'id');
                dojo.xhrGet({
                    url: urlCreditView+ic_id,
                    preventCache: true,
                    handleAs: "json",
                    load: function(response){
                        if(response.json.status == 'ok'){
                            //------------------------------------------------------
                            _dlgEdit(response.internet_credit);
                            //------------------------------------------------------
                        };
                        if(response.json.status == 'error'){
                                dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
                });
            }
            //-------------------------

        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Credits','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cuvc.attach   = function(){

        console.log('Attach Credit to User in Realm');
        var items = grid.selection.getSelected();
        if(items.length){
            //--------------------
            //Only a single item can be edited
            if(items.length > 1){
                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Attachment of Internet Credit limited to one",'lang':l})+'</b>','error',components.Const.toasterError);
                return;
            }else{
                var realm_id        = grid.store.getValue(items[0],'realm_id');
                var ic_id           = grid.store.getValue(items[0],'id');
                _dlgAttach(ic_id, realm_id);
            }
            //-------------------------

        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Credits','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    function _dlgEdit(internet_credit){

        var dlgEdit  = new dijit.Dialog({
                title: tr.tr({'module': 'Credits','phrase':"Edit Internet Credit",'lang':l}),
                style: "width: 420px"
        });
            var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                components.QElements.addDateTextBox({   label:tr.tr({'module': 'Credits','phrase':"Expiry date",'lang':l}),divToAdd: frmEdit.domNode,inpName:'expires',inpRequired:true,isLast:false,inpRequired:true, value: internet_credit.expires});
                components.QElements.addNumberSpinner({ label:tr.tr({'module': 'Credits','phrase':"Data",'lang':l}),valShow:internet_credit.dat,min:0,max:1000,divToAdd: frmEdit.domNode,inpName:'dat',isLast:false,inpRequired:true});
                components.QElements.addComboBox({ label:tr.tr({'module': 'Credits','phrase':"Unit",'lang':l}),data:data_op, divToAdd: frmEdit.domNode,inpName:'data_units',inpRequired:true, isLast:false,searchAttr:'name',value: internet_credit.data_unit});
                components.QElements.addNumberSpinner({ label:tr.tr({'module': 'Credits','phrase':"Time",'lang':l}),valShow:internet_credit.time,min:0,max:60,divToAdd: frmEdit.domNode,inpName:'time',isLast:false,inpRequired:true});
                components.QElements.addComboBox({ label:tr.tr({'module': 'Credits','phrase':"Unit",'lang':l}),data:time_op, divToAdd: frmEdit.domNode,inpName:'time_units',inpRequired:true, isLast:true,searchAttr:'name',value: internet_credit.time_unit});

                var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Credits','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);

                dojo.connect(btnEdit,'onClick',function(){
                   var ts = Number(new Date());
                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlCreditEdit+internet_credit.id+'/?'+ts,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cuvc.reload();
                                    dlgEdit.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Internet Credit attached OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Problems attaching Internet Credit",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){
                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                })
        dlgEdit.attr('content',frmEdit);
        dlgEdit.show();
    }


    function _dlgAttach(ic_id, realm_id){

        console.log('Dialog to attach credit');
        var dlgEdit  = new dijit.Dialog({
                title: tr.tr({'module': 'Credits','phrase':"Attach Internet Credit",'lang':l}),
                style: "width: 420px"
        });
            var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());

                components.QElements.addComboBox({  label:tr.tr({'module': 'Credits','phrase':"Prepaid user",'lang':l}),url:urlUserList+realm_id, divToAdd: frmEdit.domNode,inpName:'user',inpRequired:true, isLast:false,searchAttr: 'name'});

                var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Credits','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);

                dojo.connect(btnEdit,'onClick',function(){
                   var ts = Number(new Date());
                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlCreditAtt+ic_id+'/'+'/?'+ts,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cuvc.reload();
                                    dlgEdit.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Internet Credit attached OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Credits','phrase':"Problems attaching Internet Credit",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){
                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                })
        dlgEdit.attr('content',frmEdit);
        dlgEdit.show();
    }

    cuvc.del      = function(){

        console.log('Delete Internet Credit');
        var items = grid.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cuvc.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Credits','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cuvc.del_confirm      = function(){
        cuvc.selectionWorker(tr.tr({'module': 'Credits','phrase':'Deleting Internet Credit(s)','lang':l}),urlDelete);
    }

    cuvc.selectionWorker     = function(message,url){            //Takes a toaster message + an url to call with the list of selected users

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
            cuvc.doSelection(grid,message,url,itemList);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Credits','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cuvc.doSelection    = function(grid,message,urlToCall,itemList){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        cuvc.reload();
                        //---------------------------------------------------

                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'Credits','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

})();//(function(){

}

