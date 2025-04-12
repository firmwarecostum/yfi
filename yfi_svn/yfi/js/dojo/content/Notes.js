/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if(!dojo._hasResource['content.Notes']){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource['content.Notes'] = true;
dojo.provide('content.Notes');

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.QElements');
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');

(function(){

    var cn              = content.Notes;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var urlIndex        = components.Const.cake+'notes/json_index/';
    var urlAdd          = components.Const.cake+'notes/json_add/?';
    var urlDelete       = components.Const.cake+'notes/json_del/';
    var urlSectionList  = components.Const.cake+'notes/json_section_list/';

    var longTimeout     = components.Const.longTimeout;

    var query           = {'value':'*'};

    cn.create=function(divParent,id_tab){

        console.log('Notes Tab');

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

            //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");

                //Add the action stuff
                components.QElements.addAction({Name:tr.tr({'module': 'AutoSetup','phrase':"Reload List",'lang':l}),Type:'reload',Parent: divActions,Action:cn['reload'],Id:id_tab});
                components.QElements.addAction({Name:tr.tr({'module': 'AutoSetup','phrase':"Add",'lang':l}),Type:'add',Parent: divActions,Action:cn.add,Id:id_tab});
                components.QElements.addAction({Name:tr.tr({'module': 'AutoSetup','phrase':"Delete Selected",'lang':l}),Type:'delete',Parent: divActions,Action:cn.del,Id:id_tab})

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
                            { field: "section", name: tr.tr({'module': 'AutoSetup','phrase':"Section",'lang':l}), width: '80px',formatter: components.Formatters.Bold },
                            { field: "value",   name: tr.tr({'module': 'AutoSetup','phrase':"Note",'lang':l}), width: 'auto'},
                            { field: "date",    name: tr.tr({'module': 'AutoSetup','phrase':"Date",'lang':l}), width: '150px' }
                        ];

                var grid = new dojox.grid.DataGrid({
                                structure: layout,
                                id: id_tab.id+id_tab.tab,
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
                cn.reload(id_tab);
            //---- END Grid----------------
        },100);

    }

    cn.reload   = function(id_tab){

      
        console.log("Reload List for ",id_tab.id);
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlIndex+id_tab.id+'/?'+ts });
        dijit.byId(id_tab.id+id_tab.tab).setStore(jsonStore,query,{ignoreCase: true});
    }


    cn.add      = function(id_tab){
        console.log("Add Item");
        var users=[id_tab.id];
        _add(users,id_tab);

    }

    cn.add_to_list  = function(list){

        _add(list,'no_reload');
    }

    cn.del      = function(id_tab){
        console.log('Delete Note');
        var items = dijit.byId(id_tab.id+id_tab.tab).selection.getSelected();
        if(items.length){
            components.Common.dialogConfirm(cn.del_confirm,id_tab);
        }else{
            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AutoSetup','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }


    cn.del_confirm      = function(id_tab){
        cn.selectionWorker(tr.tr({'module': 'AutoSetup','phrase':'Deleting Note(s)','lang':l}),urlDelete,id_tab);
    }

    cn.selectionWorker     = function(message,url,id_tab){            //Takes a toaster message + an url to call with the list of selected users

        var grid    = dijit.byId(id_tab.id+id_tab.tab);
        var items   = grid.selection.getSelected();
        
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
            cn.doSelection(grid,message,url,itemList,id_tab);

        }else{

            dijit.byId('componentsMainToaster').setContent(tr.tr({'module': 'AutoSetup','phrase':'No Selection made','lang':l}),'error',components.Const.toasterError);
        }
    }

    cn.doSelection    = function(grid,message,urlToCall,itemList,id_tab){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        cn.reload(id_tab);
                        //---------------------------------------------------

                        dijit.byId('componentsMainToaster').setContent(message+' '+tr.tr({'module': 'AutoSetup','phrase':"Complete",'lang':l}),'message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    function _add(users,no_reload){
        console.log('Add Dialog');
        var heading = tr.tr({'module': 'AutoSetup','phrase':"New Note",'lang':l});

        var dlgAdd  = new dijit.Dialog({
                title: heading,
                style: "width: 420px"
        });
            var frmAdd    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                components.QElements.addComboBox({ label:tr.tr({'module': 'AutoSetup','phrase':"Section",'lang':l}),url:urlSectionList, divToAdd: frmAdd.domNode,inpName:'section',inpRequired:true, isLast:false,searchAttr:'name'});
                components.QElements.addTextArea({label:tr.tr({'module': 'AutoSetup','phrase':"Note",'lang':l}), divToAdd: frmAdd.domNode,inpName:'note', inpRequired:true, isLast:true});

                var btnAdd = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'AutoSetup','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnAdd.domNode,frmAdd.domNode);

                dojo.connect(btnAdd,'onClick',function(){

                   if(frmAdd.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmAdd.domNode); //Convert the Form to an object
                        var users_string ='';
                        var count = 0;
                        dojo.forEach(users, function(i){
                            users_string = users_string+count+'='+i+'&';
                            count++;
                        });

                        dojo.xhrPost({
                        url: urlAdd+users_string,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    if(no_reload != 'no_reload'){
                                        cn.reload(no_reload);
                                    }
                                    dlgAdd.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AutoSetup','phrase':"Note added",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                   
                                }else{
                                    
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'AutoSetup','phrase':"Problems adding note",'lang':l})+'</b>','message',components.Const.toasterError);
                                    
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

})();//(function(){

}
