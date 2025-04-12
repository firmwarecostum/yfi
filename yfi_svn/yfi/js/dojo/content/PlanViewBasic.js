/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.PlanViewBasic"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PlanViewBasic"] = true;
dojo.provide("content.PlanViewBasic");
dojo.require('components.Translator');


(function(){
    var cpvb             = content.PlanViewBasic;
    var tr               = components.Translator; 
    var l                = components.LoginLight.UserInfo.l_iso;

    //var urlUserNotifyDetail     = components.Const.cake+'permanent_users/json_notify_detail/';
    //var urlUserNotifySave       = components.Const.cake+'permanent_users/json_notify_save/';
    var planID
    var urlPlanView             = components.Const.cake+'billing_plans/json_view/';
    var urlRealmList            = components.Const.cake+'realms/json_index_list';
    var urlPlanBasicSave        = components.Const.cake+'billing_plans/json_edit/?';
    var urlRealmsForPlan        = components.Const.cake+'billing_plans/json_realms_for_plan/';

    cpvb.add   = function(divContainer,id){

        planID = id;
        dojo.xhrGet({
            url: urlPlanView+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    cpvb.populatePlanDetail(divContainer,response.plan);
                    //------------------------------------------------------

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cpvb.populatePlanDetail = function(divContainer,plan){

         //----Clean up first----------
        if(dijit.byId('contentPlanViewBasicRealm'+planID) != undefined){
            dijit.byId('contentPlanViewBasicRealm'+planID).destroyDescendants(true);
            dijit.byId('contentPlanViewBasicRealm'+planID).destroy(true);
        }
        //----------------------------

        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            var hiddenId    = document.createElement("input");  //Hidden element containing the User's ID
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = planID;
        dojo.place(hiddenId,frmEdit.domNode);

            components.QElements.addPair({          label:tr.tr({'module': 'PlanViewBasic','phrase':"Name",'lang':l}),       divToAdd: frmEdit.domNode,   inpName:'name',         inpRequired:true, isLast:false,    value: plan.name });
            components.QElements.addPair({          label:tr.tr({'module': 'PlanViewBasic','phrase':"Currency",'lang':l}),   divToAdd: frmEdit.domNode,   inpName:'currency',     inpRequired:true, isLast:false,    value: plan.currency });
            components.QElements.addPair({          label:tr.tr({'module': 'PlanViewBasic','phrase':"Subscription",'lang':l}),divToAdd: frmEdit.domNode,  inpName:'subscription', inpRequired:true, isLast:false,    value: plan.subscription });
            components.QElements.addPair({          label:tr.tr({'module': 'PlanViewBasic','phrase':"Rate/Second",'lang':l}),divToAdd: frmEdit.domNode,   inpName:'time_unit',    inpRequired:true, isLast:false,    value: plan.time_unit });
            components.QElements.addPair({          label:tr.tr({'module': 'PlanViewBasic','phrase':"Rate/Byte",'lang':l}),   divToAdd: frmEdit.domNode,  inpName:'data_unit',    inpRequired:true, isLast:false,    value: plan.data_unit });
            components.QElements.addNumberSpinner({ label:'% '+tr.tr({'module': 'PlanViewBasic','phrase':"Tax",'lang':l}),min:0,max:100,divToAdd: frmEdit.domNode,inpName:'tax',     inpRequired:true, isLast:false,    valShow:parseInt(plan.tax) });

            if(components.LoginLight.UserInfo.group == components.Const.admin){       //Only Available to Administrators
                 if(plan.available_to_all == true){
                    components.QElements.addCheckPair({label:tr.tr({'module': 'PlanViewBasic','phrase':"Available to all",'lang':l}),divToAdd: frmEdit.domNode,inpName:'available_all', inpRequired:true,checked: 'checked',value: 'on',isLast: false});
                }else{
                    components.QElements.addCheckPair({label:tr.tr({'module': 'PlanViewBasic','phrase':"Available to all",'lang':l}),divToAdd: frmEdit.domNode,inpName:'available_all', inpRequired:true,value: 'on',isLast: false});
                }
            }
            var d=document.createElement('div');
            dojo.place(d,frmEdit.domNode);
            components.QElements.addMultiSelect({
                                    label:      tr.tr({'module': 'PlanViewBasic','phrase':"Available only to",'lang':l}),
                                    divToAdd:   d,
                                    inpName:    'realms',
                                    inpRequired:true,
                                    isLast:     true,
                                    url:        urlRealmsForPlan+planID,
                                    id:         'contentPlanViewBasicRealm'+planID 
            });
            var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'PlanViewBasic','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);
                
                dojo.connect(btnEdit,'onClick',function(){
                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                         var realms ='';
                        var count = 0;
                            dojo.forEach(dijit.byId('contentPlanViewBasicRealm'+planID).attr('value'), function(i){
                            realms = realms+count+'='+i+'&';
                            count++;
                        });

                        dojo.xhrPost({
                        url: urlPlanBasicSave+realms,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    console.log(frmObj);
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'PlanViewBasic','phrase':"Basic Billing Plan updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'PlanViewBasic','phrase':"Problems updating Basic Billing Plan",'lang':l})+'</b>','message',components.Const.toasterError);
                                }

                                if(response.json.status == 'error'){

                                    dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                                }
                             }
                        });
                    }
                });
        dojo.place(frmEdit.domNode,divContainer);
    }

})();//(function(){

}
