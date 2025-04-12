/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.PlanViewExtra"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.PlanViewExtra"] = true;
dojo.provide("content.PlanViewExtra");
dojo.require('components.Translator');


(function(){
    var cpve                = content.PlanViewExtra;
    var tr                  = components.Translator; 
    var l                   = components.LoginLight.UserInfo.l_iso;

    var planID
    var urlPlanView         = components.Const.cake+'billing_plans/json_view/';
    var urlPlanSaveExtra    = components.Const.cake+'billing_plans/json_edit_extra/';

    cpve.add   = function(divContainer,id){

        planID = id;
        dojo.xhrGet({
            url: urlPlanView+id,
            preventCache: true,
            handleAs: "json",
            load: function(response){

                //console.log(response);
                if(response.json.status == 'ok'){
                    //------------------------------------------------------
                    cpve.populatePlanDetail(divContainer,response.plan);
                    //------------------------------------------------------

                };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }

    cpve.populatePlanDetail = function(divContainer,plan){

        var frmEdit    = new dijit.form.Form({ encType:"multipart/form-data",action:"",method:"POST"},document.createElement("div"));

            var hiddenId    = document.createElement("input");  //Hidden element containing the User's ID
            hiddenId.type   = "hidden";
            hiddenId.name   = "id";
            hiddenId.value  = planID;
        dojo.place(hiddenId,frmEdit.domNode);

        //-----------------Special Add IN To explain better----
                var lbl_t   = document.createElement('label');
                var txt_t   = document.createTextNode(tr.tr({'module': 'PlanViewExtra','phrase':"Extra Time Cap Rate",'lang':l})+' =');
                lbl_t.appendChild(txt_t);
        dojo.place(lbl_t,frmEdit.domNode);

            //Change the label class if not required
            dojo.addClass(lbl_t, "frmRequired");
            dojo.style(lbl_t,'width', '150px');

            var inpNumber_t = new dijit.form.NumberSpinner({
                                style: 'width 20px',
                                name: 'extra_time',
                                value: plan.extra_time,
                                smallDelta: 0.01,
                                constraints: { min:0, max:10, places:2 }
            }, document.createElement("div") );
        dojo.place(inpNumber_t.domNode,frmEdit.domNode);

            var tail_t = document.createElement('span');
            tail_t.innerHTML ='<b> x '+tr.tr({'module': 'PlanViewExtra','phrase':"Rate/Second",'lang':l})+'</b>';
        dojo.place(tail_t, frmEdit.domNode);

            var br1_t = document.createElement('br');
            br1_t.clear = 'all';
        dojo.place(br1_t,frmEdit.domNode);
        //________________________

            var lbl_d   = document.createElement('label');
                var txt_d   = document.createTextNode(tr.tr({'module': 'PlanViewExtra','phrase':"Extra Data Cap Rate",'lang':l})+' =');
                lbl_d.appendChild(txt_d);
        dojo.place(lbl_d,frmEdit.domNode);

            //Change the label class if not required
            dojo.addClass(lbl_d, "frmRequired");
            dojo.style(lbl_d,'width', '150px');

            var inpNumber_d = new dijit.form.NumberSpinner({
                                style: 'width 50px',
                                name: 'extra_data',
                                value: plan.extra_data,
                                smallDelta: 0.01,
                                constraints: { min:0, max:10, places:2 }
            }, document.createElement("div") );
        dojo.place(inpNumber_d.domNode,frmEdit.domNode);

            var tail_d = document.createElement('span');
            tail_d.innerHTML ='<b> x '+tr.tr({'module': 'PlanViewExtra','phrase':"Rate/Byte",'lang':l})+'</b>';
        dojo.place(tail_d, frmEdit.domNode);

            var br1_d=document.createElement('br');
            br1_d.clear = 'all';
        dojo.place(br1_d,frmEdit.domNode);

        //--------------END Special Add IN-------

            var btnEdit = new dijit.form.Button({style:"margin:10px; margin-left: 156px;",label:tr.tr({'module': 'PlanViewExtra','phrase':"Save",'lang':l}),iconClass:"saveIcon"},document.createElement("div"));
            dojo.place(btnEdit.domNode,frmEdit.domNode);
                
                dojo.connect(btnEdit,'onClick',function(){

                   if(frmEdit.validate()){
                        console.log('Form is valid...');
                        var frmObj = dojo.formToObject(frmEdit.domNode); //Convert the Form to an object
                        dojo.xhrPost({
                        url: urlPlanSaveExtra,
                        content: frmObj, //Form: does not work in this context -> convert to object and use object
                        handleAs: "json",
                        load: function(response){
                                if(response.json.status == 'ok'){
                                    console.log(frmObj);
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'PlanViewExtra','phrase':"Extra Caps Rate updated OK",'lang':l})+'</b>','message',components.Const.toasterInfo); //Notify the use that we added it
                                }else{
                                    dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'PlanViewExtra','phrase':"Problems updating Extra Caps Rate",'lang':l})+'</b>','message',components.Const.toasterError);
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
