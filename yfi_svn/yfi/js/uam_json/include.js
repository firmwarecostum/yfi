//--------------------------------------------------------
djConfig = {
    afterOnLoad: true,
    addOnLoad: function(){
       // console.log("Dojo loaded!");
        //We can now include our core JS which sould be centrally
        dojo.require("chilli.Chilli");
        dojo.addOnLoad(function(){
           // console.log("Chilli Lib Loaded");
            dojo.require("chilli.Json");
            dojo.addOnLoad(function(){
               // console.log("Chilli Json Loaded");
                chilli.Json.getStatus();
            });
        });
    }
};
//-------------------------------------------------------

//---------------------------------------------------------
function loadDojo(){
    // summary: creates a script node for dojo and attaches it to the DOM.
    var node = document.createElement("script");
    node.type = "text/javascript";
    node.src = "js/dojo/dojo/dojo.js";
    document.getElementsByTagName("head")[0].appendChild(node);
}
//---------------------------------------------------------

//--------------------------------------------------------
//Register loadDojo function with page onload event.
if(window.addEventListener){
    window.addEventListener("load", loadDojo, false);
}else{
    window.attachEvent("onload", loadDojo);
}
//--------------------------------------------------------