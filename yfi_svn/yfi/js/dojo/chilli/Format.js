dojo.provide('chilli.Format');

dojo.require('chilli.Translator');
dojo.require('chilli.Ui');
/*
 Format Module
 */

if(!dojo._hasResource["chilli.Format"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
(function(){

    var cf      = chilli.Format;
    var tr      = chilli.Translator;

    cf.time   = function ( t , zeroReturn ) {

        if ( typeof(t) == 'undefined' ) {
            return tr.tr({'module': 'Chilli','phrase':'Not available','lang':chilli.Ui.lang});
        }

        t = parseInt ( t , 10 ) ;
        if ( (typeof (zeroReturn) !='undefined') && ( t === 0 ) ) {
            return zeroReturn;
        }

        var h = Math.floor( t/3600 ) ;
        var m = Math.floor( (t - 3600*h)/60 ) ;
        var s = t % 60  ;

        var s_str = s.toString();
        if (s < 10 ) { s_str = '0' + s_str;   }

        var m_str = m.toString();
        if (m < 10 ) { m_str= '0' + m_str;    }

        var h_str = h.toString();
        if (h < 10 ) { h_str= '0' + h_str;    }

        if      ( t < 60 )   { return s_str + 's' ; }
        else if ( t < 3600 ) { return m_str + 'm' + s_str + 's' ; }
        else                 { return h_str + 'h' + m_str + 'm' + s_str + 's'; }
    };

    cf.bytes = function ( b , zeroReturn ) {

	if(b == 'NA'){
		return b;
	}

        if ( typeof(b) == 'undefined' ) {
            b = 0;
        } else {
            b = parseInt ( b , 10 ) ;
        }

        if ( (typeof (zeroReturn) !='undefined') && ( b === 0 ) ) {
            return zeroReturn;
        }
        var kb = Math.round(b/1024);
        if (kb < 1) return b  + ' '+tr.tr({'module': 'Chilli','phrase':'Bytes','lang':chilli.Ui.lang});

        var mb = Math.round(kb/1024);
        if (mb < 1)  return kb + ' '+tr.tr({'module': 'Chilli','phrase':'Kilobytes','lang':chilli.Ui.lang});

        var gb = Math.round(mb/1024);
        if (gb < 1)  return mb + ' '+tr.tr({'module': 'Chilli','phrase':'Megabytes','lang':chilli.Ui.lang});

        return gb + ' '+tr.tr({'module': 'Chilli','phrase':'Gigabytes','lang':chilli.Ui.lang});
    };

})();//(function(){
}

