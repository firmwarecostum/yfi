package Prime;

use strict;
use warnings;
use XML::Simple;
use Data::Dumper;
use POSIX;

use Attributes;

#===============================================================
#===== CONFIGURATION DATA ======================================
#===============================================================
my $config_file = '/etc/freeradius2/rlm_perl_modules/conf/settings.conf';
my $radclient = '/usr/bin/radclient';
#===============================================================
#===== END of Configuration Data ===============================
#===============================================================

my $debug = 0;

#Initialise this with a sql_connector object
sub new {

    print "   Prime::new called\n";
    my $type = shift;                       # The package/type name
    my $self = {'sql_connector' => shift, 'radclient' => $radclient, 'debug' => $debug };  # Reference to empty hash
    return bless $self, $type;
}

sub auth {

    my($self,$username) = @_;

    my $attributes          = Attributes->new($self->{'sql_connector'});
    my $check_attributes    = $attributes->check_attributes($username);

    if((!exists($check_attributes->{'Yfi-Prime-Start'}))&&(!exists($check_attributes->{'Yfi-Prime-End'}))){
        return 1; #Just pass it - it is not a prime time / normal time user
    }


    #==================================================================
    #====   Determine whether we are in prime or normal time ==========
    #==================================================================
    my $prime_flag = 0;    #Start with normal time

    my $now = time();
    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime($now);


    my($prime_start_hour,$prime_start_min)  = split(':',$check_attributes->{'Yfi-Prime-Start'});
    my($prime_end_hour,$prime_end_min)      = split(':',$check_attributes->{'Yfi-Prime-End'});

    my $prime_start_stamp   = mktime(0, $prime_start_min, $prime_start_hour, $mday, $mon, $year, $wday, $yday);
    my $prime_end_stamp     = mktime(0, $prime_end_min, $prime_end_hour, $mday, $mon, $year, $wday, $yday);

    #Deterimine the start and end of the day
    my $day_start_stamp     = mktime(0,0,0,$mday, $mon, $year, $wday, $yday);
    my $day_end_stamp       = mktime(59,59,23,$mday, $mon, $year, $wday, $yday);

    ($self->{'debug'})&&(print "PRIME: NOW ".localtime($now)." Start ".localtime($prime_start_stamp)." END ".localtime($prime_end_stamp)."\n");

    if(($now >= $prime_start_stamp) && ($now <= $prime_end_stamp)){
        $prime_flag = 1;
    }

    #Once the entry has been made/updated in the times table: check the quota (if applicable)
    if($prime_flag == 1){

        #Get total time and data usage for prime time period for user
        my($used_data, $used_time) = $self->_sql_get_prime_totals($username, $prime_start_stamp, $prime_end_stamp);
        if(exists($check_attributes->{'Yfi-Prime-Total-Octets'})){
            if($used_data >= $check_attributes->{'Yfi-Prime-Total-Octets'}){
                print "____________PRIME: Prime Data cap depleted\n";
                return "Prime data window depleted";
            }
        }
        if(exists($check_attributes->{'Yfi-Prime-Session'})){
            if($used_time >= $check_attributes->{'Yfi-Prime-Session'}){
                print "____________PRIME: Prime Time cap depleted\n";
                return "Prime time window depleted";
            }
        }
    }else{

        #Get total time and data usage for normal time period for user
        my($used_data, $used_time) = $self->_sql_get_normal_totals($username, $prime_start_stamp, $prime_end_stamp, $day_start_stamp, $day_end_stamp);
        if(exists($check_attributes->{'Yfi-Normal-Total-Octets'})){
            if($used_data >= $check_attributes->{'Yfi-Normal-Total-Octets'}){
                print "____________PRIME: Normal Data cap depleted\n";
                return "Normal data window depleted";
            }
        }
        if(exists($check_attributes->{'Yfi-Normal-Session'})){
            if($used_time >= $check_attributes->{'Yfi-Normal-Session'}){
                print "____________PRIME: Normal Time cap depleted\n";
                return "Normal time window depleted";
            }
        }
    }

    #Default PASS it
    return 1;
}


