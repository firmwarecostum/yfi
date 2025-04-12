/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

if(!dojo._hasResource["components.Common"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["components.Common"] = true;
dojo.provide("components.Common");

dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");

dojo.require('components.Const');
dojo.require('components.Translator');

(function(){

    var cc                  = components.Common;
    var tr                  = components.Translator;
    var l                   = components.LoginLight.UserInfo.l_iso;

    cc.dialogConfirm   = function(confirmFunction,function_argument){

        var dlgConfirm  = new dijit.Dialog({
                title: tr.tr({'module': 'Common','phrase':"Confirm Please",'lang':l}),
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
                    cell12.innerHTML = "<div style='padding:5px;'><b>"+tr.tr({'module': 'Common','phrase':"Please confirm your action",'lang':l})+"</b></div>";
                   
                    row1.appendChild(cell11);
                    row1.appendChild(cell12);
                tbody.appendChild(row1);


                var row2     = document.createElement("tr");

                        var btnYes = new dijit.form.Button({style:"margin:10px;",label:tr.tr({'module': 'Common','phrase':"Yes",'lang':l}),iconClass:"okIcon"},document.createElement("div"));
                        var btnNo  = new dijit.form.Button({style:"margin:10px;",label:tr.tr({'module': 'Common','phrase':"No",'lang':l}),iconClass:"cancelIcon"},document.createElement("div"));

                        dojo.connect(btnYes,'onClick', function(){
                            if(function_argument == undefined){
                                confirmFunction();
                            }else{
                                confirmFunction(function_argument);
                            }
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

    cc.divConstruction = function(){
        var divContainer     = document.createElement('div');
        dojo.addClass(divContainer, 'my_border');
        divContainer.innerHTML = "<h2>"+tr.tr({'module': 'Common','phrase':"Under Construction",'lang':l})+"</h2>"+
                        '<p>'+
                        "<img src='img/actions/construct_64.png' />"+
                        tr.tr({'module': 'Common','phrase':"Component Under Construction",'lang':l})+'<br>'+
                       '</p>';

        var myBorder = RUZEE.ShadedBorder.create({ corner:8, shadow:16 });
        myBorder.render(divContainer);
        return divContainer;
    }

    cc.divWorking      = function(){
        var divContainer     = document.createElement('div');
        dojo.addClass(divContainer, 'autoSetupH');
        divContainer.innerHTML =    "<p style='margin-left: 20px;'>"+
                                    "<img src='img/logo.gif' />"+
                                    "<img src='img/loading/busy.gif' />"+
                                    "<br><b>"+tr.tr({'module': 'Common','phrase':"Working",'lang':l})+"....</b> <br>"+tr.tr({'module': 'Common','phrase':"Please Wait",'lang':l})+
                                    "</p>";
        return divContainer;
    }

})();

}
