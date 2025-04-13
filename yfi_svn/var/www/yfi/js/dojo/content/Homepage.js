/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.Homepage"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Homepage"] = true;
dojo.provide("content.Homepage");
dojo.require('components.Translator');

(function(){
    var homepage    = content.Homepage;
    var tr          = components.Translator;
    var l           = components.LoginLight.UserInfo.l_iso;

    homepage.create=function(divParent){

        var divContainer     = document.createElement('div');
        dojo.addClass(divContainer, 'my_border');
        divContainer.innerHTML = "<h2>"+tr.tr({'module': 'Homepage','phrase':"Quick Help",'lang':l})+"</h2>"+
                        '<p>'+
                        tr.tr({'module': 'Homepage','phrase':"The administrative interface to <b>YFi Hotspot Manager</b>.",'lang':l})+'<br>'+
                        tr.tr({'module': 'Homepage','phrase':"Selecting an action on the left will result on feedback in this pane.",'lang':l})+'<br>'+
                        tr.tr({'module': 'Homepage','phrase':"You can always close the feedback tabs to keep things simple.",'lang':l})+
                       '</p>';
        dojo.place(divContainer,divParent);
        var myBorder = RUZEE.ShadedBorder.create({ corner:8, shadow:16 });
        myBorder.render(divContainer);
    }
})();//(function(){

}
