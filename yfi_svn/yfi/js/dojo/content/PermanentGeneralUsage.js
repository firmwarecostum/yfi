/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.PermanentGeneralUsage"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PermanentGeneralUsage"] = true;

dojo.provide('content.PermanentGeneralUsage');
dojo.require('components.Formatters');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('components.Translator');

(function(){
    var cpgu                    = content.PermanentGeneralUsage;
    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var grid;
    var userID;

    var urlUserUsage            = components.Const.cake+'permanent_users/json_usage/';
    var urlActUserExtras        = components.Const.cake+'extras/json_actions_permanent_user/';
    var urlUserChangeProfile    = components.Const.cake+'permanent_users/json_change_profile/';
    var urlProfileList          = components.Const.cake+'profiles/json_index';

    cpgu.create   = function(divParent,id){

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
                                components.QElements.addAction({Name:action_item.name,Type:action_item.type,Parent: divActions,Action:cpgu[action_item.action],Id:userID});
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
                            { field: "start",       name: tr.tr({'module': 'PermanentGeneralUsage','phrase':"Start date",'lang':l}), width:'auto'},
                            { field: "end",         name: tr.tr({'module': 'PermanentGeneralUsage','phrase':"End date",'lang':l}),   width:'auto'},
                            { field: "extra_time",  name: tr.tr({'module': 'PermanentGeneralUsage','phrase':"Extra time",'lang':l}), width:'auto',formatter: components.Formatters.Bold},
                            { field: "extra_data",  name: tr.tr({'module': 'PermanentGeneralUsage','phrase':"Extra data",'lang':l}), width:'auto',formatter: components.Formatters.FormatOctets},
                            { field: "time_used",   name: tr.tr({'module': 'PermanentGeneralUsage','phrase':"Time Used",'lang':l}),  width:'auto',formatter: formatTimeUsed},
                            { field: "time_avail",  name: tr.tr({'module': 'PermanentGeneralUsage','phrase':"Time Avail",'lang':l}), width:'auto',formatter: formatTimeAvail},
                            { field: "data_used",   name: tr.tr({'module': 'PermanentGeneralUsage','phrase':"Data Used",'lang':l}),  width:'auto',formatter: formatDataUsed},
                            { field: "data_avail",  name: tr.tr({'module': 'PermanentGeneralUsage','phrase':"Data Avail",'lang':l}), width:'auto',formatter: formatDataAvail},
                        ];

                    grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                             divResults.innerHTML = "<b>"+tr.tr({'module': 'PermanentGeneralUsage','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  var jsonStore = new dojo.data.ItemFileReadStore({ url: urlUserUsage+userID+'/?'+ts  });
                  grid.setStore(jsonStore,{'start':'*'},{ignoreCase: true});
            //---- END Grid----------------
        },100);
    }

    cpgu.reload     = function(){
        console.log("Reload Activity");
        var ts = Number(new Date());
        var jsonStore = new dojo.data.ItemFileReadStore({ url: urlUserUsage+userID+'/?'+ts  });
        grid.setStore(jsonStore,{'start':'*'},{ignoreCase: true});
    }

    cpgu.edit_profile    = function(){

        console.log("User ID is "+userID);
        var dlgEdit  = new dijit.Dialog({
                title: tr.tr({'module': 'UserViewProfile','phrase':"Change Profile",'lang':l}),
                style: "width: 420px"
        });
        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

                var hiddenId    = document.createElement("input");  //Hidden element containing the Repository ID
                    hiddenId.type   = "hidden";
                    hiddenId.name   = "id";
                    hiddenId.value  = userID;
                dojo.place(hiddenId,frmEdit.domNode);

                components.QElements.addComboBox({      label:tr.tr({'module': 'UserViewProfile','phrase':"Profile",'lang':l}),url:urlProfileList, divToAdd: frmEdit.domNode,inpName:'profile',inpRequired:true, isLast:true,searchAttr:'name'});
                var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'UserViewProfile','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
                dojo.place(btnEdit.domNode,frmEdit.domNode);

                dojo.connect(btnEdit,'onClick',function(){

                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlUserChangeProfile,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    var ts = Number(new Date());
                                    var jsonStore = new dojo.data.ItemFileWriteStore({ url: urlProfileForUser+userID+'/'+ts });  //Reload the latest changed profile
                                    gridProfile.setStore(jsonStore,{'name':'*'},{ignoreCase: true});
                                    dlgEdit.destroyRecursive(false); //Destroy the dialog
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewProfile','phrase':"Profile Changed",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'UserViewProfile','phrase':"Problems changing profile",'lang':l})+'</b>','message',components.Const.toasterError);
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

