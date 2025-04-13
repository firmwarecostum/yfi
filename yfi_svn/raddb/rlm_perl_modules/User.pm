package User;

use strict;
use warnings;

use Data::Dumper;
use POSIX;
use Attributes;

#Required to generate a unique ID
use Time::HiRes;

#use SQLCounter;

#===============================================================
#===== CONFIGURATION DATA ======================================
#===============================================================
my $radclient = '/usr/bin/radclient';
#===============================================================
#===== END of Configuration Data ===============================
#===============================================================

#Initialise this with a sql_connector object
sub new {

    print "   Nas::new called\n";
    my $type = shift;                       # The package/type name
    my $self = {'sql_connector' => shift, 'sql_counter' => shift, 'radclient' => $radclient };  # Reference to empty hash
    return bless $self, $type;
}


sub accounting {

    my($self,$acct_detail) = @_;

    print "--------------------------------------------\n";
    print "--YFi Permanent User Module - Accounting ---\n";
    print "--------------------------------------------\n";
    #print Dumper($acct_detail);
    my $username       = $acct_detail->{'User-Name'};

    my $return_data  = $self->{'sql_connector'}->one_statement_value('user_username',$username);

    if(exists $return_data->{'id'}){
        print "Valid Permanenty User\n";
        if($return_data->{'active'} eq '1'){
            print "-> Account Active\n";

            #--Update the percent usage--
            my $attributes          = Attributes->new($self->{'sql_connector'});
            my $check_hash          = $attributes->check_attributes($username);   #Get the check hash for this user

            my $check_usage_return;
            if($return_data->{'cap'} eq 'prepaid'){
                $check_usage_return  = $self->_check_prepaid_usage($username,$check_hash,1);   #Prepaid usage gets calculated a bit different
            }else{
                $check_usage_return  = $self->_check_usage($username,$check_hash,1);
            }

            if(($return_data->{'cap'} eq 'hard')or($return_data->{'cap'} eq 'prepaid')){
                print "-> Hard Limit Specified\n";
                if($check_usage_return ne '1'){
                    print "-> Hard Limit Depleted Kick User Off\n";
                    $self->_kick_user_off($acct_detail);
                }
            }
            #----------------------------
            
        }else{
            print "-> Account Disabled - Kick User Off\n";
            $self->_kick_user_off($acct_detail);
        }

    }else{

        print "-> Not Permanent User\n";
    }

    print "____________________________________________\n";
    print "----END Yfi Permanent User Module ----------\n";
    print "____________________________________________\n";
    return 1;
}



