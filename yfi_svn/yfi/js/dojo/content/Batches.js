/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource['content.Batches']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['content.Batches'] = true;
dojo.provide('content.Batches');

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require('components.QElements');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var cb              = content.Batches;
    var urlRealmList    = components.Const.cake+'realms/json_index_list';
    var urlProfileList  = components.Const.cake+'profiles/json_index';
    var urlActBatches   = components.Const.cake+'batches/json_actions/';
    var urlBatchAdd     = components.Const.cake+'vouchers/json_add_batch/';
    var urlBatchIndex   = components.Const.cake+'batches/json_index/';
    var urlRemove       = components.Const.cake+'batches/json_del/';
    var urlPdfFormats   = components.Const.cake+'vouchers/json_pdf_format_list/';
    var urlPDF          = components.Const.cake+'batches/pdf/';
    var urlCSV          = components.Const.cake+'batches/csv/';
    var urlLanguages    = components.Const.cake+'users/json_languages';

    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var grid;
    var query           = {'name':'*'};

    cb.create=function(divParent){

        console.log('Batches List');
        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            dojo.xhrGet({
                url: urlActBatches,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dojo.forEach(response.items, function(action_item){
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cb[action_item.action],Id:null});
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
            filter.innerHTML ='<b>'+tr.tr({'module': 'Batches','phrase':"Filter",'lang':l})+'</b>';
            dojo.place(filter, divGridAction);
            var t = new dijit.form.TextBox({id:'contentListBatchFilter',name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(t,'onKeyUp',function(e){
                    var filterOn = filteringSelect.attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = t.attr('value');

                    query = {'name' : val+'*'};
                    if(filterOn == 'name'){
                       query = {'name' : val+'*'};
                    }
                    if(filterOn == 'realm'){
                       query = {'realm' : val+'*'};
                    }
                    if(filterOn == 'size'){
                       query = {'size' : val+'*'};
                    }
                    if(filterOn == 'created'){
                       query = {'created' : val+'*'};
                    }
                    dijit.byId('contentBatchesViewGrid').setQuery(query);
            });


            dojo.place(t.domNode, divGridAction);

            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'Batches','phrase':"Field",'lang':l})+'</b>';
            dojo.place(spanField,divGridAction);

                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'name', label: tr.tr({'module': 'Batches','phrase':"Name",'lang':l}),selected:'selected' },
                                { id : 'realm', label: tr.tr({'module': 'Batches','phrase':"Realm",'lang':l}) },
                                { id : 'size', label: tr.tr({'module': 'Batches','phrase':"Size",'lang':l}) },
                                { id : 'created', label: tr.tr({'module': 'Batches','phrase':"Created",'lang':l}) }
                                ]}};
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            var filteringSelect = new dijit.form.FilteringSelect({
                                                                    value   :"name",
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
                            { field: "name", name: tr.tr({'module': 'Batches','phrase':"Batch Name",'lang':l}), width: 'auto' },
                            { field: "realm", name: tr.tr({'module': 'Batches','phrase':"Realm",'lang':l}), width: 'auto' },
                            { field: "size", name: tr.tr({'module': 'Batches','phrase':"Size",'lang':l}), width: 'auto' },
                            { field: "created", name: tr.tr({'module': 'Batches','phrase':"Created",'lang':l}), width: 'auto' }
                        ];

                    grid = new dojox.grid.DataGrid({
                                id: 'contentBatchesViewGrid',
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));
                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  dojo.connect(grid,'_onFetchComplete', function(){

                        divResults.innerHTML = "<b>"+tr.tr({'module': 'Batches','phrase':"Result count",'lang':l})+": </b>"+ dijit.byId('contentBatchesViewGrid').rowCount;
                  })

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlBatchIndex+ts });
                  dijit.byId('contentBatchesViewGrid').setStore(jsonStore,query,{ignoreCase: true});
            //---- END Grid----------------
        },100);

    }

     cb.reload  = function(){
        var ts          = Number(new Date());
        var jsonStore   = new dojo.data.ItemFileWriteStore({ url: urlBatchIndex+ts });
        dijit.byId('contentBatchesViewGrid').setStore(jsonStore,query,{ignoreCase: true});
    }


    cb.add      = function(){
        console.log('Add Batch');
       
        var dlgAdd  = new dijit.Dialog({
                title: tr.tr({'module': 'Batches','phrase':"New Batch of Vouchers",'lang':l}),
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var ts = Number(new Date());
                components.QElements.addPair({          label:tr.tr({'module': 'Batches','phrase':"Name",'lang':l}),divToAdd: frmAdd.domNode,inpName:'name',inpRequired:true, isLast:false});
                components.QElements.addNumberSpinner({ label:tr.tr({'module': 'Batches','phrase':"Batch Size",'lang':l}),valShow:2,min:2,max:120,divToAdd: frmAdd.domNode,inpName:'size',isLast:false,inpRequired:true});
                components.QElements.addPair({          label:tr.tr({'module': 'Batches','phrase':"Precede String",'lang':l}),divToAdd: frmAdd.domNode,inpName:'precede',inpRequired:false, isLast:false});
                components.QElements.addComboBox({      label:tr.tr({'module': 'Batches','phrase':"Realm",'lang':l}),url:urlRealmList, divToAdd: frmAdd.domNode,inpName:'realm',inpRequired:true, isLast:false,searchAttr: 'name'});
                components.QElements.addComboBox({      label:tr.tr({'module': 'Batches','phrase':"Profile",'lang':l}),url:urlProfileList, divToAdd: frmAdd.domNode,inpName:'profile',inpRequired:true, isLast:false,searchAttr:'name'});

                //-----------------Special Add IN To explain better----
                    var lbl =document.createElement('label');
                        var txt=document.createTextNode(tr.tr({'module': 'Batches','phrase':"Valid for",'lang':l}));
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
                            tail.innerHTML ='<b> '+tr.tr({'module': 'Batches','phrase':"days from first log-in",'lang':l})+'</b>';
                        }else{
                            tail.innerHTML ='<b> '+tr.tr({'module': 'Batches','phrase':"day from first log-in",'lang':l})+'</b>';
                        }
                    });

                    var tail = document.createElement('span');
                    tail.innerHTML ='<b> '+tr.tr({'module': 'Batches','phrase':"day from first log-in",'lang':l})+'</b>';
                dojo.place(tail, frmAdd.domNode);

                    var br1=document.createElement('br');
                    br1.clear = 'all';
                dojo.place(br1,frmAdd.domNode);
                //--------------END Special Add IN-------

                components.QElements.addCheckPair({label:tr.tr({'module': 'Batches','phrase':"Never expire",'lang':l}),divToAdd: frmAdd.domNode,inpName:'never_expire', inpRequired:true,checked: 'checked',value: 'on',isLast: false});

                components.QElements.addDateTextBox({   label:tr.tr({'module': 'Batches','phrase':"Expiry date",'lang':l}),divToAdd: frmAdd.domNode,inpName:'expire_on',inpRequired:true,isLast:true,inpRequired:true});

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


                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'Batches','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                    
                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlBatchAdd,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                   var newItem  = dijit.byId('contentBatchesViewGrid').store.newItem({
                                            id          : response.batch.id,
                                            name        : response.batch.name,
                                            realm       : response.batch.realm,
                                            size        : response.batch.size,
                                            created     : response.batch.created
                                    });
                                    dijit.byId('contentBatchesViewGrid').store.save();
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Batches','phrase':"New batch created OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Batches','phrase':"Problems creating batch",'lang':l})+'</b>','message',components.Const.toasterError);
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

    cb.del      = function(){
        console.log('Delete Batches');
        var items = dijit.byId('contentBatchesViewGrid').selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cb.del_confirm);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Batches','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


    cb.del_confirm   = function(){
        var items = dijit.byId('contentBatchesViewGrid').selection.getSelected();
        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Batches','phrase':"Removing Batches",'lang':l})+'</b>','message',components.Const.toasterInfo);
        var itemList =[];
        dojo.forEach(
            items,
            function(selectedItem) {
                if(selectedItem !== null) {
                    var id = dijit.byId('contentBatchesViewGrid').store.getValue(selectedItem,'id');
                    itemList.push(id);
                }
            });
        cb.doSelectionRemove(itemList);
    }

     cb.doSelectionRemove    = function(itemList){

         dojo.xhrGet({
                url: urlRemove,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){
                        //------------------------------------------------------
                        var items = dijit.byId('contentBatchesViewGrid').selection.getSelected();
                        dojo.forEach(items, function(selectedItem){
                            if(selectedItem !== null){
                                dijit.byId('contentBatchesViewGrid').store.deleteItem(selectedItem);
                                dijit.byId('contentBatchesViewGrid').store.save();
                            }
                        });
                        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Batches','phrase':"Batch(s) Removed OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                        //---------------------------------------------------
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

     cb.edit      = function(){
        console.log('Edit Batch');
        var items = dijit.byId('contentBatchesViewGrid').selection.getSelected();
        if(items.length){
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id      = dijit.byId('contentBatchesViewGrid').store.getValue(selectedItem,'id');
                                var name    = dijit.byId('contentBatchesViewGrid').store.getValue(selectedItem,'name');
                                dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Batches','phrase':"Opening detail for",'lang':l})+' '+name+'</b>','message',components.Const.toasterInfo);
                                dojo.publish("/actions/BatchView", [id,name]);
                                console.log("Batch with id "+id+" selected");
                            }
                        });
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Batches','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    
    cb.pdf  = function(){

        console.log("Generating PDF");
        var items = grid.selection.getSelected();
        if(items.length){
            var itemList =[];
            dojo.forEach(
                items,
                function(selectedItem) {
                    if(selectedItem !== null) {
                        var id = grid.store.getValue(selectedItem,'id');
                        itemList.push(id);
                    }
                });
            pdfCreation(itemList);
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Batches','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    function pdfCreation(items){

         var dlgPdf  = new dijit.Dialog({
                title: tr.tr({'module': 'Batches','phrase':"Select Format",'lang':l}),
                style: "width: 420px"
        });

            var frmPdf    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));
                var ts = Number(new Date());
                components.QElements.addComboBox({  label:tr.tr({'module': 'Batches','phrase':"PDF Output Format",'lang':l}),  url:urlPdfFormats, divToAdd: frmPdf.domNode,inpName:'pdf_format',inpRequired:true, isLast:false,searchAttr: 'name', value:'generic'});
                components.QElements.addComboBox({ label:tr.tr({'module': 'Batches','phrase':"Language",'lang':l}),url:urlLanguages, divToAdd: frmPdf.domNode,inpName:'language',inpRequired:true, isLast:true,searchAttr: 'name', value: components.LoginLight.UserInfo.User.language_id});
                var btnOk = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:'Ok',iconClass:"okIcon"},document.createElement("div"));
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


    cb.csv  = function(){

        console.log("Exporting CSV");
        var items = grid.selection.getSelected();
        if(items.length){
            var itemList =[];
            dojo.forEach(
                items,
                function(selectedItem) {
                    if(selectedItem !== null) {
                        var id = grid.store.getValue(selectedItem,'id');
                        itemList.push(id);
                    }
                });
            var selectString  = dojo.objectToQuery(itemList);
            window.open(urlCSV+'?'+selectString);
        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'Batches','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }



})();//(function(){

}