sub accounting {

    my($self,$rad_request) = @_;

    ($self->{'debug'})&&(print "PRIME: Do accounting\n");
    if($rad_request->{'Acct-Status-Type'} eq 'Start'){  #We do not bother with start account packets
        return;
    }

    #Get the check-attributes for the user
    my $attributes          = Attributes->new($self->{'sql_connector'});
    my $check_attributes    = $attributes->check_attributes($rad_request->{'User-Name'});
    #A valid prime user should have an attribute check pair of 'Yfi-Prime-Start' and 'Yfi-Prime-End'
    if(exists($check_attributes->{'Yfi-Prime-Start'})&&exists($check_attributes->{'Yfi-Prime-End'})){ 
        print "PRIME: Valid Prime user\n";
        $self->_accounting_worker($check_attributes,$rad_request);
    }
}

sub _accounting_worker {

    #pass it the hash with the check-attributes and the username
    my ($self,$check_attributes,$rad_request) = @_; 

    #==================================================================
    #====   Determine whether we are in prime or normal time ==========
    #==================================================================
    my $prime_flag = 0;    #Start with normal time

    my $now = time();
    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime($now);


    my($prime_start_hour,$prime_start_min)  = split(':',$check_attributes->{'Yfi-Prime-Start'});
    my($prime_end_hour,$prime_end_min)      = split(':',$check_attributes->{'Yfi-Prime-End'});

    my $prime_start_stamp   = mktime(0, $prime_start_min, $prime_start_hour, $mday, $mon, $year, $wday, $yday);
    my $prime_end_stamp     = mktime(0, $prime_end_min, $prime_end_hour, $mday, $mon, $year, $wday, $yday);

    #Deterimine the start and end of the day
    my $day_start_stamp     = mktime(0,0,0,$mday, $mon, $year, $wday, $yday);
    my $day_end_stamp       = mktime(59,59,23,$mday, $mon, $year, $wday, $yday);

    ($self->{'debug'})&&(print "PRIME: NOW ".localtime($now)." Start ".localtime($prime_start_stamp)." END ".localtime($prime_end_stamp)."\n");

    if(($now >= $prime_start_stamp) && ($now <= $prime_end_stamp)){
        $prime_flag = 1;
    }

    #_____________________________________________________________________

    #======================================================================
    #====  Check if there is an entry for acctsessionid  ==================
    #====  Entry has to be in the current time slot =======================
    #======================================================================
    #Dummy Data
    my $asid    = $rad_request->{'Acct-Session-Id'};
    my $time    = $rad_request->{'Acct-Session-Time'};
    my $data    = $rad_request->{'Acct-Input-Octets'} + $rad_request->{'Acct-Output-Octets'};
    my $username= $rad_request->{'User-Name'};

    #If we are in prime time
    my $query_string;
    if($prime_flag ==1){
        $query_string =  "SELECT id FROM times WHERE username='$username' AND acctsessionid='$asid' AND type='Prime'".
                         " AND UNIX_TIMESTAMP(created) >= $prime_start_stamp AND UNIX_TIMESTAMP(created) <= $prime_end_stamp";
    }else{  # We are out of prime time - It can either be BEFORE or AFTER prime time

        #We have to determine if we are in time BEFORE last prime time and THIS prime time
        my $previous_end_stamp = $prime_end_stamp - 86400; #One day = 86400 seconds
        #Check if we in slot BEFORE Prime time
        if($now >= $prime_end_stamp){ #We are AFTER prime time
            $query_string =  "SELECT id FROM times WHERE username='$username' AND acctsessionid='$asid' AND type='Normal'".
                         " AND UNIX_TIMESTAMP(created) >= $prime_end_stamp AND UNIX_TIMESTAMP(modified) <= $day_end_stamp"; #Time from prime time end until current day ends
        }else{ #We are BEFORE prime time
            $query_string = "SELECT id FROM times WHERE username='$username' AND acctsessionid='$asid' AND type='Normal'".
                            " AND ((UNIX_TIMESTAMP(created) >= $day_start_stamp AND UNIX_TIMESTAMP(created) <= $prime_start_stamp))"; #Time from start of current day until prime time starts
        }
    }

    my $times_entry       =  $self->{'sql_connector'}->query($query_string);
    
    print Dumper($times_entry);
    if($times_entry->[0][0]){
        print "PRIME: Existing Entry to update!\n";
        my($d,$t)= $self->_sql_get_time_and_data($asid,$data,$time);
        $self->_sql_update_times_entry($asid,$d,$t);

    }else{  #No entry yet for this $asid in this slot - create one
        print "PRIME: Create New entry for acctsessionid\n";
        my $type = 'Normal';    #Start with normal time by default
        ($prime_flag)&&($type = 'Prime');
        #Get the time and data which has to be listed for this entry
        my($d,$t)= $self->_sql_get_time_and_data($asid,$data,$time,1);
        $self->_sql_add_times_entry($asid,$username,$d,$t,$type);
    }

    #Once the entry has been made/updated in the times table: check the quota (if applicable)
    if($prime_flag == 1){

        #Get total time and data usage for prime time period for user
        my($used_data, $used_time) = $self->_sql_get_prime_totals($username, $prime_start_stamp, $prime_end_stamp);
        if(exists($check_attributes->{'Yfi-Prime-Total-Octets'})){
            if($used_data >= $check_attributes->{'Yfi-Prime-Total-Octets'}){
                print "____________PRIME: Prime Data cap depleted\n";
                $self->_kick_user_off($rad_request);
            }
        }
        if(exists($check_attributes->{'Yfi-Prime-Session'})){
            if($used_time >= $check_attributes->{'Yfi--Prime-Session'}){
                print "____________PRIME: Prime Time cap depleted\n";
                $self->_kick_user_off($rad_request);
            }
        }
    }else{

        #Get total time and data usage for normal time period for user
        my($used_data, $used_time) = $self->_sql_get_normal_totals($username, $prime_start_stamp, $prime_end_stamp, $day_start_stamp, $day_end_stamp);
        if(exists($check_attributes->{'Yfi-Normal-Total-Octets'})){
            if($used_data >= $check_attributes->{'Yfi-Normal-Total-Octets'}){
                print "____________PRIME: Normal Data cap depleted\n";
                $self->_kick_user_off($rad_request);
            }
        }
        if(exists($check_attributes->{'Yfi-Normal-Session'})){
            if($used_time >= $check_attributes->{'Yfi-Normal-Session'}){
                print "____________PRIME: Normal Time cap depleted\n";
                $self->_kick_user_off($rad_request);
            }
        }
    }
}

