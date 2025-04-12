/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["components.QElements"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["components.QElements"] = true;
dojo.provide("components.QElements");

dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.Textarea");
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.form.DateTextBox');
dojo.require('dijit.Dialog');


(function(){

    var cqe         = components.QElements;
    cqe.liAnchor    = function(liData){

                    var li=document.createElement('li');
                        var a=document.createElement('a');
                        a.href='#';
                        a.appendChild(document.createTextNode(liData.name));
                        dojo.connect(a, "onclick", function(){
                                    dojo.publish(liData.eventToPublish, []);
                                });
                    li.appendChild(a);
                    return li;
    }; 


     cqe.addAction = function(actionData){

        var l   = document.createElement('a');
        l.href  ='#';
        l.title = actionData.Name;
        dojo.addClass(l, 'FancyIcon');
        //l.appendChild(document.createTextNode('Create Single'+actionData.Type));
        var i   = document.createElement('div');
        dojo.addClass(i, actionData.Type);
        dojo.place(i,l);
        dojo.place(l,actionData.Parent);

        dojo.connect(l,'onclick',function(){

            actionData.Action(actionData.Id);
            //Component:'content.Realms',Action:'createPDF'
        });
    }


    cqe.addPair  = function(pairData){

        /* pairData contents 
            label       -> the lable of the pair
            divToAdd    -> the div where the lable will be added
            inpRequired -> true/false style accordingly + dojo specific
            inpName     -> name of from element
            value       -> if a value must be displayed
            id          -> dijit id
            pw          -> true/false if it must be of type "password"
        */

         var lbl =document.createElement('label');
                var txt=document.createTextNode(pairData.label);
            lbl.appendChild(txt);
        dojo.place(lbl,pairData.divToAdd);

        //Change the label class if not required
        if(pairData.inpRequired){
            dojo.addClass(lbl, "frmRequired");
        }else{
            dojo.addClass(lbl, "frmOptional");
        }

        //type = text if
        var t = 'text';
        if(pairData.pw){
            t = 'password';
        }

         if(pairData.disabled != undefined){
            var inp = new dijit.form.ValidationTextBox({ name:pairData.inpName,required:pairData.inpRequired, value: pairData.value,id: pairData.id,type:t, disabled:'disabled'},document.createElement("div"));
        }else{
            var inp = new dijit.form.ValidationTextBox({ name:pairData.inpName,required:pairData.inpRequired, value: pairData.value,id: pairData.id,type:t},document.createElement("div"));
        }

        dojo.place(inp.domNode,pairData.divToAdd);

             var br2=document.createElement('BR');
        if(pairData.isLast){
            //Skip the clear all
        }else{
                br2.clear = 'all';
        }

        dojo.place(br2,pairData.divToAdd);

    }

    cqe.addComboBox  = function(comboData){

        /* comboData contents 
            label       -> the lable of the pair
            divToAdd    -> the div where the lable will be added
            inpRequired -> true/false style accordingly + dojo specific
            inpName     -> name of from element
            value       -> if a value must be displayed
            id          -> dijit id
        */
        var store;
        var s = comboData.searchAttr;
        var v = String(comboData.displayedValue);
        var lbl = document.createElement('label');
            var txt = document.createTextNode(comboData.label);
        lbl.appendChild(txt);
        dojo.place(lbl,comboData.divToAdd);

        //Change the label class if not required
        if(comboData.inpRequired){
            dojo.addClass(lbl, "frmRequired");
        }else{
            dojo.addClass(lbl, "frmOptional");
        }

            if(comboData.url != undefined){
                store           = new dojo.data.ItemFileReadStore({url: comboData.url});
            }else{
                store           = new dojo.data.ItemFileReadStore(comboData.data);
            }
            //console.log(store);

            var inpCombo        = new dijit.form.FilteringSelect({ name: comboData.inpName, store: store, searchAttr: s,required: comboData.inpRequired,id: comboData.id,value: comboData.value}, 
                                    document.createElement("div"));

            if(comboData.displayedValue != undefined){
                inpCombo.setDisplayedValue(v);
            }

        dojo.place(inpCombo.domNode,comboData.divToAdd);

        var br1=document.createElement('br');
        if(comboData.isLast){
            //Skip the clear all
        }else{
                br1.clear = 'all';
        }
        dojo.place(br1,comboData.divToAdd);
    }


     cqe.addCheckPair  = function(pairData){

         var lbl =document.createElement('label');
                var txt=document.createTextNode(pairData.label);
            lbl.appendChild(txt);
        dojo.place(lbl,pairData.divToAdd);

        //Change the label class if not required
        if(pairData.inpRequired){
            dojo.addClass(lbl, "frmRequired");
        }else{
            dojo.addClass(lbl, "frmOptional");
        }
        if(pairData.checked == undefined ){
                var chk = new dijit.form.CheckBox({name:pairData.inpName, value:'on', type:'checkbox',id: pairData.id},document.createElement("div"));
            dojo.place(chk.domNode,pairData.divToAdd);
        }else{
                 var chk = new dijit.form.CheckBox({name:pairData.inpName, checked:pairData.checked, value:'on', type:'checkbox',id: pairData.id},document.createElement("div"));
            dojo.place(chk.domNode,pairData.divToAdd);
        }

             var br2=document.createElement('BR');
        if(pairData.isLast){
            //Skip the clear all
        }else{
                br2.clear = 'all';
        }

        dojo.place(br2,pairData.divToAdd);
    }

    cqe.addTextArea = function(pairData){


        var lbl =document.createElement('label');
                var txt=document.createTextNode(pairData.label);
            lbl.appendChild(txt);
        dojo.place(lbl,pairData.divToAdd);

        //Change the label class if not required
        if(pairData.inpRequired){
            dojo.addClass(lbl, "frmRequired");
        }else{
            dojo.addClass(lbl, "frmOptional");
        }


            var inp = new dijit.form.Textarea({     
                                                name:           pairData.inpName,
                                                required:       pairData.inpRequired, 
                                                value:          pairData.value,
                                                id:             pairData.id,
                                                style:          'width: 380px; margin-bottom: 10px;'
                        },document.createElement("div"));

        dojo.place(inp.domNode,pairData.divToAdd);

             var br2=document.createElement('BR');
        if(pairData.isLast){
            //Skip the clear all
        }else{
                br2.clear = 'all';
        }

        dojo.place(br2,pairData.divToAdd);

    }

     cqe.addMultiSelect = function(pairData){

        dojo.require("dijit.form.MultiSelect");

        dojo.addOnLoad(function(){
         
            //------------------------------------------
            dojo.xhrGet({
                url: pairData.url,
                preventCache: true,
                handleAs: "json",
                load: function(response){

                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                            var lbl =document.createElement('label');
                                var txt=document.createTextNode(pairData.label);
                            lbl.appendChild(txt);
                        dojo.place(lbl,pairData.divToAdd);

                        //Change the label class if not required
                        if(pairData.inpRequired){
                            dojo.addClass(lbl, "frmRequired");
                        }else{
                            dojo.addClass(lbl, "frmOptional");
                        }

                        var sel = document.createElement('select');
                        sel.multiple = 'multiple';

                        dojo.forEach(response.items, function(i){
                            var c = dojo.doc.createElement('option');
                            c.innerHTML = i.name;
                            c.selected = i.selected;
                            c.value = i.id;
                            sel.appendChild(c);
                        })

                        var ms = new dijit.form.MultiSelect({widgetsInTemplate:true, name: 'dynamic', id: pairData.id }, sel);
                        dojo.place(ms.domNode,pairData.divToAdd);
                        var br2=document.createElement('BR');
                        if(pairData.isLast){
                            //Skip the clear all
                        }else{
                            br2.clear = 'all';
                        }
                        dojo.place(br2,pairData.divToAdd);
                        //---------------------------------------------------------

                    };

                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
            });
        //------------------------------------------
        });
    }


    cqe.addNumberSpinner = function(numberData){
    //-----------------------------------------
    //--SampleCall :components.QElements.addNumberSpinner({ label:'Days valid',valShow:1,min:1,max:120,divToAdd: frmAdd.domNode,inpName:'valid_for',isLast:false});
    //----------------------------------------

        var lbl =document.createElement('label');
                var txt=document.createTextNode(numberData.label);
            lbl.appendChild(txt);
        dojo.place(lbl,numberData.divToAdd);

        //Change the label class if not required
        if(numberData.inpRequired){
            dojo.addClass(lbl, "frmRequired");
        }else{
            dojo.addClass(lbl, "frmOptional");
        }

            var inpNumber = new dijit.form.NumberSpinner({
                                    name: numberData.inpName,
                                    value: numberData.valShow,
                                    smallDelta: 1,
                                    intermediateChanges: true,
                                    constraints: { min:numberData.min, max:numberData.max, places:0 }
                            }, document.createElement("div") );
        dojo.place(inpNumber.domNode,numberData.divToAdd);

        var br1=document.createElement('br');
        if(numberData.isLast){
            //Skip the clear all
        }else{
                br1.clear = 'all';
        }
        dojo.place(br1,numberData.divToAdd);
    }

     cqe.addDateTextBox = function(dateData){
    //-----------------------------------------
    //--SampleCall :components.QElements.addDateTextBox({   label:'Expires on',divToAdd: frmAdd.domNode,inpName:'expire_on',inpRequired:true,isLast:true});
    //----------------------------------------

        var lbl =document.createElement('label');
                var txt=document.createTextNode(dateData.label);
            lbl.appendChild(txt);
        dojo.place(lbl,dateData.divToAdd);

        //Change the label class if not required
        if(dateData.inpRequired){
            dojo.addClass(lbl, "frmRequired");
        }else{
            dojo.addClass(lbl, "frmOptional");
        }

        var inpDate = new dijit.form.DateTextBox({required:dateData.inpRequired,name:dateData.inpName},document.createElement("div"));
        dojo.place(inpDate.domNode,dateData.divToAdd);

        var br1=document.createElement('br');
        if(dateData.isLast){
            //Skip the clear all
        }else{
                br1.clear = 'all';
        }
        dojo.place(br1,dateData.divToAdd);

    }

    
    cqe.addLabelPair  = function(pairData){
        //-----------------------------------------
        //--SampleCall :components.QElements.addLabelPair({label:'Phone',        divToAdd: divContainer,     inpRequired:true,  isLast:true,     value: user.phone});
        //----------------------------------------
         var lbl =document.createElement('label');
                var txt=document.createTextNode(pairData.label);
            lbl.appendChild(txt);
        dojo.place(lbl,pairData.divToAdd);

        //Change the label class if not required
        if(pairData.inpRequired){
            dojo.addClass(lbl, "frmRequired");
        }else{
            dojo.addClass(lbl, "frmOptional");
        }
            var lblVal =document.createElement('label');
                var txtVal=document.createTextNode(pairData.value);
            lblVal.appendChild(txtVal);
        dojo.place(lblVal,pairData.divToAdd);

             var br2=document.createElement('BR');
        if(pairData.isLast){
            //Skip the clear all
        }else{
                br2.clear = 'all';
        }
        dojo.place(br2,pairData.divToAdd);
    }


    cqe.dialogConfirm   = function(confirmFunction){

         var dlgConfirm  = new dijit.Dialog({
                title: "Confirm Please",
                style: "width: 260px"
            });

             var tblConfirm = document.createElement("table");
                    var bodyConfirm = document.createElement("tbody");
                tblConfirm.appendChild(bodyConfirm);

                var tbody   = tblConfirm.getElementsByTagName("tbody")[0];

                var row1    = document.createElement("tr");

                    var cell11 = document.createElement("TD");
                    cell11.innerHTML = "<img src='img/actions/warning.png' align='right' />";

                    var cell12 = document.createElement("TD");           
                    cell12.innerHTML = "<div style='padding:5px;'><b>Please confirm your action.</b></div>";
                   
                    row1.appendChild(cell11);
                    row1.appendChild(cell12);
                tbody.appendChild(row1);


                var row2     = document.createElement("tr");

                        var btnYes = new dijit.form.Button({style:"margin:10px;",label:'Yes',iconClass:"okIcon"},document.createElement("div"));
                        var btnNo  = new dijit.form.Button({style:"margin:10px;",label:'No',iconClass:"cancelIcon"},document.createElement("div"));

                        dojo.connect(btnYes,'onClick', function(){

                            confirmFunction();
                            dlgConfirm.destroyRecursive(false); //Destroy the dialog
                        });

                        dojo.connect(btnNo,'onClick', function(){

                            dlgConfirm.destroyRecursive(false); //Destroy the dialog
                        })

                    var cell21 = document.createElement("TD");

                    var cell22 = document.createElement("TD");
                    dojo.place(btnNo.domNode,cell22);
                    dojo.place(btnYes.domNode,cell22);
 
                    row2.appendChild(cell21);
                    row2.appendChild(cell22);

                tbody.appendChild(row2);

            dlgConfirm.attr('content',tblConfirm);
            dlgConfirm.show();

    }

    cqe.divConstruction = function(){
        var divContainer     = document.createElement('div');
        dojo.addClass(divContainer, 'my_border');
        divContainer.innerHTML = "<h2>Under Construction</h2>"+
                        '<p>'+
                        "<img src='img/actions/construct_64.png' />"+
                        'Component Under Construction<br>'+
                       '</p>';

        var myBorder = RUZEE.ShadedBorder.create({ corner:8, shadow:16 });
        myBorder.render(divContainer);
        return divContainer;
    }

    cqe.divWorking      = function(){
        var divContainer     = document.createElement('div');
        divContainer.innerHTML =    "<img src='img/logo.gif' />"+
                                    "<img src='img/loading/busy.gif' />"+
                                    "<p style='margin-left: 20px;'>"+
                                    "<b>Working ....</b> <br><b>Please Wait</b>"+
                                    "</p>";
        return divContainer;
    }
})();

}
