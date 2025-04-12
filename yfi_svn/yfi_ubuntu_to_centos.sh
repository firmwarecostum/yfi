#!/bin/bash

#-------------------------------------------
#---- Script to change Ubuntu specifics ----
#---- to CentOS specifics ------------------
#-------------------------------------------

function usr_local_etc_to_etc(){
        echo "Change /usr/local/etc to /etc for" $1
        sed 's|/usr/local/etc|/etc|g' $1 > $1.tmp;mv $1.tmp $1;
}

function usr_local_share_to_usr_share(){
        echo "Change /usr/local/share to /usr/share for" $1
        sed 's|/usr/local/share|/usr/share|g' $1 > $1.tmp;mv $1.tmp $1;
}

function var_www_c2_to_www_c2(){
        echo "Change /var/www/c2 to /www for" $1
        sed 's|/var/www/c2|/www/c2|g' $1 > $1.tmp;mv $1.tmp $1;
}

function radclient_fix(){
        echo "Change /usr/local/bin/radclient to /usr/bin/radclient for" $1
        sed 's|/usr/local/bin/radclient|/usr/bin/radclient|g' $1 > $1.tmp;mv $1.tmp $1;
}

function etc_raddb_to_etc_freeradius2(){
        echo "Change /etc/raddb to /etc/freeradius2 for" $1
        sed 's|/etc/raddb|/etc/freeradius2|g' $1 > $1.tmp;mv $1.tmp $1;
}

function usr_share_freeradius_to_usr_share_freeradius2(){
        echo "Change /usr/share/freeradius to /usr/share/freeradius2 for" $1
        sed 's|/usr/share/freeradius|/usr/share/freeradius2|g' $1 > $1.tmp;mv $1.tmp $1;
}

function var_www_c2_plugin_messages.po_to_www_c2_plugin_messages.po(){
        echo "Change /var/www/c2 to /www for" $1
        sed 's|/var/www/c2|/www/c2|g' $1 > $1.tmp;mv $1.tmp $1;
}

function var_www_html_c2_plugin_messages.po_to_www_c2_plugin_messages.po(){
        echo "Change /var/www/html/c2 to /www for" $1
        sed 's|/var/www/html/c2|/www/c2|g' $1 > $1.tmp;mv $1.tmp $1;
}

function var_www_to_www(){
        echo "Change /var/www to /www for" $1
        sed 's|/var/www|/www|g' $1 > $1.tmp;mv $1.tmp $1;
}

file_list[0]="yfi_cake/config/yfi.php"
file_list[1]="raddb/rlm_perl_modules/conf/settings.conf"
file_list[2]="raddb/rlm_perl_modules/Attributes.pm"
file_list[3]="raddb/rlm_perl_modules/rlm_perl.pm"
file_list[4]="raddb/rlm_perl_modules/sqlcounter.conf"
file_list[5]="raddb/rlm_perl_modules/SQLCounter.pm"
file_list[6]="raddb/rlm_perl_modules/Telkom.pm"
file_list[7]="raddb/rlm_perl_modules/User.pm"
file_list[8]="raddb/rlm_perl_modules/Voucher.pm"
file_list[9]="raddb/rlm_perl_modules/Devices.pm"
file_list[10]="raddb/rlm_perl_modules/Nas.pm"
file_list[11]="raddb/dictionary"
file_list[12]="yfi_cake/webroot/files/radscenario.pl"
file_list[13]="yfi_cake/plugins/locale/*/*/messages.po"
file_list[14]="yfi_cake/plugins/locale/fa_IR/LC_MESSAGES/messages.po"
file_list[15]="yfi_cake/plugins/locale/it_IT/LC_MESSAGES/messages.po"
file_list[16]="yfi_cake/plugins/locale/translations/create_po_file.pl"
file_list[17]="yfi_cake/plugins/locale/translations/messages.po"
file_list[18]="yfi_cake/controllers/*.php"
file_list[19]="yfi_cake/webroot/files/*.php"
file_list[20]="yfi_cake/tmp/cache/persistent/cake_core_core_paths"

for i in  ${file_list[@]}
do
        usr_local_etc_to_etc $i
        usr_local_share_to_usr_share $i
        var_www_c2_to_www_c2 $i
        radclient_fix $i
        etc_raddb_to_etc_freeradius2 $i
        usr_share_freeradius_to_usr_share_freeradius2 $i
        var_www_c2_plugin_messages.po_to_www_c2_plugin_messages.po $i
        var_www_html_c2_plugin_messages.po_to_www_c2_plugin_messages.po $i
        var_www_to_www $i
done

