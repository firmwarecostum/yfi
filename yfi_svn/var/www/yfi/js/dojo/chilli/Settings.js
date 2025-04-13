

if(!dojo._hasResource["chilli.Settings"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["chilli.Settings"] = true;
dojo.provide("chilli.Settings");


(function(){

    var cs          = chilli.Settings;
    cs.cake         = '/c2/yfi_cake/';
    cs.languages    = cs.cake+'users/json_languages/true/';
    cs.lang         = 'en';     //Default Language
    cs.timeout      = 15000;     //Timeout for JSON requests
    cs.usage_rate   = 20000;    //Refresh usage tab in milliseconds
    cs.status_rate  = 10000;    //Refresh status tab in milliseconds
    cs.orange       = 75;       //Orange toolbar starts after 75%
    cs.red          = 90;       //Red toolbar starts after 90%
    cs.uam_jsonp    = 'http://change_me.com/coova_json/uam.php';                         //URL of the uam YFi Web service - Change to suit your install
    cs.usage_jsonp  = 'http://change_me.com/c2/yfi_cake/third_parties/json_usage_check'; //URL of the usage YFi Web service - Change to suit your install
    cs.url_default  = 'http://google.com';                                              //URL that user will be redirected to by default - use instead of originalURL
})();

}