sub authenticate {

    my ($self,$username,$check_hash) = @_;

    #------------------------------------------------------------------------
    #--This is the authenticate check. The following Checks are done:--------
    #--> Is this a permanent user - YES -Continue NO -Retrun 1 (pass)--------
    #--> Is the account active - YES -Continue NO -Retrun 'Account Disabled'-
    #--> What type of cap is defiend for this permanent user? ---------------
    #--> hard -> Check the usage (Soft Return 1 (pass)-----------------------
    #--> Check the usage by checking for Yfi-Data or Yfi-Time counters-------
    #--> Get Their values - Add extra cap values and see if it is still > 0--
    #--> If smaller than 0 Retrun 'Data Cap Depleted' -----------------------
    #------------------------------------------------------------------------

    #--- PrePaid ADD ON---------------------------------------------------------
    #--- If the cap is defined as 'prepaid' ------------------------------------
    #--- Checks if the user has still credit on data / time left ---------------
    #-- by checking values for YFi-Data or Yfi-Time counters + extra cap values-
    #-- If smaller than 0- Return 'Cap Depleted'--------------------------------
    #---------------------------------------------------------------------------

    print "--------------------------------------------\n";
    print "--YFi Permanent User Module - Authenticate--\n";
    print "--------------------------------------------\n";
    #Check if it is a permanent user
    print "-> Check if permanent user: ";

    my $return_data  = $self->{'sql_connector'}->one_statement_value('user_username',$username);

    if(exists $return_data->{'id'}){

        print "Valid Permanenty User\n";
        if($return_data->{'active'} eq '1'){
            print "-> Account Active\n";

            if($return_data->{'cap'} eq 'hard'){
                print("-> Hard Cap - Check usage\n");
                return $self->_check_usage($username,$check_hash);
            }

            if($return_data->{'cap'} eq 'prepaid'){
                print("-> Prepaid Cap - Check usage\n");
                return $self->_check_prepaid_usage($username,$check_hash);
            }
            
        }else{
            print "-> Account Disabled - Fail Authentication\n";
            return "Account Disabled";
        }

    }else{

        print "-> Not Permanent User\n";
    }
    #Default PASS it
    return 1; 

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
    my $mac        = $acct_detail->{'Calling-Station-Id'};

    my $nas_mac   = $acct_detail->{'Called-Station-Id'};


    ($ip eq '0.0.0.0')&&($ip = '127.0.0.1'); #A Chillispot work-a-around

    my $return_data  = $self->{'sql_connector'}->one_statement_value('na_nasname',$ip);
    my $type        = $return_data->{'type'};
    my $port        = $return_data->{'ports'};
    my $secret      = $return_data->{'secret'};
    my $community   = $return_data->{'community'};	#We use the community as the $nas_mac value through NAT and heartbeat connections
    my $nas_id      = $return_data->{'id'};


    #The heartbeat disconnection code
    if(($nas_mac =~ m/$community/i)&&($type = 'CoovaChilli-NAT')){

	my $disconnect_command = "chilli_query logout $mac";
	#There may already be an entry awaiting for this MAC if so we don't want to add another one
	my $check_if_present = $self->{'sql_connector'}->one_statement_value_value_value('disconnect_count_for_mac',"$nas_id","$disconnect_command",'awaiting');

 	if(defined( $check_if_present->{'sum'})){
		if($check_if_present->{'sum'} == 0){
			#Add an entry to kick the MAC off in the actions table
			my $unique_id = Time::HiRes::gettimeofday( );
        		$self->{'sql_connector'}->no_return_three_values('add_nas_action',$unique_id,$nas_id,$disconnect_command);
		}
	}
	return; #We don't need to do anything besides this...
    }	

    my $device_flag = 0;

	#-----------------------------------------------------------------------------------------------------------------------------------------------
	#---- MAC Authentication add-on: MAC authenticated devices are authenticated to RADIUS as the Permanent user to which the Device belongs -------
    	#---- But on the NAS device as the MAC of the device connecting to the Internet thus we have to replace the permanent username with the MAC ----
    	#---- in the event that such a device is declared ----------------------------------------------------------------------------------------------
	#-----------------------------------------------------------------------------------------------------------------------------------------------

    my $rd  = $self->{'sql_connector'}->one_statement_value('device_name',$mac);
	if(exists $rd->{'id'}){
		$device_flag =1;	#MAC is NOT in devices table
   	}
	#------------------------------------------------------------------------------------------------------------------------------------------------


    #____________Chillispot_____________________
    if($type =~ m/chilli/i){

        print "-> Disconnecting User Form Chilli Type of Device\n";
		if($device_flag == 1){	#If the Device is part of the MAC devices - first try and disconnect it as a device
			system("echo \"User-Name = $mac\" | $radclient -r 2 -t 2 $ip:$port 40 $secret");	
		}
        system("echo \"User-Name = $username\" | $radclient -r 2 -t 2 $ip:$port 40 $secret");
    }

    #___________Mikrotik____________________________
     if($type =~ m/mikrotik/i){

        print "-> Disconnecting User Form Mikrotik Type of Device\n";
		if($device_flag == 1){	#If the Device is part of the MAC devices - first try and disconnect it as a device
			system("echo \"User-Name = $mac,Framed-IP-Address= $framedipaddress\" | $radclient -r 2 -t 2 $ip:$port disconnect $secret");	
		}
        system("echo \"User-Name = $username,Framed-IP-Address= $framedipaddress\" | $radclient -r 2 -t 2 $ip:$port disconnect $secret");
    }
}


