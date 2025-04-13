

if(!dojo._hasResource["chilli.QElements"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["chilli.QElements"] = true;
dojo.provide("chilli.QElements");

dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require('dojo.data.ItemFileReadStore');


(function(){

    var cqe         = chilli.QElements;
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

})();

}
