/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.UserRights"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.UserRights"] = true;
dojo.provide("content.UserRights");

dojo.require('dijit.layout.ContentPane');
dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');

dojo.require('components.Const');
dojo.require('components.QElements');
dojo.require('components.Translator');

(function(){
    var cur                 = content.UserRights;
    var tr                  = components.Translator; 
    var l                   = components.LoginLight.UserInfo.l_iso;

    var urlUserRights       = components.Const.cake+'user_rights/json_rights_for/';
    var urlGroupRights      = components.Const.cake+'user_rights/json_default_group/';
    var urlRightsToggle     = components.Const.cake+'user_rights/json_toggle_rights/';
 
    cur.create              = function(divContainer,id){

        dojo.xhrGet({
            url: urlUserRights+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){

                    divContainer.innerHTML = '';
                    //------------------------------------------------------
                    for (category in response.rights) {
                        var r = response.rights[category];
                        cur.addCategory(id,divContainer,category,r);
                    }
                    //------------------------------------------------------
                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });

    }

    cur.addCategory         = function(id,divContainer,category,rights){

        var divRC;
        var divGridAction;

        divRC = document.createElement("div");
        dojo.addClass(divRC, 'divRightCategory');

            //--------------------Action Part --------------------
            divGridAction     = document.createElement('div');
            dojo.addClass(divGridAction, 'divGridAction');

                var divActions = document.createElement("div");
                dojo.addClass(divActions, "divActions");
                    components.QElements.addAction({Name:tr.tr({'module': 'UserRights','phrase':"Use default values",'lang':l}),      Type:'default', Parent: divActions,Action:cur.getDefault,Id:'contentAPRight_'+category+'_'+id });
                    components.QElements.addAction({Name:tr.tr({'module': 'UserRights','phrase':"Toggle state of selected",'lang':l}),Type:'toggle',  Parent: divActions,Action:cur.toggle    ,Id:'contentAPRight_'+category+'_'+id });
            dojo.place(divActions,divGridAction);

                var h =document.createElement("h2");
                h.innerHTML = category;
            dojo.place(h,divGridAction);
            //---------------------------------------

        dojo.place(divGridAction,divRC);

        //---------------------------------------
        setTimeout(function () {

            var right;

            //----Destroy any previous ones------
            if(dijit.byId('contentAPRight_'+category+'_'+id) != undefined){
                dijit.byId('contentAPRight_'+category+'_'+id).destroyDescendants(true);
                dijit.byId('contentAPRight_'+category+'_'+id).destroy(true);
            }

            //-----------------------------------
            
            var contentBox = dojo.contentBox(divRC);
            //console.log(contentBox);

            var hight = (contentBox.h-70)+'';
           
            var s = "height: "+hight+"px ; padding: 10px;";
            //console.log(s);

             var cpExp   =   new dijit.layout.ContentPane({
                                style:      s
                            },document.createElement("div"));
            dojo.place(cpExp.domNode,divRC);

            //----Grid Start----------------
            var layout = [
                { field: "name",        name: tr.tr({'module': 'UserRights','phrase':"Name",'lang':l}),           width: 'auto' },
                { field: "description", name: tr.tr({'module': 'UserRights','phrase':"Description",'lang':l}),    width: 'auto' },
                { field: "state",       name: tr.tr({'module': 'UserRights','phrase':"State",'lang':l}),          width: 'auto', formatter: formatState,sortDesc: true  }
            ];

            var grid = new dojox.grid.DataGrid({
                        id: 'contentAPRight_'+category+'_'+id,
                        structure: layout,
                        rowsPerPage: 40,
                        rowSelector: '10px'
            }, document.createElement("div"));
            dojo.addClass(grid.domNode,'divGrid');
            dojo.place(grid.domNode,cpExp.domNode);
            grid.startup();

            var itemList = [];
            for(right in rights){

                //console.log(rights[right]);
                itemList.push(rights[right]);
            }
            var data = {data: {
                            identifier : 'id',
                            label: 'name',
                            items : itemList }};

            var jsonStore=new dojo.data.ItemFileWriteStore(data);

            grid.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
            //---- END Grid----------------


            //=================================
            //Formatter to display values
            function formatState(value){
              
                switch(value){
                    case '1':
                        return "<div style='widgth:100%; height:100%; background-color:#c2e5c8;'><b>"+tr.tr({'module': 'UserRights','phrase':"Allow",'lang':l})+"</b></div>";
                    case '0':
                        return "<div style='widgth:100%; height:100%; background-color:#e5c2c2;'><b>"+tr.tr({'module': 'UserRights','phrase':"Deny",'lang':l})+"</b></div>";
                    case 1:
                        return "<div style='widgth:100%; height:100%; background-color:#c2e5c8;'><b>"+tr.tr({'module': 'UserRights','phrase':"Allow",'lang':l})+"</b></div>";
                    case 0:
                        return "<div style='widgth:100%; height:100%; background-color:#e5c2c2;'><b>"+tr.tr({'module': 'UserRights','phrase':"Deny",'lang':l})+"</b></div>";
                }
            }
            //===============================



        },10);//Perhaps this should be up again (was 100)

        dojo.place(divRC,divContainer);
    }


    cur.getDefault      = function(grid_name){

        console.log('Grab defaults for '+ grid_name);
        ////dijit.byId('componentsMainToaster').setContent('<h2>Reset the default rights</h2>','message',components.Const.toasterInfo); //Notify the use that we added it
        var ts = Number(new Date());
        var jsonStore=new dojo.data.ItemFileWriteStore({ url: urlGroupRights + grid_name +'/?'+ts });
        dijit.byId(grid_name).setStore(jsonStore,{'name':'*'},{ignoreCase: true});

    }

    cur.toggle          = function(grid_name){

        console.log('Toggle status on '+ grid_name);

        var items = dijit.byId(grid_name).selection.getSelected();

        if(items.length){
           //// dijit.byId('componentsMainToaster').setContent('Toggle User Right','message',components.Const.toasterInfo);
            var itemList =[];
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id = dijit.byId(grid_name).store.getValue(selectedItem,'id');
                                itemList.push(id);
                            }
                        });
            cur.doSelection(tr.tr({'module': 'UserRights','phrase':"Toggle UserRight",'lang':l}),urlRightsToggle,grid_name,itemList);

        }else{

            ////dijit.byId('componentsMainToaster').setContent('No Selection made','error',components.Const.toasterError);
        }
    }


    cur.doSelection    = function(message,urlToCall,grid_name,itemList){

         dojo.xhrGet({
                url: urlToCall+grid_name+'/',
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    console.log(response);
                    if(response.json.status == 'ok'){

                        //---------------------------------------------------
                        dojo.forEach(response.toggled,function(toggle){

                            dijit.byId(grid_name).store.fetchItemByIdentity({
                                identity:   toggle.id,
                                onItem :    function(item, request) {
                                                dijit.byId(grid_name).store.setValue(item,'state',toggle.state);
                                            }
                            });
                        });
                        //------------------------------------------------------
                        
                        
                        //dijit.byId('componentsMainToaster').setContent(message+' Complete','message',components.Const.toasterInfo);

                    };
                    if(response.json.status == 'error'){
                        //dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

})();//(function(){

}
