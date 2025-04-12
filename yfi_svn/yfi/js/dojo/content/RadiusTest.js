/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.RadiusTest"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.RadiusTest"] = true;
dojo.provide("content.RadiusTest");
dojo.require("dojox.widget.Toaster" );
dojo.require('components.Translator');

(function(){
    var r               = content.RadiusTest;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;


    var urlTestVoucher;

    r.testVoucherAuth   = function(item,id){

        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'RadiusTest','phrase':"Testing RADIUS please wait",'lang':l})+'</b>','message',components.Const.toasterInfo);

        //Permanent users and vouchers use this
        if(item == 'user'){

            urlTestVoucher = components.Const.cake+'permanent_users/json_test_auth/';
        }

        if(item == 'voucher' ){

            var urlTestVoucher  = components.Const.cake+'vouchers/json_test_auth/';
        }


        createIfNeeded();
        console.log("Testing the Radius for voucher ",id);
        dojo.xhrGet({
                url: urlTestVoucher+id,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                           // console.log(response);
                            var user_string = "<h2>"+tr.tr({'module': 'RadiusTest','phrase':"Send",'lang':l})+"</h2><b>"+tr.tr({'module': 'RadiusTest','phrase':"Username",'lang':l})+"</b><br>"+response.test.username+"<br><b>"+tr.tr({'module': 'RadiusTest','phrase':"Password",'lang':l})+"</b><br>"+response.test.password+"<br>";

                            var ret_string ='<h2>'+tr.tr({'module': 'RadiusTest','phrase':"Return",'lang':l})+'</h2>';
                            dojo.forEach(response.test.items, function(ret_item){
                                var entry = '<b>'+ret_item.attr+'</b><br>'+ret_item.val;
                                ret_string = ret_string+"<br>"+entry;
                               // console.log(ret_string);
                            });
                            dijit.byId('contentRadiusTest').setContent(user_string+ret_string,response.test.status,0);
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
        //var $attr_return = 'Acct-Interim-Interval = 120<br>Idle-Timeout = 900<br>WISPr-Session-Terminate-Time = "2009-04-02T09:00:00+02:00"<br>';
        //dijit.byId('contentRadiusTest').setContent('<h2>Return Attributes</h2>'+$attr_return,'testpass',0); //Notify the use that we added it

    }


    function createIfNeeded(){
        //Check if the toaster has not yet been defined
        if(dijit.byId('contentRadiusTest') == undefined){
            var tstrRadius = new dojox.widget.Toaster({id: "contentRadiusTest", positionDirection: "br-up", duration: "0", style:"display:hide"},document.createElement("div"));
        }
    }

})();//(function(){

}
