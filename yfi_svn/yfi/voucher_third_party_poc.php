<?
    //Define some values to use
    //key=123456789&voucher_value=1-00-00-00&profile=Voucher+10M+CAP&expires=01-07-2010&precede=sms&realm=Residence+Inn
    $key    = '123456789';
    $value  = '1-00-00-00';
    $profile= 'Voucher 10M CAP';
    $expires= '2010-07-01';
    $precede= 'sms';
    $realm  = 'Residence Inn';
?>


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
  "http://www.w3.org/TR/html4/loose.dtd">
<html>
  <head> 
    <title>YFi Hotspot JSON Login Page</title>
    <link href="img/logo.ico" type="image/x-icon" rel="icon"/><link href="img/logo.ico" type="image/x-icon" rel="shortcut icon"/>
    <style type="text/css">
      @import "js/dojo/dojo/resources/dojo.css";
      @import "js/dojo/dijit/themes/tundra/tundra.css";
    </style>
    <script type="text/javascript" src="js/dojo/dojo/dojo.js" djConfig="parseOnLoad: true"></script>
    <script>
         dojo.addOnLoad(function() {

            console.log("Dojo loaded OK");
            dojo.connect(dojo.byId('btnVoucher'),'onclick',function(){
                console.log("Create Voucher Clicked");
                dojo.byId('frmVoucher').submit();
            })
        })
    </script>
  </head>
  <body bgcolor="#FFFFFF">
    <div id='feedback' style="height:200px; width:400px; background:#d2e5d0; padding:20px; margin: 20px; border: 1px solid #000">
    <?
        if(array_key_exists('button', $_GET)){
            print "<h2>Voucher generated</h2>\n";
            $query_string = "http://127.0.0.1/c2/yfi_cake/third_parties/json_create_voucher/?".
                            "key=".$key.'&voucher_value='.$value.'&profile='.urlencode($profile).'&expires='.$expires.'&precede='.$precede.'&realm='.urlencode($realm);

            $fb = exec("wget -q -O - '".$query_string."'");
            //--- Sanitize the feedback a bit ------
            $fb = preg_replace("/^\(/","",$fb);
            $fb = preg_replace("/\)/","",$fb);
            $fb = preg_replace("/;/","",$fb);
            $json_array = json_decode($fb,true);

            if($json_array['json']['status'] == 'ok'){
                echo "<b>Voucher id </b>".$json_array['voucher']['id']."<br>\n";
                echo "<b>Voucher username </b>".$json_array['voucher']['username']."<br>\n";
                echo "<b>Voucher password </b>".$json_array['voucher']['password']."<br>\n";
            }
        }
    ?>
    </div>
    <div style="padding:20px; margin: 20px;">
        <form action="voucher_third_party_poc.php" method="get" id='frmVoucher'>
        <input type="hidden" name="button" value="clicked" />
        <button id='btnVoucher'>Create Voucher</button>
        </form>
    </div>
  </body>
</html>
