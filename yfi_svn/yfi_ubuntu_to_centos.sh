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

function etc_raddb_rlm_perl_modules_to_etc_freeradius2_rlm_perl_modules(){
        echo "Change /etc/raddb/rlm_perl_modules to /etc/freeradius2/rlm_perl_modules for" $1
        sed 's|/etc/raddb/rlm_perl_modules|/etc/freeradius2/rlm_perl_modules|g' $1 > $1.tmp;mv $1.tmp $1;
}

function usr_share_freeradius_to_usr_share_freeradius2(){
        echo "Change /usr/share/freeradius to /usr/share/freeradius2 for" $1
        sed 's|/usr/share/freeradius|/usr/share/freeradius2|g' $1 > $1.tmp;mv $1.tmp $1;

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

for i in  ${file_list[@]}
do
        usr_local_etc_to_etc $i
        usr_local_share_to_usr_share $i
        var_www_c2_to_www_c2 $i
        radclient_fix $i
        etc_raddb_rlm_perl_modules_to_etc_freeradius2_rlm_perl_modules $i
        usr_share_freeradius_to_usr_share_freeradius2 $i
done

