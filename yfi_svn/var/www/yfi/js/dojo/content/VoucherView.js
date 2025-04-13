/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["content.VoucherView"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.VoucherView"] = true;
dojo.provide("content.VoucherView");

dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('components.QElements');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){
    var cvv             = content.VoucherView;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var urlActVoucherProfile    = components.Const.cake+'vouchers/json_actions_for_voucher_profile/';
    var urlActVoucherPrivate    = components.Const.cake+'vouchers/json_actions_for_voucher_private/';
    var urlActVoucherActivity   = components.Const.cake+'vouchers/json_actions_for_voucher_activity/';
    var urlProfileForVoucher    = components.Const.cake+'profiles/json_view_for_voucher/';
    var urlPrivateForVoucher    = components.Const.cake+'vouchers/json_private_attributes/';
    var urlVoucherChangeProfile = components.Const.cake+'vouchers/json_change_profile/';
    var urlProfileList          = components.Const.cake+'profiles/json_index';
    var urlVendors              = components.Const.cake+'templates/json_vendors/';
    var urlAttr                 = components.Const.cake+'templates/json_attributes_for_vendor/';
    var urlVoucherAddPrivate    = components.Const.cake+'vouchers/json_add_private/';
    var urlDeletePrivate        = components.Const.cake+'vouchers/json_del_private/';
    var urlVoucherEditPrivate   = components.Const.cake+'vouchers/json_edit_private/';
    var urlVoucherActivity      = components.Const.cake+'/vouchers/json_view_activity/';
    var urlDeleteActivity       = components.Const.cake+'/vouchers/json_del_activity/';

    var voucherID;
    var gridProfile;
    var gridPrivate;
    var gridActivity;

    var data_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : '==', name: "==",selected:'selected' },
                { id : '=', name: "=" },
                { id : ':=', name: ":=" },
                { id : '+=', name: "+=" },
                { id : '!=', name: "!=" },  //'==', '=', ':=', '+=','!=','>','>=','<','<=','=~','!~','=*','!*'
                { id : '>', name: ">" },
                { id : '>=', name: ">=" },
                { id : '<', name: "<" },
                { id : '<=', name: "<=" },
                { id : '=~', name: "=~" },
                { id : '!~', name: "!~" },
                { id : '=*', name: "=*" },
                { id : '!*', name: "!*" }
            ]}};

    
    cvv.create=function(divParent,id){

        voucherID = id;

        console.log("Voucher Detail comming up...."+id);
        //Focus on tab
        dijit.byId("contentWorkspaceTabcontainer").selectChild(dijit.byId('contentWorkspaceVoucher'+id));

       //----------------
        //Tab Container
        var tc = new dijit.layout.TabContainer({
            tabPosition: "top",
            nested: false,
            style : "width:auto;height:100%; padding: 10px; border: 1px solid #000000;"
        },document.createElement("div"));

        dijit.byId('contentWorkspaceVoucher'+id).attr('content',tc.domNode);

            //Tab
            var tcOne    = new dijit.layout.ContentPane({title :    tr.tr({'module': 'VoucherView','phrase':"Profile Attributes",'lang':l})});
            //Tab
            var tcTwo     = new dijit.layout.ContentPane({title :   tr.tr({'module': 'VoucherView','phrase':"Private Attributes",'lang':l})});
            //Tab
            var tcThree     = new dijit.layout.ContentPane({title : tr.tr({'module': 'VoucherView','phrase':"Activity",'lang':l})});

            //-------------------------------
            dojo.connect(tc, 'selectChild',function(e){

                //--------------------------
                if(e == tcThree){
                    console.log('Activity Tab Clicked');
                    //It it already has children do not populate it
                    if(e.domNode.childNodes.length == 0){
                        var divActivity = document.createElement("div");
                        dojo.addClass(divActivity, 'divTabInTab' );
                        tcThree.attr('content',divActivity);
                        detailActivity(divActivity);
                    }
                }
                //------------------------

                //------------------------------
                if(e == tcTwo){
                    if(e.domNode.childNodes.length == 0){

                        var divPrivate = document.createElement("div");
                        dojo.addClass(divPrivate, 'divTabInTab' );
                        tcTwo.attr('content',divPrivate);
                        detailPrivate(divPrivate,id);
                    }
                }
                //----------------------------

            });
            //-----------------------------

            tc.addChild(tcOne);
            tc.addChild(tcTwo);
            tc.addChild(tcThree);
        //---------------------

        //Initialise the tabs
        tc.startup();

        var divProfile = document.createElement("div");
        dojo.addClass(divProfile, 'divTabInTab' );
        tcOne.attr('content',divProfile);
        detailProfile(divProfile,id);

    }

    cvv.edit_profile    = function(id){

        var dlgEdit  = new dijit.Dialog({
                title: tr.tr({'module': 'VoucherView','phrase':"Change Profile",'lang':l}),
                style: "width: 420px"
        });
        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
                    hiddenId.type   = "hidden";
                    hiddenId.name   = "id";
                    hiddenId.value  = id;
                dojo.place(hiddenId,frmEdit.domNode);

                components.QElements.addComboBox({      label:tr.tr({'module': 'VoucherView','phrase':"Profile",'lang':l}),url:urlProfileList, divToAdd: frmEdit.domNode,inpName:'profile',inpRequired:true, isLast:true,searchAttr:'name'});
                var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'VoucherView','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnEdit.domNode,frmEdit.domNode);

                dojo.connect(btnEdit,'onClick',function(){

                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlVoucherChangeProfile,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var ts = Number(new Date());
                                    var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlProfileForVoucher+id+'/'+ts });  //Reload the latest changed profile
                                    gridProfile.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
                                    dlgEdit.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'VoucherView','phrase':"Profile Changed",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'VoucherView','phrase':"Problems changing profile",'lang':l})+'</b>','message',components.Const.toasterError);
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


    cvv.add_private    = function(id){

        //----Clean up first----------
        if(dijit.byId('contentVouchersViewVendor') != undefined){
            dijit.byId('contentVouchersViewVendor').destroyDescendants(true);
            dijit.byId('contentVouchersViewVendor').destroy(true);
        }
        if(dijit.byId('contentVouchersViewAttribute') != undefined){
            dijit.byId('contentVouchersViewAttribute').destroyDescendants(true);
            dijit.byId('contentVouchersViewAttribute').destroy(true);
        }
        //----------------------------

        var data_check_reply = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'Radcheck', name: tr.tr({'module': 'VoucherView','phrase':"Check",'lang':l}),selected:'selected' },
                { id : 'Radreply', name: tr.tr({'module': 'VoucherView','phrase':"Reply",'lang':l}) }
            ]}};

        
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'VoucherView','phrase':"Add Private Attribute",'lang':l}),
                style: "width: 420px"
        });
        var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
                    hiddenId.type   = "hidden";
                    hiddenId.name   = "id";
                    hiddenId.value  = id;
                dojo.place(hiddenId,frmAdd.domNode);

                components.QElements.addComboBox({ label:tr.tr({'module': 'VoucherView','phrase':"Vendor",'lang':l}),url:urlVendors, divToAdd: frmAdd.domNode,inpName:'vendor',inpRequired:true, isLast:false,searchAttr:'name',value: 0,id:'contentVouchersViewVendor'});
                components.QElements.addComboBox({ label:tr.tr({'module': 'VoucherView','phrase':"Attribute",'lang':l}),url:urlAttr+'Misc', divToAdd: frmAdd.domNode,inpName:'attribute',inpRequired:true, isLast:false,searchAttr:'name',value: 0,id:'contentVouchersViewAttribute'});
                components.QElements.addComboBox({ label:tr.tr({'module': 'VoucherView','phrase':"Check/Reply",'lang':l}),data:data_check_reply, divToAdd: frmAdd.domNode,inpName:'check_reply',inpRequired:true, isLast:false,searchAttr:'name',value: 'Radcheck'});
                components.QElements.addComboBox({ label:tr.tr({'module': 'VoucherView','phrase':"Operator",'lang':l}),data:data_op, divToAdd: frmAdd.domNode,inpName:'op',inpRequired:true, isLast:false,searchAttr:'name',value: '=='});
                components.QElements.addPair({label:tr.tr({'module': 'VoucherView','phrase':"Value",'lang':l}), divToAdd: frmAdd.domNode,inpName:'value', inpRequired:true, isLast:true});

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'VoucherView','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(dijit.byId('contentVouchersViewVendor'),'onChange',function(){    //Change the Attributes accordingly on changes of the vendor
                    var now_selected = dijit.byId('contentVouchersViewVendor').getDisplayedValue();
                    var newAttrStore = new dojo.data.ItemFileReadStore({url: urlAttr+now_selected});
                    dijit.byId('contentVouchersViewAttribute').attr('store',newAttrStore);
                    dijit.byId('contentVouchersViewAttribute').attr('value',0);
                });


                dojo.connect(btnAdd,'onClick',function(){

                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        //Get the displayed vallue of the attribute select
                        var attr = dijit.byId('contentVouchersViewAttribute').getDisplayedValue();

                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlVoucherAddPrivate+id+'/'+attr,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var ts = Number(new Date());
                                    var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlPrivateForVoucher+id+'/'+ts  });
                                    gridPrivate.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'VoucherView','phrase':"Attribute added",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'VoucherView','phrase':"Problems adding attribute",'lang':l})+'</b>','message',components.Const.toasterError);
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

    cvv.edit_private    = function(id){

        //Get the id of the attribute that was selected
        var items = gridPrivate.selection.getSelected();

        if(items.length){

            if(items.length > 1){

                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'VoucherView','phrase':"Edit selection limit to one",'lang':l})+'</b>','error',components.Const.toasterError);

            }else{
                var attribute   =  gridPrivate.store.getValue(items[0],'name');
                var attr_id     =  gridPrivate.store.getValue(items[0],'id');
                var op          =  gridPrivate.store.getValue(items[0],'op');
                var value       =  gridPrivate.store.getValue(items[0],'value');
               // console.log('Change Value for ',attribute,'id ',id);
                change_private_attribute({'id':id, 'attr_id':attr_id,'attribute': attribute,'op': op,'value':value});

            }

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'VoucherView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }

    }

   
     cvv.del_private      = function(id){
        console.log("Remove Private Attribute");
        voucherID = id;
        var items = gridPrivate.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cvv.del_private_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'VoucherView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cvv.del_private_confirm      = function(){

        cvv.selectionWorker(gridPrivate,tr.tr({'module': 'VoucherView','phrase':"Deleting Private Attribute(s)",'lang':l}),urlDeletePrivate,voucherID);
    }

    cvv.selectionWorker     = function(grid,message,url,id){            //Takes a toaster message + an url to call with the list of selected users

        var items = dijit.byId(grid).selection.getSelected();

        if(items.length){
            dijit.byId('componentsMainToaster').setContent(message,'message',components.Const.toasterInfo);
            var itemList =[];
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var attribute =  grid.store.getValue(selectedItem,'name');
                                if((attribute != 'Cleartext-Password')&(urlDeletePrivate == url)){       //We can not delete 'Cleartext-Password'
                                    var id = grid.store.getValue(selectedItem,'id');
                                    itemList.push(id);
                                }
                            }
                        });
            cvv.doSelection(grid,message,url,itemList,id);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'VoucherView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cvv.doSelection    = function(grid,message,urlToCall,itemList,id){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        //------------------------------------------------------
                        var ts = Number(new Date());

                        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlPrivateForVoucher+id+'/'+ts  });
                        grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
                        //---------------------------------------------------
                    
                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'VoucherView','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }


    cvv.reload_activity     = function(){
        console.log("Reload Activity");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlVoucherActivity+voucherID+'/'+ts  });
        gridActivity.setStore(jsonStore,{'mac':'*'},{ignoreCase: true});
    }

    cvv.del_activity        = function(){

        console.log("Delete Activity");
        var items = gridActivity.selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cvv.del_activity_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'VoucherView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cvv.del_activity_confirm    =  function(){

        
        var items = gridActivity.selection.getSelected();

        if(items.length){
        
            dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'VoucherView','phrase':"Delete Activity records",'lang':l})+'</b>','message',components.Const.toasterInfo);
            var itemList =[];
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                    var id = gridActivity.store.getValue(selectedItem,'id');
                                    itemList.push(id);
                            }
                        });
            dojo.xhrGet({
                url: urlDeleteActivity,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        //------------------------------------------------------
                        var ts = Number(new Date());
                        var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlVoucherActivity+voucherID+'/'+ts  });
                        gridActivity.setStore(jsonStore,{'mac':'*'},{ignoreCase: true});
                        //---------------------------------------------------
                        dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'VoucherView','phrase':"Delete Activity records Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
            });

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'VoucherView','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


    function change_private_attribute(changeData){

        var dlgEdit  = new dijit.Dialog({
                title: tr.tr({'module': 'VoucherView','phrase':"Edit Private Attribute",'lang':l})+' '+changeData.attribute,
                style: "width: 420px"
        });

        var frmEdit   = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
                    hiddenId.type   = "hidden";
                    hiddenId.name   = "id";
                    hiddenId.value  = changeData.attr_id;
                dojo.place(hiddenId,frmEdit.domNode);
       

                components.QElements.addComboBox({ label:tr.tr({'module': 'VoucherView','phrase':"Operator",'lang':l}),data:data_op, divToAdd: frmEdit.domNode,inpName:'op',inpRequired:true, isLast:false,searchAttr:'name',value: changeData.op});
                components.QElements.addPair({label:tr.tr({'module': 'VoucherView','phrase':"Value",'lang':l}), divToAdd: frmEdit.domNode,inpName:'value', inpRequired:true, isLast:true,value: changeData.value});

                var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'VoucherView','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnEdit.domNode,frmEdit.domNode);


                dojo.connect(btnEdit,'onClick',function(){

                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlVoucherEditPrivate,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var ts = Number(new Date());
                                    var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlPrivateForVoucher+changeData.id+'/'+ts  });
                                    gridPrivate.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
                                    dlgEdit.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'VoucherView','phrase':"Attribute changed",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'VoucherView','phrase':"Problems changing attribute",'lang':l})+'</b>','message',components.Const.toasterError);
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


    function detailProfile(divParent,id){

        console.log('Profile Detail');

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActVoucherProfile,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cvv[action_item.action],Id:id});
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
                            { field: "profile", name: tr.tr({'module': 'VoucherView','phrase':"Profile",'lang':l}), width: 'auto' },
                            { field: "name",    name: tr.tr({'module': 'VoucherView','phrase':"Attribute",'lang':l}), width: 'auto' },
                            { field: "type",    name: tr.tr({'module': 'VoucherView','phrase':"Check/Reply",'lang':l}), width: 'auto',formatter: formatCheckReply },
                            { field: "op",      name: tr.tr({'module': 'VoucherView','phrase':"Operator",'lang':l}), width: 'auto' },
                            { field: "value",   name: tr.tr({'module': 'VoucherView','phrase':"Value",'lang':l}), width:'auto',formatter: formatBold}
                        ];

                    gridProfile = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(gridProfile,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'VoucherView','phrase':"Result count",'lang':l})+": </b>"+ gridProfile.rowCount;
                        })

                  dojo.addClass(gridProfile.domNode,'divGrid');
                  dojo.place(gridProfile.domNode,cpExp.domNode);
                  gridProfile.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlProfileForVoucher+id+'/'+ts });
                  gridProfile.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);

    }

    function detailPrivate(divParent,id){

        console.log('Profile Detail');

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActVoucherPrivate,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cvv[action_item.action],Id:id});
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
                            { field: "name",    name: tr.tr({'module': 'VoucherView','phrase':"Attribute",'lang':l}), width: 'auto' },
                            { field: "type",    name: tr.tr({'module': 'VoucherView','phrase':"Check/Reply",'lang':l}), width: 'auto',formatter: formatCheckReply },
                            { field: "op",      name: tr.tr({'module': 'VoucherView','phrase':"Operator",'lang':l}), width: 'auto' },
                            { field: "value",   name: tr.tr({'module': 'VoucherView','phrase':"Value",'lang':l}), width:'auto',formatter: formatBold}
                        ];

                    gridPrivate = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(gridPrivate,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'VoucherView','phrase':"Result count",'lang':l})+": </b>"+ gridPrivate.rowCount;
                        })

                  dojo.addClass(gridPrivate.domNode,'divGrid');
                  dojo.place(gridPrivate.domNode,cpExp.domNode);
                  gridPrivate.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlPrivateForVoucher+id+'/'+ts  });
                  gridPrivate.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);

    }


     function detailActivity(divParent){

        console.log('Activity Detail');

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActVoucherActivity,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cvv[action_item.action],Id:voucherID});
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
                            { field: "mac",         name: tr.tr({'module': 'VoucherView','phrase':"MAC",'lang':l}),        width:'auto'},
                            { field: "ip",          name: tr.tr({'module': 'VoucherView','phrase':"IP",'lang':l}),         width:'auto'},
                            { field: "start_time",  name: tr.tr({'module': 'VoucherView','phrase':"Started",'lang':l}),    width:'auto'},
                            { field: "stop_time",   name: tr.tr({'module': 'VoucherView','phrase':"Stoped",'lang':l}),     width:'auto',formatter: formatCheckForNull},
                            { field: "duration",    name: tr.tr({'module': 'VoucherView','phrase':"Duration",'lang':l}),   width:'auto',formatter: formatBold},
                            { field: "bytes_tx",    name: tr.tr({'module': 'VoucherView','phrase':"Data TX",'lang':l}),    width:'auto',formatter: formatOctets},
                            { field: "bytes_rx",    name: tr.tr({'module': 'VoucherView','phrase':"Data RX",'lang':l}),    width:'auto',formatter: formatOctets},
                            { field: "bytes_total", name: tr.tr({'module': 'VoucherView','phrase':"Data Total",'lang':l}), width:'auto',formatter: formatOctets}
                        ];

                    gridActivity = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(gridActivity,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'VoucherView','phrase':"Result count",'lang':l})+": </b>"+ gridActivity.rowCount;
                        })

                  dojo.addClass(gridActivity.domNode,'divGrid');
                  dojo.place(gridActivity.domNode,cpExp.domNode);
                  gridActivity.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlVoucherActivity+voucherID+'/'+ts  });
                  gridActivity.setStore(jsonStore,{'mac':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);
    }

     //Formatter to display values
    function formatCheckReply(value){
        if(value == 'Check'){
            return "<div style='width:100%; height:100%; background-color:#fbdeb9; '><b>"+tr.tr({'module': 'VoucherView','phrase':"Check",'lang':l})+"</b></div>";
        }
        if(value == 'Reply'){
            return "<div style='width:100%; height:100%; background-color:#b9e8fb; '><b>"+tr.tr({'module': 'VoucherView','phrase':"Reply",'lang':l})+"</b></div>";
        }
    }

    function formatBold(value){
        return "<div style='width:100%; height:100%;'><b>"+value+"</b></div>";
    }

    function formatOctets(value){
        var format_bytes = components.Formatters.numToBytes(value);
        return "<div style='width:100%; height:100%;'><b>"+format_bytes+"</b></div>";
    }

    function formatCheckForNull(value){

        if(value == null){

            return "<div style='width:100%; height:100%;background-color:#a5e1af; '><b>"+tr.tr({'module': 'VoucherView','phrase':"Still Active",'lang':l})+"</b></div>";
        }else{
            return value;
        }

    }

})();//(function(){

}
