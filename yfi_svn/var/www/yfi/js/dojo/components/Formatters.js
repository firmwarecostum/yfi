/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["components.Formatters"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["components.Formatters"] = true;
dojo.provide("components.Formatters");
dojo.require('components.Translator');

(function(){

    var cf          = components.Formatters;
    var tr          = components.Translator; 
    var l           = components.LoginLight.UserInfo.l_iso;
  
    cf.numToBytes   = function(bytes){

        if(bytes == 'NA'){
            return bytes;
        }
    
        var negative = '';
        var num = Math.abs(bytes);

        if(bytes < 0 ){
            negative = ' ('+tr.tr({'module': 'Formatters','phrase':"Negative",'lang':l})+')';
        }

        if(num >= (1024*1024*1024)){
            //  console.log('Canadate for Giga');
            var newNum = num/(1024*1024*1024);
            newNum = Math.round(newNum);
            //  console.log("New GB is "+ newNum);
            return newNum+" "+tr.tr({'module': 'Formatters','phrase':"Gb",'lang':l})+negative;

        } else if(num >= (1024*1024)){
            //  console.log('Canadate for Mega');
            var newNum = num/(1024*1024);
            newNum = Math.round(newNum);
            // console.log("New MB is "+ newNum);
            return newNum+" "+tr.tr({'module': 'Formatters','phrase':"Mb",'lang':l})+negative;
            
        } else if(num >= (1024)){
            //   console.log('Canadate for Kilo');
            var newNum = num/1024;
            newNum = Math.round(newNum);
            // console.log("New KB is "+ newNum);
            return newNum+" "+tr.tr({'module': 'Formatters','phrase':"Kb",'lang':l})+negative;
        } else if(num == (0)){

            return 0;   //Small numbers
        } else{
            var newNum = num/1;
            newNum = Math.round(newNum);
            return newNum+" "+tr.tr({'module': 'Formatters','phrase':"bytes",'lang':l})+negative;
        }
    };


    cf.timeToHuman  = function(seconds){
        if(seconds == 'NA'){
            return seconds;
        }

        var negative = '';
        var num = Math.abs(seconds);

        if(seconds < 0 ){
            negative = ' ('+tr.tr({'module': 'Formatters','phrase':"Negative",'lang':l})+')';
        }
        
        if(seconds >= (60*60*24)){
            var newTime = seconds/(60*60*24);
            newTime     = Math.round(newTime)
            return newTime+" "+tr.tr({'module': 'Formatters','phrase':"days",'lang':l})+negative;
        }

        if(seconds >= (60*60)){
            var newTime = seconds/(60*60);
            newTime     = Math.round(newTime)
            return newTime+" "+tr.tr({'module': 'Formatters','phrase':"hours",'lang':l})+negative;
        }

        if(seconds >= (60*60)){
            var newTime = seconds/(60*60);
            newTime     = Math.round(newTime)
            return newTime+" "+tr.tr({'module': 'Formatters','phrase':"minutes",'lang':l})+negative;
        }else{
            return seconds+" "+tr.tr({'module': 'Formatters','phrase':"seconds",'lang':l})+negative;
        }
    }


    cf.CheckReply   = function(value){
        if(value == 'Check'){
            return "<div style='width:100%; height:100%; background-color:#fbdeb9; '><b>"+tr.tr({'module': 'Formatters','phrase':"Check",'lang':l})+"</b></div>";
        }
        if(value == 'Reply'){
            return "<div style='width:100%; height:100%; background-color:#b9e8fb; '><b>"+tr.tr({'module': 'Formatters','phrase':"Reply",'lang':l})+"</b></div>";
        }
    }

    cf.Bold     = function(value){
        return "<div style='width:100%; height:100%;'><b>"+value+"</b></div>";
    }

    cf.CheckForNull     = function(value){
        if(value == null){

            return "<div style='width:100%; height:100%;background-color:#a5e1af; '><b>"+tr.tr({'module': 'Formatters','phrase':"Still Active",'lang':l})+"</b></div>";
        }else{
            return value;
        }
    }

    cf.FormatOctets     = function(value){
        var format_bytes = components.Formatters.numToBytes(value);
        return "<div style='width:100%; height:100%;'><b>"+format_bytes+"</b></div>";
    }

    cf.FormatTime     = function(value){
        var format_time = components.Formatters.timeToHuman(value);
        return "<div style='width:100%; height:100%;'><b>"+format_time+"</b></div>";
    }


    cf.CreditCheck  = function(value){
        var intVal = parseInt(value);
        if(intVal <= 0){
            return "<div style='widgth:100%; height:100%; background-color:#c2e5c8'><b>"+value+"</b></div>";
        }else{
            return "<div style='width:100%; height:100%;'><b>"+value+"</b></div>";
        }
    }

     cf.formatStatus     = function(value){

        var pattern_up     = /Up|Known/;
        var pattern_down   = /Down|Unknown/;

        var matches_up     = value.search(pattern_up);
       // console.log('Matches Up',matches_up);
        if(matches_up > -1){
            return "<div style='width:100%; height:100%; background-color:#acd87d; '><b>"+value+"</b></div>";
        }
        var matches_down     = value.search(pattern_down);
       // console.log('Matches Down',matches_down);
        if(matches_down > -1){
            return "<div style='width:100%; height:100%; background-color:#f1644d; '><b>"+value+"</b></div>";
        }
        return "<div style='width:100%; height:100%; background-color:#10ecef; '><b>"+value+"</b></div>";
    }

    cf.warnAboveZero     = function(value){
        if(value > 0){
            return "<div style='width:100%; height:100%; background-color:#f1644d; '><b>"+value+"</b></div>";
        }
        return value;
    }

    cf.deleteWorker     = function(delInfo){

        var items = delInfo.grid.selection.getSelected();
        if(items.length){
            dijit.byId('componentsMainToaster').setContent(delInfo.message,'message',components.Const.toasterInfo);
            var itemList =[];
            dojo.forEach(
                            items,
                            function(selectedItem) {
                            if(selectedItem !== null) {
                                var id = delInfo.grid.store.getValue(selectedItem,'id');
                                itemList.push(id);
                            }
                        });
            _doSelection(delInfo.grid,delInfo.message,delInfo.url,itemList,delInfo.reload);
        }else{
            dijit.byId('componentsMainToaster').setContent('No Selection made','error',components.Const.toasterError);
        }
    }

    _doSelection    = function(grid,message,urlToCall,itemList,rl_function){

         dojo.xhrGet({
                url: urlToCall,
                preventCache: true,
                content: itemList,
                handleAs: "json",
                load: function(response){

                    //console.log(response);
                    if(response.json.status == 'ok'){

                        //------------------------------------------------------
                        rl_function();
                        //---------------------------------------------------
                        dijit.byId('componentsMainToaster').setContent(message+' Complete','message',components.Const.toasterInfo);
                    };
                    if(response.json.status == 'error'){
                        dijit.byId('componentsMainToaster').setContent(response.json.detail,'error');
                    }
                }
        });
    }
})();

}
