/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.PlanViewPromotions"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PlanViewPromotions"] = true;
dojo.provide("content.PlanViewPromotions");
dojo.require('components.Translator');


(function(){
    var cpvp            = content.PlanViewPromotions;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;

    var planID
    var urlPlanView             = components.Const.cake+'billing_plans/json_view/';
    var urlPlanSavePromo        = components.Const.cake+'billing_plans/json_edit_promo/';

    var data_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'kb', name: tr.tr({'module': 'PlanViewPromotions','phrase':"Kb",'lang':l})},
                { id : 'mb', name: tr.tr({'module': 'PlanViewPromotions','phrase':"Mb",'lang':l})},
                { id : 'gb', name: tr.tr({'module': 'PlanViewPromotions','phrase':"Gb",'lang':l})}
            ]}};

    var time_op = {data: {
            identifier : 'id',
            label: 'name',
            items : [
                { id : 'm', name: tr.tr({'module': 'PlanViewPromotions','phrase':"Minutes",'lang':l})},
                { id : 'h', name: tr.tr({'module': 'PlanViewPromotions','phrase':"Hours",'lang':l})},
                { id : 'd', name: tr.tr({'module': 'PlanViewPromotions','phrase':"Days",'lang':l})}
            ]}};

    cpvp.add   = function(divContainer,id){

        planID = id;
        dojo.xhrGet({
            url: urlPlanView+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    cpvp.populatePlanDetail(divContainer,response.plan);
                    //------------------------------------------------------

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cpvp.populatePlanDetail = function(divContainer,plan){

        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            var hiddenId    = document.createElement("input");  //Hidden element containing the User's ID
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = planID;
        dojo.place(hiddenId,frmEdit.domNode);

            components.QElements.addNumberSpinner({ label:tr.tr({'module': 'PlanViewPromotions','phrase':"Free Data",'lang':l}),valShow:plan.free_data,min:0,max:1024,divToAdd: frmEdit.domNode,inpName:'free_data',inpRequired:true,isLast:false});
            components.QElements.addComboBox({      label:tr.tr({'module': 'PlanViewPromotions','phrase':"Data Units",'lang':l}),data:data_op, divToAdd: frmEdit.domNode,inpName:'data_units',inpRequired:true, isLast:false,searchAttr:'name',value: plan.data_units});
            components.QElements.addNumberSpinner({ label:tr.tr({'module': 'PlanViewPromotions','phrase':"Free Time",'lang':l}),valShow:plan.free_time,min:0,max:60,divToAdd: frmEdit.domNode,inpName:'free_time',inpRequired:true,isLast:false});
            components.QElements.addComboBox({      label:tr.tr({'module': 'PlanViewPromotions','phrase':"Time Units",'lang':l}),data:time_op, divToAdd: frmEdit.domNode,inpName:'time_units',inpRequired:true, isLast:false,searchAttr:'name',value: plan.time_units});
            components.QElements.addNumberSpinner({ label:'% '+tr.tr({'module': 'PlanViewPromotions','phrase':"Discount",'lang':l}),valShow:parseInt(plan.discount),min:0,max:100,divToAdd: frmEdit.domNode,inpName:'discount',inpRequired:true,isLast:true});

            var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 136px;",label:tr.tr({'module': 'PlanViewPromotions','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);
                
                dojo.connect(btnEdit,'onClick',function(){

                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlPlanSavePromo,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    console.log(frmObj);
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'PlanViewPromotions','phrase':"Promotion updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'PlanViewPromotions','phrase':"Problems updating Promotion",'lang':l})+'</b>','message',components.Const.toasterError);
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