sub _kick_user_off {

    my($self,$acct_detail) = @_;
    #print Dumper($acct_detail);

    my $radclient   = $self->{'radclient'};

    #Get the detail of the NAS device which send us this request
    my $ip          = $acct_detail->{'NAS-IP-Address'};
    my $username    = $acct_detail->{'User-Name'};
    my $nasportid   = $acct_detail->{'NAS-Port-Id'};                #Need these for the Mikrotik
    my $framedipaddress     = $acct_detail->{'Framed-IP-Address'};
    my $mac         = $acct_detail->{'Calling-Station-Id'};

    ($ip eq '0.0.0.0')&&($ip = '127.0.0.1'); #A Chillispot work-a-around

    my $return_data  = $self->{'sql_connector'}->one_statement_value('na_nasname',$ip);
    my $type        = $return_data->{'type'};
    my $port        = $return_data->{'ports'};
    my $secret      = $return_data->{'secret'};
    my $device_flag = 0;

    #-----------------------------------------------------------------------------------------------------------------------------------------------
    #---- MAC Authentication add-on: MAC authenticated devices are authenticated to RADIUS as the Permanent user to which the Device belongs -------
    #---- But on the NAS device as the MAC of the device connecting to the Internet thus we have to replace the permanent username with the MAC ----
    #---- in the event that such a device is declared ----------------------------------------------------------------------------------------------
    #-----------------------------------------------------------------------------------------------------------------------------------------------

    my $rd  = $self->{'sql_connector'}->one_statement_value('device_name',$mac);
    if(exists $rd->{'id'}){
        $device_flag =1;    #MAC is NOT in devices table
    }
    #------------------------------------------------------------------------------------------------------------------------------------------------


    #____________Chillispot_____________________
    if($type =~ m/chilli/i){

        print "-> Disconnecting User Form Chilli Type of Device\n";
        if($device_flag == 1){  #If the Device is part of the MAC devices - first try and disconnect it as a device
            system("echo \"User-Name = $mac\" | $radclient -r 2 -t 2 $ip:$port 40 $secret");    
        }
        system("echo \"User-Name = $username\" | $radclient -r 2 -t 2 $ip:$port 40 $secret");
    }

    #___________Mikrotik____________________________
     if($type =~ m/mikrotik/i){

        print "-> Disconnecting User Form Mikrotik Type of Device\n";
        if($device_flag == 1){  #If the Device is part of the MAC devices - first try and disconnect it as a device
            system("echo \"User-Name = $mac,Framed-IP-Address= $framedipaddress\" | $radclient -r 2 -t 2 $ip:$port disconnect $secret");    
        }
        system("echo \"User-Name = $username,Framed-IP-Address= $framedipaddress\" | $radclient -r 2 -t 2 $ip:$port disconnect $secret");
    }
}


