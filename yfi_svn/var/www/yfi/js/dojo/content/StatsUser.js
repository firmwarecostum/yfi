/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/




if(!dojo._hasResource["content.StatsUser"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["content.StatsUser"] = true;
dojo.provide("content.StatsUser");

dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('dojox.data.QueryReadStore');
dojo.require('components.Translator');
dojo.require('components.Formatters');

(function(){

    var csu             = content.StatsUser;
    var tr              = components.Translator; 
    var l               = components.LoginLight.UserInfo.l_iso;
    var urlRealmStats   = components.Const.cake+'radaccts/json_stats/?';
    var query           = {'username':'*'};

    var StartOfMonth;
    var EndOfMonth;
    var startDate;
    var endDate;

    var grid;
    

    csu.create  = function(divParent){

        //-----Start and End of this month ----
        var today = new Date();
        var MonthDays = new Array(31,28,31,30,31,30,31,31,30,31,30,31);
        var theYear = today.getYear();
        if (theYear < 1000){
            theYear +=1900;
        }

        StartOfMonth = new Date(theYear,today.getMonth(),1);
        var Month       = today.getMonth();
        var DaysInMonth = MonthDays[today.getMonth()];

        if (today.getMonth() == 1) {
            // February
            if (theYear%400==0 || (theYear%4 == 0 && theYear%100!=0) ){
                DaysInMonth +=1;
            }
        }
        EndOfMonth  = new Date(theYear,today.getMonth(),DaysInMonth);
        //------------------------------------

        var divGridAction     = document.createElement('div');
        dojo.addClass(divGridAction, 'divGridAction');

             //--------------------Action Part --------------------
            var divActions = document.createElement("div");
            dojo.addClass(divActions, "divActions");
                //Add the action stuff
                components.QElements.addAction({Name:tr.tr({'module': 'StatsUser','phrase':"Reload List",'lang':l}),Type:'reload',Parent: divActions,Action:csu['reload'],Id:null});
        dojo.place(divActions,divGridAction);


            //-------------------Filter + Refresh------------------------
            var filter = document.createElement('span');
            filter.innerHTML ='<b>'+tr.tr({'module': 'Users','phrase':"Filter",'lang':l})+'</b>';
            dojo.place(filter, divGridAction);
            var filter_val = new dijit.form.TextBox({name: 'Filter', trim: true, style: "width: 140px;"},document.createElement("div"));

            dojo.connect(filter_val,'onKeyUp',function(e){
                    var filterOn = filter_on.attr('value');
                    console.log("The value to filter..."+ filterOn);
                    var val = filter_val.attr('value');

                    query = {'username' : val+'*'};
                    if(filterOn == 'profile'){
                       query = {'profile' : val+'*'};
                    }
                    if(filterOn == 'realm'){
                       query = {'realm' : val+'*'};
                    }
                    grid.setQuery(query);
            });


            dojo.place(filter_val.domNode, divGridAction);



            var spanField  = document.createElement('span');
            spanField.innerHTML = '<b>'+tr.tr({'module': 'Users','phrase':"Field",'lang':l})+'</b>';
            dojo.place(spanField,divGridAction);
            
                var data = {data: {
                        identifier : 'id',
                        label: 'label',
                        items : [
                                { id : 'username',  label: tr.tr({'module': 'Users','phrase':"Username",'lang':l}),selected:'selected' },
                                { id : 'realm',     label: tr.tr({'module': 'Users','phrase':"Realm",'lang':l}) }
                                ]}};
            var myNewStore=new dojo.data.ItemFileReadStore(data);
            
            var filter_on = new dijit.form.FilteringSelect({
                                                                    value   :"username",
                                                                    name    :"state", 
                                                                    searchAttr: "name",
                                                                    store   :myNewStore,
                                                                    searchAttr  :"label",
                                                                    style: "width: 140px;"}, document.createElement("div"));
            
            dojo.place(filter_on.domNode,divGridAction);
            //-----------------------------------------------------------


            //-------------------Dates------------------------
            var sd = document.createElement('span');
            sd.innerHTML ='<b>'+tr.tr({'module': 'StatsUser','phrase':"Start Date",'lang':l})+'</b>';
            dojo.place(sd, divGridAction);

            startDate = new dijit.form.DateTextBox({required:true,name: 'startDate'},document.createElement("div"));
            dojo.place(startDate.domNode, divGridAction);
            startDate.setValue(StartOfMonth);

            dojo.connect(startDate, 'onChange',function(e){
                _changeDate();
            });

            var ed  = document.createElement('span');
            ed.innerHTML = '<b>'+tr.tr({'module': 'StatsUser','phrase':"End Date",'lang':l})+'</b>';;
            dojo.place(ed,divGridAction);

            endDate = new dijit.form.DateTextBox({required:true,name: 'endDate'},document.createElement("div"));
        dojo.place(endDate.domNode, divGridAction);
            endDate.setValue(EndOfMonth);

            dojo.connect(endDate, 'onChange',function(e){
                _changeDate();
            });


            //----------------------------------------------------
                var divResults      = document.createElement("div");
                dojo.addClass(divResults, "divGridResults");
        dojo.place(divResults,divGridAction);
            //-----------------------------------------------------------

        dojo.place(divGridAction,divParent);

     
        
        setTimeout(function () {

            var contentBox = dojo.contentBox(divParent);
            var hight = (contentBox.h-92)+'';
            var s = "height: "+hight+"px ; padding: 20px";

             var cpExp   =   new dijit.layout.ContentPane({
                                style:      s
                            },document.createElement("div"));
            dojo.place(cpExp.domNode,divParent);

            //----Grid Start----------------
                 var layout = [
                            { field: "username",        name: tr.tr({'module': 'StatsUser','phrase':"Username",'lang':l}),  width: 'auto' },
                            { field: "realm",           name: tr.tr({'module': 'StatsUser','phrase':"Realm",'lang':l}),     width: 'auto'},
                            { field: "acctstarttime",   name: tr.tr({'module': 'StatsUser','phrase':"Start",'lang':l}),     width: 'auto'},
                            { field: "acctstoptime",    name: tr.tr({'module': 'StatsUser','phrase':"Stop",'lang':l}),      width: 'auto'},
                            { field: "acctsessiontime", name: tr.tr({'module': 'StatsUser','phrase':"Time Total",'lang':l}),width: 'auto'},
                            { field: "acctinputoctets", name: tr.tr({'module': 'StatsUser','phrase':"Data TX",'lang':l}),   width: 'auto',formatter: components.Formatters.FormatOctets},
                            { field: "acctoutputoctets",name: tr.tr({'module': 'StatsUser','phrase':"Data RX",'lang':l}),   width: 'auto',formatter: components.Formatters.FormatOctets},
                            { field: "total_octets",    name: tr.tr({'module': 'StatsUser','phrase':"Data Total",'lang':l}),width: 'auto',formatter: components.Formatters.FormatOctets}
                        ];

                grid = new dojox.grid.DataGrid({
                                structure: layout,
                                rowsPerPage: 40,
                                rowSelector: '10px'
                                }, document.createElement("div"));

                     dojo.connect(grid,'_onFetchComplete', function(){

                            //Check if the restart flag is present
                             divResults.innerHTML = "<b>"+tr.tr({'module': 'StatsUser','phrase':"Result count",'lang':l})+": </b>"+ grid.rowCount;
                        })

                  dojo.addClass(grid.domNode,'divGrid');
                  dojo.place(grid.domNode,cpExp.domNode);
                  grid.startup();

                  var ts = Number(new Date());
                  csu.reload();
            //---- END Grid----------------
        },100);
    }

    csu.reload  = function(){
        if(grid != undefined){  //Because when setting the date, it may fire this, but then the grid is not defined yet
            var ts = Number(new Date());
            var som     = startDate.getValue().getTime()/1000;
            var eom     = endDate.getValue().getTime()/1000;
            //var jsonStore = new dojo.data.ItemFileReadStore({ url: urlRealmStats+'sd='+som+'&ed='+eom+'&ts='+ts });
            var jsonStore = new dojox.data.QueryReadStore({ url: urlRealmStats+'sd='+som+'&ed='+eom+'&ts='+ts  });
            grid.setStore(jsonStore,query,{ignoreCase: true});
        }
    }

    function _changeDate(){
        if(dojo.date.compare(endDate.getValue(),startDate.getValue()) > 0){
            csu.reload();
        }else{
            dijit.byId('componentsMainToaster').setContent('<b>'+tr.tr({'module': 'StatsNas','phrase':"Invalid Dates - Using Defaults",'lang':l})+'</b>','error',components.Const.toasterError);
            startDate.setValue(StartOfMonth);
            endDate.setValue(EndOfMonth);
        }
    }


})();//(function(){

}
