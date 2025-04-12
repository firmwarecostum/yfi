/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource['content.Vouchers']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['content.Vouchers'] = true;
dojo.provide('content.Vouchers');

dojo.require('dojox.grid.DataGrid');
//dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('components.QElements');
dojo.require("dojox.data.QueryReadStore");
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var cv              = content.Vouchers;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var urlRealmList    = components.Const.cake+'realms/json_index_list';
    var urlProfileList  = components.Const.cake+'profiles/json_index';
    var urlActVouchers  = components.Const.cake+'vouchers/json_actions/';
    var urlVoucherAdd   = components.Const.cake+'vouchers/json_add/';
    var urlVoucherIndex = components.Const.cake+'vouchers/json_index/';
    var urlRemove       = components.Const.cake+'vouchers/json_del/';
    var urlPdfFormats   = components.Const.cake+'vouchers/json_pdf_format_list/';
    var urlPDF          = components.Const.cake+'vouchers/pdf/';
    var urlCSV          = components.Const.cake+'vouchers/csv/';
    var urlLanguages    = components.Const.cake+'users/json_languages';
    
    var grid;
    var time            = 'past_week'    //Can be any_time, past_hour, past_day, past_week, past_month
    var query           = {'username':'*','time':time};


    cv.create=function(divParent){

        console.log('Voucher List');
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
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cv[action_item.action],Id:null});
                            });
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
            dojo.place(divActions,divGridAction);
            //-----------------------------------------------------------

            //--------Time Limit------------------------------------------
            var spanTime  = document.createElement('span');
            spanTime.innerHTML = '<b>'+tr.tr({'module': 'Vouchers','phrase':"Created",'lang':l})+'</b>';
            dojo.place(spanTime,divGridAction);

                var dTime = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'any_time',  label: tr.tr({'module': 'Vouchers','phrase':"Any time",'lang':l}),selected:'selected' },
                                { id : 'past_hour', label: tr.tr({'module': 'Vouchers','phrase':"Past hour",'lang':l})},
                                { id : 'past_day',  label: tr.tr({'module': 'Vouchers','phrase':"Past day",'lang':l}) },
                                { id : 'past_week', label: tr.tr({'module': 'Vouchers','phrase':"Past week",'lang':l}) },
                                { id : 'past_month',label: tr.tr({'module': 'Vouchers','phrase':"Past month",'lang':l}) }
                                ]}};
            var myTstore =new dojo.data.ItemFileReadStore(dTime);
            var filteringTime = new dijit.form.FilteringSelect({
                                                                    value   :"past_week",
                                                                    id      :"contentListVoucherTime",
                                                                    name    :"state", 
                                                                    searchAttr: "name",
                                                                    store   :myTstore,
                                                                    searchAttr  :"label",
                                                                    style: "width: 140px;"}, document.createElement("div"));
            dojo.place(filteringTime.domNode,divGridAction);
            dojo.connect(filteringTime,'onChange',function(value){
                query.time = value;
                dijit.byId('contentVouchersViewGrid').setQuery(query);
            });
            //------------------------------------------------------------


            //-------------------Filter + Refresh------------------------
            var filter = document.createElement('span');
            filter.innerHTML ='<b>'+tr.tr({'module': 'Vouchers','phrase':"Filter",'lang':l})+'</b>';
            dojo.place(filter, divGridAction);
            var t = new dijit.form.TextBox({name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(t,'onKeyUp',function(e){
                    var filterOn = dijit.byId("contentListVoucherSelect").attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = t.attr('value');
                    var time = query.time;
                    query = {'username' : val+'*'};
                    if(filterOn == 'password'){
                       query = {'password' : val+'*'};
                    }
                    if(filterOn == 'profile'){
                       query = {'profile' : val+'*'};
                    }
                    if(filterOn == 'creator'){
                       query = {'creator' : val+'*'};
                    }
                    if(filterOn == 'realm'){
                       query = {'realm' : val+'*'};
                    }
                    if(filterOn == 'status'){
                       query = {'status' : val+'*'};
                    }
                    //Add time again to the query
                    query.time = time;                    
                    dijit.byId('contentVouchersViewGrid').setQuery(query);
            });


            dojo.place(t.domNode, divGridAction);

            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'Vouchers','phrase':"Field",'lang':l})+'</b>';
            dojo.place(spanField,divGridAction);

                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'username',  label: tr.tr({'module': 'Vouchers','phrase':"Voucher",'lang':l}),selected:'selected' },
                                { id : 'password',  label: tr.tr({'module': 'Vouchers','phrase':"Password/Code",'lang':l})},
                                { id : 'profile',   label: tr.tr({'module': 'Vouchers','phrase':"Profile",'lang':l}) },
                                { id : 'creator',   label: tr.tr({'module': 'Vouchers','phrase':"Creator",'lang':l}) },
                                { id : 'realm',     label: tr.tr({'module': 'Vouchers','phrase':"Realm",'lang':l}) }
                                ]}};
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            var filteringSelect = new dijit.form.FilteringSelect({
                                                                    value   :"username",
                                                                    id      :"contentListVoucherSelect",
                                                                    name    :"state", 
                                                                    searchAttr: "name",
                                                                    store   :myNewStore,
                                                                    searchAttr  :"label",
                                                                    style: "width: 140px;"}, document.createElement("div"));

            dojo.place(filteringSelect.domNode,divGridAction);
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
                            { field: "username",name: tr.tr({'module': 'Vouchers','phrase':"Voucher",'lang':l}), width: 'auto' },
                            { field: "password",name: tr.tr({'module': 'Vouchers','phrase':"Password/Code",'lang':l}), width: 'auto' },
                            { field: "profile", name: tr.tr({'module': 'Vouchers','phrase':"Profile",'lang':l}), width: 'auto' },
                            { field: "creator", name: tr.tr({'module': 'Vouchers','phrase':"Creator",'lang':l}), width: 'auto' },
                            { field: "realm",   name: tr.tr({'module': 'Vouchers','phrase':"Realm",'lang':l}), width: 'auto' },
                            { field: "created", name: tr.tr({'module': 'Vouchers','phrase':"Created",'lang':l}), width: 'auto' },
                            { field: "status",  name: tr.tr({'module': 'Vouchers','phrase':"Status",'lang':l}), formatter: formatStatus, width: '100px', sortDesc: true }
                        ];

                grid = new dojox.grid.DataGrid({
                                id: 'contentVouchersViewGrid',
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     //dojo.connect(grid,'updateRowCount', function(){
                     //        divResults.innerHTML = "<b>"+tr.tr({'module': 'Vouchers','phrase':"Result count",'lang':l})+": </b>"+ dijit.byId('contentVouchersViewGrid').rowCount;
                     //   });
                    dojo.connect(grid, '_onFetchComplete', function(){
                        divResults.innerHTML = "<b>"+tr.tr({'module': 'Vouchers','phrase':"Result count",'lang':l})+": </b>"+ grid.attr("rowCount");
                    });


                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojox.data.QueryReadStore({ url: urlVoucherIndex+ts });
                  dijit.byId('contentVouchersViewGrid').setStore(jsonStore,query,{ignoreCase: true});
            //---- END Grid----------------
        },100);


    }

    cv.reload  = function(){
        var ts          = Number(new Date());
        var jsonStore   = new dojox.data.QueryReadStore({ url: urlVoucherIndex+ts });
        dijit.byId('contentVouchersViewGrid').setStore(jsonStore,query,{ignoreCase: true});
    }

    cv.test_radius = function(){

        var items = dijit.byId('contentVouchersViewGrid').selection.getSelected();
        if(items.length){
            dojo.forEach(
            items,
            function(selectedItem) {
                if(selectedItem !== null) {
                    var id = dijit.byId('contentVouchersViewGrid').store.getValue(selectedItem,'id');
                    dojo.require("content.RadiusTest");
                    dojo.addOnLoad(function(){
                        content.RadiusTest.testVoucherAuth('voucher',id);
                    });
                }
            });
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Vouchers','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cv.add      = function(){
        console.log('Add Voucher');
       
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'Vouchers','phrase':"New Voucher",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());

                components.QElements.addPair({          label:tr.tr({'module': 'Vouchers','phrase':"Precede String",'lang':l}),divToAdd: frmAdd.domNode,inpName:'precede',inpRequired:false, isLast:false});
                components.QElements.addComboBox({      label:tr.tr({'module': 'Vouchers','phrase':"Realm",'lang':l}),url:urlRealmList, divToAdd: frmAdd.domNode,inpName:'realm',inpRequired:true, isLast:false,searchAttr: 'name'});
                components.QElements.addComboBox({      label:tr.tr({'module': 'Vouchers','phrase':"Profile",'lang':l}),url:urlProfileList, divToAdd: frmAdd.domNode,inpName:'profile',inpRequired:true, isLast:false,searchAttr:'name'});

                //-----------------Special Add IN To explain better----
                    var lbl =document.createElement('label');
                        var txt=document.createTextNode(tr.tr({'module': 'Vouchers','phrase':"Valid for",'lang':l}));
                    lbl.appendChild(txt);
                dojo.place(lbl,frmAdd.domNode);

                //Change the label class if not required
                dojo.addClass(lbl, "frmRequired");

                    var inpNumber = new dijit.form.NumberSpinner({
                                    style: 'width 50px',
                                    name: 'valid_for',
                                    intermediateChanges: true,
                                    value: 1,
                                    smallDelta: 1,
                                    intermediateChanges: true,
                                    constraints: { min:0, max:120, places:0 }
                            }, document.createElement("div") );
                dojo.place(inpNumber.domNode,frmAdd.domNode);

                    dojo.connect(inpNumber,'onChange',function(){ 
                        var v = inpNumber.getValue();
                        if(v >= 2){
                            tail.innerHTML ='<b> '+tr.tr({'module': 'Vouchers','phrase':"days from first log-in",'lang':l})+'</b>';
                        }else{
                            tail.innerHTML ='<b> '+tr.tr({'module': 'Vouchers','phrase':"day from first log-in",'lang':l})+'</b>';
                        }
                    });

                    var tail = document.createElement('span');
                    tail.innerHTML ='<b> '+tr.tr({'module': 'Vouchers','phrase':"day from first log-in",'lang':l})+'</b>';
                dojo.place(tail, frmAdd.domNode);

                    var br1=document.createElement('br');
                    br1.clear = 'all';
                dojo.place(br1,frmAdd.domNode);
                //--------------END Special Add IN-------

                components.QElements.addCheckPair({label:tr.tr({'module': 'Vouchers','phrase':"Never expire",'lang':l}),divToAdd: frmAdd.domNode,inpName:'never_expire', inpRequired:true,checked: 'checked',value: 'on',isLast: false});

                components.QElements.addDateTextBox({   label:tr.tr({'module': 'Vouchers','phrase':"Expiry date",'lang':l}),divToAdd: frmAdd.domNode,inpName:'expire_on',inpRequired:true,isLast:true,inpRequired:true});

                var widgets = dijit.findWidgets(frmAdd.domNode);
                var never_expire;
                var expire_on;
                dojo.forEach(widgets, function(w) {
                 //   console.log("Found Widget");  
                 //   console.log(w.get('name'));
                    if(w.get('name') == 'expire_on'){
                        expire_on = w;
                    }
                    if(w.get('name') == 'never_expire'){
                        never_expire = w
                    }
                    //We look for the 'never_expire' check box
                });
                expire_on.set('disabled', true);
                dojo.connect(never_expire,'onChange',function(a){
                    if(a){
                        expire_on.set('disabled', true);
                    }else{
                        expire_on.set('disabled', false);
                    }
                })


                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Vouchers','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                    
                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlVoucherAdd,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    cv.reload();
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Vouchers','phrase':"New voucher created OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Vouchers','phrase':"Problems creating voucher",'lang':l})+'</b>','message',components.Const.toasterError);
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

    cv.del      = function(){
        console.log('Delete Vouchers');
        var items = dijit.byId('contentVouchersViewGrid').selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cv.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Vouchers','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cv.del_confirm   = function(){

        var items = dijit.byId('contentVouchersViewGrid').selection.getSelected();
        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Vouchers','phrase':"Removing Vouchers",'lang':l})+'</b>','message',components.Const.toasterInfo);
        var itemList =[];
        dojo.forEach(
            items,
            function(selectedItem) {
                if(selectedItem !== null) {
                    var id = dijit.byId('contentVouchersViewGrid').store.getValue(selectedItem,'id');
                    itemList.push(id);
                }
            });
        cv.doSelectionRemove(itemList);
    }

    cv.doSelectionRemove    = function(itemList){

         dojo.xhrGet({
                url: urlRemove,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        //------------------------------------------------------
                        cv.reload();
                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Vouchers','phrase':"Voucher(s) Removed OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                        //---------------------------------------------------
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cv.edit      = function(){
        console.log('Edit Voucher');
        var items = dijit.byId('contentVouchersViewGrid').selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = dijit.byId('contentVouchersViewGrid').store.getValue(selectedItem,'id');
                                var username    = dijit.byId('contentVouchersViewGrid').store.getValue(selectedItem,'username');
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Vouchers','phrase':"Opening detail for",'lang':l})+' '+username+'</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/VoucherView", [id,username]);
                                console.log("Voucher with id "+id+" selected");
                            }
                        });
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Vouchers','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


    function formatStatus(value){
        if(value == this.value){
            return value;
        }
        switch(value){
            case 'new':
                return "<div style='widgth:100%; height:100%; background-color:#c2e5c8'><b>"+tr.tr({'module': 'Vouchers','phrase':"new",'lang':l})+"</b></div>";
            case 'used':
                return "<div style='widgth:100%; height:100%; background-color:#b9e8fb;'><b>"+tr.tr({'module': 'Vouchers','phrase':"used",'lang':l})+"</b></div>";
            case 'depleted':
                return "<div style='widgth:100%; height:100%; background-color:#fbdeb9;'><b>"+tr.tr({'module': 'Vouchers','phrase':"depleted",'lang':l})+"</b></div>";
        }
    }

    cv.pdf  = function(){

        console.log("Generating PDF");
        var items = grid.selection.getSelected();
        if(items.length){
            var itemList =[];
            dojo.forEach(
                items,
                function(selectedItem) {
                    if(selectedItem !== null) {
                        var id = dijit.byId('contentVouchersViewGrid').store.getValue(selectedItem,'id');
                        itemList.push(id);
                    }
                });
            pdfCreation(itemList);
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Vouchers','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cv.csv  = function(){

        console.log("Exporting CSV");
        var items = grid.selection.getSelected();
        if(items.length){
            var itemList =[];
            dojo.forEach(
                items,
                function(selectedItem) {
                    if(selectedItem !== null) {
                        var id = dijit.byId('contentVouchersViewGrid').store.getValue(selectedItem,'id');
                        itemList.push(id);
                    }
                });
            var selectString  = dojo.objectToQuery(itemList);
            window.open(urlCSV+'?'+selectString);
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Vouchers','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    function pdfCreation(items){

         var dlgPdf  = new dijit.Dialog({
                title: tr.tr({'module': 'Vouchers','phrase':"Select Format",'lang':l}),
                style: "width: 420px"
        });

            var frmPdf    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());
                components.QElements.addComboBox({  label:tr.tr({'module': 'Vouchers','phrase':"PDF Output Format",'lang':l}),  url:urlPdfFormats, divToAdd: frmPdf.domNode,inpName:'pdf_format',inpRequired:true, isLast:false,searchAttr: 'name', value:'generic'});
                components.QElements.addComboBox({ label:tr.tr({'module': 'Vouchers','phrase':"Language",'lang':l}),url:urlLanguages, divToAdd: frmPdf.domNode,inpName:'language',inpRequired:true, isLast:true,searchAttr: 'name', value: components.LoginLight.UserInfo.User.language_id});
                var btnOk = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Vouchers','phrase':"OK",'lang':l}),iconClass:"okIcon"},document.createElement("div"));
                dojo.place(btnOk.domNode,frmPdf.domNode);

                dojo.connect(btnOk, 'onClick', function(){
                    console.log('Generate PDF');
                    //===================================
                    var frmQuery      = dojo.formToQuery(frmPdf.domNode); //Convert the Form to an object
                    var selectString  = dojo.objectToQuery(items);
                    window.open(urlPDF+'?'+frmQuery+'&'+selectString);
                    dlgPdf.destroyRecursive(false); //Destroy the dialog
                    //===========================================
                });

        dlgPdf.attr('content',frmPdf);
        dlgPdf.show();
    }

})();//(function(){

}