sub _sql_add_times_entry {

    #_____________________________________________________________
    #-Sub which is suppose to do things the correct way for DBI---
    #_____________________________________________________________

    my($self,$acctsessionid,$username,$data,$time,$type) =@_;
    $self->{'sql_connector'}->no_return_five_values('add_times_entry',$acctsessionid,$username,$time,$data,$type);
    return;
}


sub _sql_update_times_entry {

    #_____________________________________________________________
    #-Sub which is suppose to do things the correct way for DBI---
    #_____________________________________________________________
    my($self,$acctsessionid,$data,$time) =@_;
    my $return_data  = $self->{'sql_connector'}->one_statement_value('times_last_entry',$acctsessionid);
    $self->{'sql_connector'}->no_return_three_values('update_times_entry',$time,$data, $return_data->{'id'});
    return;
}

sub _sql_get_time_and_data {
    # Sub which will take a look at all entries for an $asid and calculate the time and data for this new session id
    my($self,$acctsessionid,$data,$time,$new_flag) = @_;

    #--------------------------------
    #if $new_flag - we calculate ALL of the entrie's time and data values - cause we start a net slot for acctsessionid
    #-------------------------------
    if($new_flag){
        my $sums   = $self->{'sql_connector'}->query("SELECT SUM(data), SUM(time) FROM times where acctsessionid='$acctsessionid' ORDER BY id ASC");
        my $d           = 0;
        my $t           = 0;
        (defined($sums->[0][0]))&&($d = $sums->[0][0]);
        (defined($sums->[0][1]))&&($t = $sums->[0][1]);
        return (($data-$d),($time-$t));
    }

    #------------------------------------
    #if ! $new_flag - we leave out the last one ( cause that will be the one we are updating)
    #----------------------------------
    if(!$new_flag){
        my $sums   = $self->{'sql_connector'}->query("SELECT data, time FROM times where acctsessionid='$acctsessionid' ORDER BY id ASC");
        my $number_of_rows  = @{$sums};
        my $counter         = 1;
        #Start with empty values
        my $d               = 0;
        my $t               = 0;

        #if $number_of_rows = 1 we are just updating the current one (it is not stretching between slots)285353
        if($number_of_rows == 1){
            return ($data,$time);
        }

        foreach my $line (@{$sums}){
            $d = $d + $line->[0];
            $t = $t + $line->[1];
            print $line->[0];
            $counter ++;
            ($counter == $number_of_rows)&&(last);  #We are not doing the last one
        }
        return (($data-$d),($time-$t));
    }
}


sub _sql_get_prime_totals {

    my ($self,$username, $prime_start_stamp, $prime_end_stamp) = @_;

    my $sums    = $self->{'sql_connector'}->one_statement_value_value_value('prime_totals',$prime_start_stamp,$prime_end_stamp,$username);

    my $d       = 0;
    my $t       = 0;

    if(defined($sums->{'data'})){
        $d  = $sums->{'data'};
    }
    if(defined($sums->{'time'})){
        $t  = $sums->{'time'};
    }
    return ($d, $t);
}

sub _sql_get_normal_totals {

    my ($self,$username, $prime_start_stamp, $prime_end_stamp,$day_start_stamp, $day_end_stamp) = @_;

    my $sums    = $self->{'sql_connector'}->one_statement_value_value_value('normal_totals_start',$day_start_stamp,$prime_start_stamp,$username);

    my $d_before = 0; 
    my $t_before = 0;
    if(defined($sums->{'data'})){
        $d_before        = $sums->{'data'};
    }
    if(defined($sums->{'time'})){
        $t_before        = $sums->{'time'};
    }

    my $s   = $self->{'sql_connector'}->one_statement_value_value_value('normal_totals_end',$prime_end_stamp,$username,$day_end_stamp);

    my $d_after = 0;
    my $t_after = 0;
    if(defined($s->{'data'})){
        $d_after        = exists $s->{'data'};
    }
    if(defined($s->{'time'})){
        $t_after        = $s->{'time'};
    }

    return (($d_before+$d_after), ($t_before+$t_after));
}

1;
