/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["content.Permanent"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.Permanent"] = true;
dojo.provide("content.Permanent");

dojo.require("dojox.charting.Chart2D");
dojo.require("dojox.charting.plot2d.Pie");
dojo.require("dojox.charting.action2d.Highlight");
dojo.require("dojox.charting.action2d.MoveSlice");
dojo.require("dojox.charting.action2d.Tooltip");
dojo.require("dojox.charting.themes.MiamiNice");
dojo.require("dojox.charting.widget.Legend");
dojo.require('components.Formatters');
dojo.require('components.Translator');
dojo.require('components.Common');


(function(){
    var homepage    = content.Permanent;
    var cOne;
    var dataPie;
    var cTwo;
    var timePie;
    var divActions;

    var tr                      = components.Translator; 
    var l                       = components.LoginLight.UserInfo.l_iso;

    var urlUserUsage            = components.Const.cake+'permanent_users/json_usage/'+components.LoginLight.UserInfo.User.id+'/1/?';
    var urlUserKick             = components.Const.cake+'permanent_users/json_kick/'+components.LoginLight.UserInfo.User.id+'/?';

    homepage.create =function(divParent){

        //--------------------Action Part --------------------
            divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
            components.QElements.addAction({Name:tr.tr({'module': 'Permanent','phrase':"Reload Data",'lang':l}),Type:'reload',Parent: divActions,Action:homepage['reload'],Id:null});
            dojo.place(divActions,divParent);
            //-----------------------------------------------------------


        var divContainer     = document.createElement('div');
        dojo.addClass(divContainer, 'my_border');
        //dojo.style(divContainer,"height","200px");
        //dojo.style(divContainer,"width","600px");
    
         divContainer.innerHTML = "<h2>"+tr.tr({'module': 'Permanent','phrase':"Usage Summary",'lang':l})+"</h2>"+
                        '<div id="content.Permanent.TimeSpan">_</div>'+
                        '<table border="0" width="300px">'+
                        '<tr>'+
                        '<td></td>'+
                        '<td><b>'+tr.tr({'module': 'Permanent','phrase':"Data",'lang':l})+'</b></td>'+
                        '<td><b>'+tr.tr({'module': 'Permanent','phrase':"Time",'lang':l})+'</b></td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td><b>'+tr.tr({'module': 'Permanent','phrase':"Used",'lang':l})+'</b></td>'+
                        '<td><span id="content.Permanent.DataUsed"></span></td>'+
                        '<td><span id="content.Permanent.TimeUsed"></span></td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td><b>'+tr.tr({'module': 'Permanent','phrase':"Available",'lang':l})+'</b></td>'+
                        '<td><span id="content.Permanent.DataAvail"></span></td>'+
                        '<td><span id="content.Permanent.TimeAvail"></span></td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td><b>'+tr.tr({'module': 'Permanent','phrase':"Extras",'lang':l})+'</b></td>'+
                        '<td><span id="content.Permanent.DataExtra"></span></td>'+
                        '<td><span id="content.Permanent.TimeExtra"></span></td>'+
                        '</tr>'+
                        '</table>';
        
        dojo.place(divContainer,divParent);

        var myBorder = RUZEE.ShadedBorder.create({ corner:8, shadow:16 });
        myBorder.render(divContainer);

        //----------------DATA PIE----------------------
        dataPie         = document.createElement('div');
       // dojo.style(dataPie,'display','none');

        dojo.place(dataPie,divParent);
                chartOne     = document.createElement('div');
                dojo.style(chartOne,"height","300px");
                dojo.style(chartOne,"width","300px");

            dojo.place(chartOne,dataPie);

                legentOne     = document.createElement('div');
                dojo.style(legentOne,"height","100px");
                dojo.style(legentOne,"width","300px");
            dojo.place(legentOne,dataPie);

            var dc = dojox.charting;                //Easy Typing namespace
            cOne = new dc.Chart2D(chartOne);    //Create new chart
            cOne.setTheme(dc.themes.MiamiNice);     //Set theme
            cOne.addPlot("default", {
                                    type: "Pie",
                                    font: "normal normal 11pt Tahoma",
                                    fontColor: "green",
                                    labelOffset: -30,
                                    radius: 80
                                 });                 //Add Pie plot
        
        //Prime the plot
            cOne.addSeries("SeriesA",  [{y: 4, text: tr.tr({'module': 'Permanent','phrase':"Used",'lang':l}),        color: 'red',   stroke: "black", tooltip: tr.tr({'module': 'Permanent','phrase':"Used is",'lang':l})+" 50%"},
                                        {y: 2, text: tr.tr({'module': 'Permanent','phrase':"Available",'lang':l}),   color: 'green', stroke: "black", tooltip: tr.tr({'module': 'Permanent','phrase':"Available is",'lang':l})+" 50%"}]);                 //Add Data

        
            var anim_a = new dc.action2d.MoveSlice(cOne, "default");    //Animations
            var anim_b = new dc.action2d.Highlight(cOne, "default");    //Highlight
            var anim_c = new dc.action2d.Tooltip(cOne, "default");      //Tooltip
            cOne.render();                                              //Show chart
            var lOne = new dojox.charting.widget.Legend({chart: cOne}, legentOne);
         dojo.style(dataPie,'display','none');
        //---------------------------------------------------------------------
        
        //----------------TIME PIE----------------------
        timePie         = document.createElement('div');
        //dojo.style(timePie,'display','none');

        dojo.place(timePie,divParent);
                chartTwo     = document.createElement('div');
                dojo.style(chartTwo,"height","300px");
                dojo.style(chartTwo,"width","300px");

            dojo.place(chartTwo,timePie);

                legentTwo     = document.createElement('div');
                dojo.style(legentTwo,"height","100px");
                dojo.style(legentTwo,"width","300px");
            dojo.place(legentTwo,timePie);

                //Easy Typing namespace
            cTwo = new dc.Chart2D(chartTwo);    //Create new chart
            cTwo.setTheme(dc.themes.MiamiNice);     //Set theme
            cTwo.addPlot("default", {
                                    type: "Pie",
                                    font: "normal normal 11pt Tahoma",
                                    fontColor: "green",
                                    labelOffset: -30,
                                    radius: 80
                                 });                 //Add Pie plot
        
        //Prime the plot
            cTwo.addSeries("SeriesB",  [{y: 4, text: tr.tr({'module': 'Permanent','phrase':"Used",'lang':l}),        color: 'red',   stroke: "black", tooltip: tr.tr({'module': 'Permanent','phrase':"Used is",'lang':l})+" 50%"},
                                        {y: 2, text: tr.tr({'module': 'Permanent','phrase':"Available",'lang':l}),   color: 'green', stroke: "black", tooltip: tr.tr({'module': 'Permanent','phrase':"Available is",'lang':l})+" 50%"}]);                 //Add Data

        
            var anim_a = new dc.action2d.MoveSlice(cTwo, "default");    //Animations
            var anim_b = new dc.action2d.Highlight(cTwo, "default");    //Highlight
            var anim_c = new dc.action2d.Tooltip(cTwo, "default");      //Tooltip
            cTwo.render();                                              //Show chart
            var lTwo = new dojox.charting.widget.Legend({chart: cTwo}, legentTwo);
        dojo.style(timePie,'display','none');
        //---------------------------------------------------------------------
        homepage.reload();
      

    }

    homepage.reload     = function(){

        console.log("Reload Homepage Data");
        var ts = Number(new Date());

         dojo.xhrGet({
                url: urlUserUsage+ts,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){

                            reload_populator(response);
                            
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
                                                 //Show chart
    }

    
    function reload_populator(response){
        var nl = dojo.query('a.FancyIcon',divActions);  //Remove previous ones if they existed
        nl.forEach(function(item){
            if(item.title == 'Kick myself off'){
                dojo._destroyElement(item);
            }
        })
        if(response.logged_in == true){
            components.QElements.addAction({Name:tr.tr({'module': 'Permanent','phrase':"Kick myself off",'lang':l}),Type:'kick',Parent: divActions,Action:homepage['kick'],Id:null});
        }

        dojo.byId("content.Permanent.TimeSpan").innerHTML = "<b>"+tr.tr({'module': 'Permanent','phrase':"From",'lang':l})+": </b>"+response.items[0].start+"<b>"+tr.tr({'module': 'Permanent','phrase':"Until",'lang':l})+": </b>"+response.items[0].end;
        dojo.byId("content.Permanent.DataUsed").innerHTML   = components.Formatters.FormatOctets(response.items[0].data_used); 
        dojo.byId("content.Permanent.DataAvail").innerHTML  = components.Formatters.FormatOctets(response.items[0].data_avail);
        dojo.byId("content.Permanent.DataExtra").innerHTML  = components.Formatters.FormatOctets(response.items[0].extra_data);
        dojo.byId("content.Permanent.TimeUsed").innerHTML   = response.items[0].time_used; 
        dojo.byId("content.Permanent.TimeAvail").innerHTML  = response.items[0].time_avail;
        dojo.byId("content.Permanent.TimeExtra").innerHTML  = response.items[0].extra_time;

        if(response.graph_data.length > 1){
            cOne.updateSeries("SeriesA",response.graph_data);
            cOne.render();
            dojo.style(dataPie,'display','block');
        }else{
            dojo.style(dataPie,'display','none');
        }

        if(response.graph_time.length > 1){
            cTwo.updateSeries("SeriesB",response.graph_time);
            cTwo.render();
            dojo.style(timePie,'display','block');
        }else{
            dojo.style(timePie,'display','none');
        }
    }

    homepage.kick   = function(){
        components.Common.dialogConfirm(homepage.kick_confirm);
    }

    homepage.kick_confirm = function(){
        console.log('confirm kick off');
        dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Permanent','phrase':"Attempt kick off",'lang':l})+'</b>','message',components.Const.toasterInfo);
        var ts = Number(new Date());
        dojo.xhrGet({
                url: urlUserKick+ts,
                preventCache: true,
                handleAs: "json",
                load: function(response){
                        if(response.json.status == 'ok'){
                            dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'Permanent','phrase':"User kicked off OK",'lang':l})+'</b>','message',components.Const.toasterInfo);
                            homepage.reload();
                        };
                        if(response.json.status == 'error'){
                            dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                        }
                    }
            });
    }


})();//(function(){

}
