#! /usr/bin/perl -w

use strict;
use POSIX;
use lib "/usr/local/etc/raddb/rlm_perl_modules";
use SQLCounter;
use Data::Dumper;
use XML::Simple;

#print Voucher::voucher_valid_check('alee',"1:00:00:00")."\n";
#my $voucher_value = "40:00:00:00";

#my $seconds =Voucher::voucher_valid_check('alee',$voucher_value);

#my $expire_value = Voucher::voucher_expire_value('alee',$voucher_value);
#print $expire_value;

#Voucher::voucher_and_mac_test('koos',$voucher_value);

#my ($remain_sec,$remain_min,$remain_hour,$remain_mday,$remain_mon,$remain_year,$remain_wday,$remain_yday,$remain_isdst)=localtime($seconds);

#print "TIME LEFT: $remain_yday Day(s) / $remain_hour Hour(s) / $remain_min Minute(s) and $remain_sec Second(s)\n";

#my($v_day,$v_hours,$v_minutes,$v_seconds)= split(/:/,$voucher_value);
#my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime(time);

#my $unixtime = mktime (($sec+$v_seconds), ($min+$v_minutes), ($hour+$v_hours), ($mday+$v_day), $mon, $year, 0, 0);

#my $readable_time = localtime($unixtime);
#print "$readable_time\n";

# my $term_string = "2001-12-18T19:00:00+00:00";
# #explode this string
# my @day_time    = split('T', $term_string);
# 
# my @y_m_d       = split('-',$day_time[0]);
# my $year        = $y_m_d[0];
# my $month       = $y_m_d[1];
# my $day         = $y_m_d[2];
# 
# 
# my @h_m_s       = split(':',$day_time[1]);
# my $hour        = $h_m_s[0];
# my $minute      = $h_m_s[1];
# my $second      = $h_m_s[2];
# $second         =~ s/\+.+//;
# 
# print ("Y $year ,M $month ,D $day ,H $hour ,M $minute ,S $second\n");
# 
# my $expiry_time = mktime($second,$minute,$hour,$day,($month-1),($year-1900),0,0);
# 
# print $expiry_time;


#my $new_time = mktime (($sec+$v_seconds), ($min+$v_minutes), ($hour+$v_hours), ($mday+$v_day), $mon, $year, 0, 0);
#    ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime($new_time);
    #$terminate_time_string = ($year+1900).'-'.($mon+1).'-'.$mday.'T'.$hour.':'.$min.':'.$sec.$time_zone;
#    $terminate_time_string = sprintf "%4d-%02d-%02d"."T"."%02d:%02d:%02d"."$time_zone",($year+1900),($mon+1),$mday,$hour,$min,$sec;

#print localtime("2001-12-18T19:00:00+00:00");



my $rv = sqlcounter_check('00001@ri',{'ChilliSpot-Max-Total-Octets' => '10737418240'});

print (Dumper($rv));

my $config_file = '/usr/local/etc/raddb/rlm_perl_modules/conf/settings.conf';
my $xml     = new XML::Simple;
my $data    = $xml->XMLin($config_file);

foreach my $keys(@{$data->{sql_counters}{'counter'}}){

    print Dumper($keys);
}