sub _check_usage {

    #------------------------------------------------------------------------
    #--This is the core of the permanent user with a Hard Cap check----------
    #--We will get the latest counter tally - SQLCounter will give negatives on Yfi-Data 
    #--and Yfi-Time as an exception other counters it will fail authentication upon Zero
    #--Take this and add the Extra Caps defiend for this month and see if we still get a 
    #--negative value - if so fail the user ------------------------------------
    #--if not pass the user-----------------------------------------------------
    #---------------------------------------------------------------------------

    my($self,$username,$check_hash,$account_flag) = @_;

    my $sql_counter_reply = $self->{'sql_counter'}->counter_check($username, $check_hash);
   # my $sql_counter_reply = sqlcounter_check('lida', $check_hash);

    if(defined $sql_counter_reply){

        foreach my $key (keys %{$sql_counter_reply}){

            my $value = $sql_counter_reply->{$key};
            #We are only interested in 'Yfi-Data' and 'Yfi-Time'
            if($key eq 'Yfi-Data'){
                print "-> Special Key Yfi-Data: $value\n";
                my $profile_data_cap = $check_hash->{'Yfi-Data'};
                #Check for extra caps for this user
                my $extra_data         = $self->_get_extra_caps($username,'data');
                print "-> Extra Data: $extra_data\n";
                my $total_available    = $value + $extra_data;
                print "-> Total Data Avail is $total_available\n";


                #-----Update The percentage used if $account_flag == 1 ---
                if($account_flag){
                    print "-> Updating Percentage Data Used\n";
                    my $usage           = $self->{'sql_counter'}->get_usage_for_counter($username, 'Yfi-Data');
                    print "-> Data usage is $usage\n";
                    my $percent_used    = ($usage/($profile_data_cap+$extra_data))*100;
                    $percent_used       = sprintf '%.2f', $percent_used;
                    print "-> Updating Percentage Data Used To $percent_used for $username\n";
                    $self->_update_usage($username,$percent_used,'data');
                }
                #--------------------------------------------------------


                if($total_available <= 0){
                    return "Data Cap Depleted";
                }
            }

            if($key eq 'Yfi-Time'){
                print " -> Special Key Yfi-Time: $value\n";
                my $profile_time_cap    = $check_hash->{'Yfi-Time'};
                #Check for extra caps for this user
                my $extra_time         = $self->_get_extra_caps($username,'time');
                my $total_available    = $value + $extra_time;
                print "-> Total Time Avail is $total_available\n";

                #-----Update The percentage used if $account_flag == 1 ---
                if($account_flag){
                    print "-> Updating Percentage Time Used\n";
                    my $usage           =  $self->{'sql_counter'}->get_usage_for_counter($username, 'Yfi-Time');
                    my $percent_used    = ($usage/($profile_time_cap+$extra_time))*100;
                    $percent_used       = sprintf '%.2f', $percent_used;
                    print "-> Updating Percentage Time Used To $percent_used for $username\n";
                    $self->_update_usage($username,$percent_used,'time');
                }
                #--------------------------------------------------------

                if($total_available <= 0){
                    return "Time Cap Depleted";
                }
            }
        }
    }
    return 1;   #We pass it by default
}



