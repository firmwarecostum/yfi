<?php
//The groups that is defined 
$config['group']['admin']   = 'Administrators';     //Has all the rights
$config['group']['ap']      = 'Access Providers';   //Has selected right
$config['group']['user']    = 'Users';              //Has very limited rights
$config['freeradius']['back_off_minutes']           = 15;
$config['freeradius']['path_to_dictionary_files']   = '/usr/share/freeradius222/';
$config['freeradius']['radclient']                  = '/usr/bin/radclient';
$config['freeradius']['main_dictionary_file']       = '/etc/freeradius2/dictionary';
$config['freeradius']['realms_file']                = '/etc/freeradius2/proxy.conf';
$config['freeradius']['radtest_script']             = '/www/c2/yfi_cake/webroot/files/radscenario.pl';
$config['realm']['icon_directory']                  = '/www/c2/yfi_cake/webroot/img/graphics/';
$config['pptpd']['start_ip']                        = '10.20.30.2';
$config['pptpd']['server_ip']                       = '10.20.30.1';
$config['pptpd']['chap_secrets']                    = '/etc/ppp/chap-secrets';
$config['pptpd']['yfi_nas_base_name']               = 'yfi_nas_';
$config['monitor']['ping_count']		            = 4;
$config['nas']['device_types']                      = array('other','CoovaChilli','CoovaChilli-AP','CoovaChilli-NAT','DD-Wrt','Open-Wrt','Mikrotik','Open-Wrt[Ent]','Telkom');
$config['permanent_users']['reset_day']             = 1; //Day of month to reset cap - must also change in redius perl module config file if change here and vice versa.

//The swift mailer email component's settings

$config['email']['from']                            = 'admin@yfi.co.za';
$config['email']['smtpHost']                        = 'smtp.mail.co.za';
$config['email']['smtpPort']                        = '25';
//Uncomment this when needed
//$config['email']['smtpUsername']                    = 'username_here';
//$config['email']['smtpPassword']                    = 'password_here';
//$config['email']['smtpEncryption']                  = 'tls'; //or 'ssl';

//Locale settings
$config['locale']['location']                       = '/www/c2/yfi_cake/plugins/locale';

//Google Maps link for:
$config['maps']['access_providers']                 = true;
$config['maps']['permanent_users']                  = true;

//Google Geocoding stuff
$config['geocode']['url']                           = 'http://maps.googleapis.com/maps/api/geocode/json';
$config['geocode']['country_code']                  = 'ZA';

//Show experimental menus
$config['experimental']['active']                   = true;

//Consider a heartbeat device dead after so many seconds
$config['heartbeat']['dead_after']                  = 660; //Eleven minutes

//The location of the mobile and normal login pages
$config['dynamic_login']['mobile']                 = '/coova_json/mobile.php';
#$config['dynamic_login']['standard']               = '/yfi/standard.php';
$config['dynamic_login']['standard']               = '/coova_json/hs_land.php';

//The maximum amount of seconds that an active accounting entry will be closed since the last update (removes stale sessions)
$config['stale_session']['close_after']             = 1200; //Close after 20 minutes without updates

//The default expiry date value for permanent users (when not specified)
$config['permanent_user']['expire_on']             = '2017-1-1'; //Year month day

//Some costing plans and time they buy: (move later to DB) plan and cost combination has to be unique
$config['costing']      = array(   
    array('cost' => '15.00', 'plan' => 'fast_10', 'time' => 864000),
    array('cost' => '20.00', 'plan' => 'fast_30', 'time' => 2592000),
    array('cost' => '35.00', 'plan' => 'fast_60', 'time' => 5184000)
    );

//List which profiles are free and which are fast
$config['profiles']['free'] = array('Permanent Free Internet');
$config['profiles']['fast'] = array('Permanent Fast Internet 2M');

$config['profiles']['upgrade_to'] = 'Permanent Fast Internet 2M';


//

?>
