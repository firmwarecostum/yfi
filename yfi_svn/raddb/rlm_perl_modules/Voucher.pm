package Voucher;

use strict;
use warnings;
use Data::Dumper;
use POSIX;


#Initialise this with a sql_connector object
sub new {

    print "   Voucher::new called\n";
    my $type = shift;            # The package/type name
    my $self = {'sql_connector' => shift};               # Reference to empty hash
    return bless $self, $type;
}


sub valid_check {
#-------------------------------------------------------
#-- Check username's voucher is still valid ------------
#-------------------------------------------------------
#Return undef if it is the first login
#Return a negative if the voucher expired
#Return a positive seconds value to show how much time is left of this voucher

    my($self,$voucher_name, $voucher_value) = @_;

    #Get the first time the user logged in with this voucher
    my $ft_login = $self->_get_first_login_time($voucher_name);

    if(!defined($ft_login)){
        #print "First login for this voucher....calculate cut-off time\n";
        return;
    }else{
        #print "Voucher used before ... recalculating cut-off time for $ft_login\n";
        return $self->_check_if_still_valid($ft_login,$voucher_value);
    }
}

sub expire_value {
#------------------------------------------------------------
#-- Calculate the return value of the kick off time for------
#-- the voucher ---------------------------------------------
#------------------------------------------------------------
    my ($self,$voucher_name,$voucher_value) = @_;
    #Get the first time the user logged in with this voucher (if at all)

    my $ft_login = $self->_get_first_login_time($voucher_name);
    if(!defined($ft_login)){
        #print "First login for this voucher....calculate cut-off time\n";
        
        my $t = time;
        return $self->_get_terminate_time_string($t,$voucher_value);
        
    }else{
        #print "Voucher used before ... recalculating cut-off time for $ft_login\n";
        return $self->_get_terminate_time_string($ft_login,$voucher_value);
    }

}

sub check_expiry_date {

    my ($self,$voucher_expiry_date,$dynamic_expiry_date) = @_;

    my $voucher_expiry_time = $self->_timestamp_for_wisp($voucher_expiry_date);
    my $dynamic_expiry_time = $self->_timestamp_for_wisp($dynamic_expiry_date);

    if($voucher_expiry_time < $dynamic_expiry_time){        #If the voucher_expiry_time is smaller => the voucher already expired 

        return 1;
    }
    return 0;
}


# ______ PART OF A PROVE OF CONCEPT WIP ________________
# sub voucher_check_for_existing_mac_reset {
# #---------------------------------------------------------------
# #-- Get all the accounting entries of this mac then check if ---
# #-- the user that logged into the machine was a voucher with ---
# #-- a 'Yfi-MAC-Reset' attribute ---------------------------
# #-- Then check if this attribute is still valid (IE preventing--
# #-- another voucher with 'Yfi-MAC-Reset' present) ---------
# #---------------------------------------------------------------
# 
#     my($mac_addy,$voucher_name) = @_;
# 
#     print "Searching for previous entries of $mac_addy\n";
#     my $mac_reset_value;
#     my $mac_reset_voucher;
#     my $query_string    = "SELECT DISTINCT username FROM radacct WHERE nasipaddress='$mac_addy'";
#     my $return_data     = do_sql_query($query_string);
#     print Dumper($return_data);
#     foreach my $entry(@{$return_data}){
#     
#         print "Searching for a MAC-Reset in profile\n";
#         my $username    = $entry->[0];
#         my $check_hash  = check_attributes($username);
#         if(defined($check_hash->{'Yfi-MAC-Reset'})){
# 
#             print "Found a profile containing 'MAC-Reset': $username\n";
#             #Get the last entry for 'Yfi-MAC-Reset' this is the one we neet to check
#             $mac_reset_value    = $check_hash->{'Yfi-MAC-Reset'};
#             $mac_reset_voucher  = $username;
#         }
#     }
# 
#     #Check if mac_reset were triggered
#     if(defined $mac_reset_value){
# 
#         #Code to be completed - part of a Prove Of Concept.
#         print "Determine the Reset time for previous voucher $mac_reset_voucher : value $mac_reset_value\n";
# 
#     }else{
# 
#         return;
#     }
# }


sub _get_terminate_time_string {
    #WISPr-Session-Terminate-Time: 2001-12-18T19:00:00+00:00
    my ($self,$t,$voucher_value) = @_;

    my $terminate_time_string;
    my($v_day,$v_hours,$v_minutes,$v_seconds)= split(/-/,$voucher_value);

    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=gmtime($t);
    my $new_time = mktime (($sec+$v_seconds), ($min+$v_minutes), ($hour+$v_hours), ($mday+$v_day), $mon, $year, 0, 0);
    ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime($new_time);
    $terminate_time_string = sprintf "%4d-%02d-%02d"."T"."%02d:%02d:%02d",($year+1900),($mon+1),$mday,$hour,$min,$sec;
    return $terminate_time_string;

}

sub _get_first_login_time {

    my ($self,$username) = @_;

    my $return_data  = $self->{'sql_connector'}->one_statement_value('radacct_time_username',$username);
    print Dumper($return_data);
    my $ft_login;
    if(exists $return_data->{'acctstarttime'}){
            $ft_login = $return_data->{'acctstarttime'};
    }
    return $ft_login;
}

sub _check_if_still_valid {
    my($self,$ft_login,$voucher_value)= @_;
    #take the fisrt login time, add the voucher value and check that it is still LARGER than NOW.
    my ($ft_sec,$ft_min,$ft_hour,$ft_mday,$ft_mon,$ft_year,$ft_wday,$ft_yday,$ft_isdst) = localtime($ft_login);
    my($v_day,$v_hours,$v_minutes,$v_seconds)= split(/-/,$voucher_value);
    my $voucher_valid_until = mktime (($ft_sec+$v_seconds), ($ft_min+$v_minutes), ($ft_hour+$v_hours), ($ft_mday+$v_day), $ft_mon, $ft_year, 0, 0);
    my $valid_calc = $voucher_valid_until - time;
    return $valid_calc;
}


#-------------------------------------------
#---- Sub that will return a timestamp for--
#---- WISPr-Session-Terminate-Time ---------
#-------------------------------------------

sub _timestamp_for_wisp {

    my ($self,$wisp_term_string) = @_;

    #explode this string
    my @day_time    = split('T', $wisp_term_string);

    my @y_m_d       = split('-',$day_time[0]);
    my $year        = $y_m_d[0];
    my $month       = $y_m_d[1];
    my $day         = $y_m_d[2];

    
    my @h_m_s       = split(':',$day_time[1]);
    my $hour        = $h_m_s[0];
    my $minute      = $h_m_s[1];
    my $second      = $h_m_s[2];
    $second         =~ s/\+.+//;

    #print ("Y $year ,M $month ,D $day ,H $hour ,M $minute ,S $second\n");

    my $expiry_time = mktime($second,$minute,$hour,$day,($month-1),($year-1900),0,0);
    return $expiry_time;
}

1;