sub _check_prepaid_usage {

    #------------------------------------------------------------------------
    #--This is the core of the permanent user Prepaid type check-------------
    #--We will the Value of Yfi-Data (plus extra Data Caps) - No RESET
    #--We will also get the value of Yfi-Time (plus extra Time Caps) - No RESET
    #-- Get the current usage of DATA and subtract it - No RESET
    #-- Get the current usage of TIME and subtract it = No RESET
    #--Subtract the values - if depleted return FAIL message else return 1 (pass)
    #---------------------------------------------------------------------------

    my($self, $username, $check_hash, $account_flag) = @_;

    #Get the total data and time used by this user
    #SELECT SUM(acctinputoctets) as input, SUM(acctoutputoctets) as output, SUM(acctsessiontime) as time FROM radacct where username=?
    my $return_data  = $self->{'sql_connector'}->one_statement_value('radacct_sum_username',$username);

    my $total_in    = 0;
    my $total_out   = 0;
    my $total_time  = 0;

    if(defined($return_data->{'input'})){
        $total_in = $return_data->{'input'};
    }

    if(defined($return_data->{'output'})){
        $total_out = $return_data->{'output'};
    }

    if(defined($return_data->{'time'})){
        $total_time = $return_data->{'time'};
    }

    my $total_data  = $total_in + $total_out;

    #Get the user_id of this username
    $return_data    = $self->{'sql_connector'}->one_statement_value('user_username',$username);
    my $id          = $return_data->{'id'};

    #Get the totals of Credits for this user_id
    #"SELECT SUM(data) as data, SUM(time) as time FROM credits where used_by_id='$id'";
    $return_data  = $self->{'sql_connector'}->one_statement_value('credit_sum_used_by_id',$id);
    my $cr_data     = 0;
    my $cr_time     = 0;

    if(defined($return_data->{'data'})){
        $cr_data    = $return_data->{'data'};
    }
    
    if(defined($return_data->{'time'})){
        $cr_time    = $return_data->{'time'};
    }


    if (defined($check_hash->{'Yfi-Data'})){ #This profile has a data based component

        #get the value of Yfi-Data as a start
        my $yfi_data    = $check_hash->{'Yfi-Data'};
        #Get the sum of the total data credits
        $cr_data        = $cr_data + $yfi_data;
        my $data_avail  = $cr_data - $total_data;

         #-----Update The percentage used if $account_flag == 1 ---
        if($account_flag){
            print "-> Updating Percentage Data Used\n";
            print "-> Data usage is $total_data\n";
            my $percent_used    = ($total_data/$cr_data)*100;
            $percent_used       = sprintf '%.2f', $percent_used;
            print "-> Updating Percentage Data Used To $percent_used for $username\n";
            $self->_update_usage($username,$percent_used,'data');
        }
        #--------------------------------------------------------

        if($data_avail <= 0){
            return "Data Credits Depleted";
        }
    }

    if (defined($check_hash->{'Yfi-Time'})){ #This profile has a time based component

        #get the value of Yfi-Data as a start
        my $yfi_time    = $check_hash->{'Yfi-Time'};
        #Get the sum of the total data credits
        $cr_time        = $cr_time + $yfi_time;
        my $time_avail  = $cr_time - $total_time;

        #-----Update The percentage used if $account_flag == 1 ---
        if($account_flag){
            print "-> Updating Percentage Time Used\n";
            my $percent_used    = ($total_time/$cr_time)*100;
            $percent_used       = sprintf '%.2f', $percent_used;
            print "-> Updating Percentage Time Used To $percent_used for $username\n";
            $self->_update_usage($username,$percent_used,'time');
        }
        #--------------------------------------------------------

        if($time_avail <= 0){
            return "Time Credits Depleted";
        }
    }
    return 1;   #We pass it by default
}


sub _update_usage {
    my ($self,$username,$percent_used,$type) = @_;

    my $user_id;

    my $return_data  = $self->{'sql_connector'}->one_statement_value('user_username',$username);

    if(exists $return_data->{'id'}){
        $user_id = $return_data->{'id'};
        #Update the id
        #Update the percent usage
        if($type eq 'data'){
            $self->{'sql_connector'}->one_statement_no_return_value_value('user_update_data',$percent_used,$user_id);
        }

        if($type eq 'time'){
            $self->{'sql_connector'}->one_statement_no_return_value_value('user_update_time',$percent_used,$user_id);
        }
    }
}

sub _get_extra_caps {

    my($self,$username,$type) = @_;

    my $user_id;
    my $return_data  = $self->{'sql_connector'}->one_statement_value('user_username',$username);
    if(exists $return_data->{'id'}){
        $user_id = $return_data->{'id'};
        #Get Extra CAPS Defined for this month
        my $start_of_month = $self->_start_of_month();
        my $cap_data    = $self->{'sql_connector'}->one_statement_value_value_value('extra_sum',$user_id,$type,$start_of_month);
        if(defined( $cap_data->{'sum'})){
            return $cap_data->{'sum'};
        }else{
            return 0;
        }
    }
}

sub _start_of_month {

    my($self) = @_;

    #Get the current timestamp;
    #-------------------------------------------------------
    #--- If we need to reset the user's account on the 25---
    #-------------------------------------------------------
    my $reset_on = $self->{'sql_counter'}->{'config_data'}->{sql_counters}{start_of_month};    #New Feature which lets you decide when the monthly CAP will reset
    my $unixtime;

    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime(time);
    if($mday <= $reset_on ){
        $unixtime = mktime (0, 0, 0, $reset_on, $mon-1, $year, 0, 0);   #We use the previous month
    }else{
        $unixtime = mktime (0, 0, 0, $reset_on, $mon, $year, 0, 0);     #We use this month
    }
    #printf "%4d-%02d-%02d %02d:%02d:%02d\n",$year+1900,$mon+1,$mday,$hour,$min,$sec;

    #create a new timestamp:
    return $unixtime;
}

1;
