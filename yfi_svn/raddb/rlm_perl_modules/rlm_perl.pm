#
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
#
#  Copyright 2002  The FreeRADIUS server project
#  Copyright 2002  Boian Jordanov <bjordanov@orbitel.bg>
#

#
# Example code for use with rlm_perl
#
# You can use every module that comes with your perl distribution!
#

use strict;
use POSIX;
# use ...
# This is very important ! Without this script will not get the filled  hashesh from main.
use vars qw(%RAD_REQUEST %RAD_REPLY %RAD_CHECK %RAD_CONFIG);
use Data::Dumper;

use lib "/etc/freeradius2/rlm_perl_modules";
use SQLConnector;

# This is hash wich hold original request from radius
#my %RAD_REQUEST;
# In this hash you add values that will be returned to NAS.
#my %RAD_REPLY;
#This is for check items
#my %RAD_CHECK;

#-------------------------------------------------------------------------------
#-------- YFI ADD ON ------------------------------------------------------
#-------------------------------------------------------------------------------
use Devices;
use Nas;
use Attributes;
use Voucher;
use User;
use SQLCounter;

use Prime;

our $sql_connector;
our $sql_counter;
sub CLONE {
    $sql_connector  = SQLConnector->new();
    $sql_connector->prepare_statements();

    #Create a $sql_counter object which will read the counters defined once (its good to avoid unnecesary file reads)
    $sql_counter    = SQLCounter->new($sql_connector);
    $sql_counter->create_sql_counter_hash();
} 



#-------------------------------------------------------------------------------
#-------- END YFI ADD ON --------------------------------------------------
#-------------------------------------------------------------------------------

#
# This the remapping of return values
#
       use constant    RLM_MODULE_REJECT=>    0;#  /* immediately reject the request */
       use constant    RLM_MODULE_FAIL=>      1;#  /* module failed, don't reply */
       use constant    RLM_MODULE_OK=>        2;#  /* the module is OK, continue */
       use constant    RLM_MODULE_HANDLED=>   3;#  /* the module handled the request, so stop. */
       use constant    RLM_MODULE_INVALID=>   4;#  /* the module considers the request invalid. */
       use constant    RLM_MODULE_USERLOCK=>  5;#  /* reject the request (user is locked out) */
       use constant    RLM_MODULE_NOTFOUND=>  6;#  /* user not found */
       use constant    RLM_MODULE_NOOP=>      7;#  /* module succeeded without doing anything */
       use constant    RLM_MODULE_UPDATED=>   8;#  /* OK (pairs modified) */
       use constant    RLM_MODULE_NUMCODES=>  9;#  /* How many return codes there are */

#____ LOG LEVELS _____
use constant    LOG_DEBUG   => 0;
use constant    LOG_AUTH    => 1;
use constant    LOG_PROXY   => 2; 
use constant    LOG_INFO    => 3;
use constant    LOG_ERROR   => 4;


# Function to handle authorize
sub authorize {


       return RLM_MODULE_OK;
       #return RLM_MODULE_HANDLED;
}

# Function to handle authenticate
sub authenticate {

    my $user            = $RAD_REQUEST{'User-Name'};
    my $pw              = $RAD_REQUEST{'User-Password'};

    #--------------------------------------------------------------------------------------
    #--------------- 4/1/10 This is pulling a fast one on the authentication system-------
    #---- It checks if the username is a MAC if so it uses the Devices module -------------
    #---- The devices module takes the MAC and if it is defined as a device returns the ---
    #---- permanent user to which this device belongs--------------------------------------
    #--------------------------------------------------------------------------------------
    # See if the username is a MAC - then we will use the Devices module to see if it is defined as a device
    # Filter on format XX:XX or XX-XX ( Mikrotik uses ':' by defaul; Chilli use '-' )
    if($user =~ m/^([0-9a-fA-F][0-9a-fA-F]:)|([0-9a-fA-F][0-9a-fA-F]-){5}([0-9a-fA-F][0-9a-fA-F])$/){
        #Replace the '-' with ':' cause the format in the devices table will be ':'
        $user =~ s/-/:/g;
        print "MAC Authentication! / get the permanent user for this Device\n";
        my $devices = Devices->new($sql_connector);
        my @rd      = $devices->authenticate_mac($user);
        ($user,$pw) = @rd;
        if($user eq '0'){
            $RAD_REPLY{'Reply-Message'} = "MAC not defined";
            return RLM_MODULE_REJECT;
        }
        print "USER IS NOW $user and Password $pw (for device)\n";
    }
    #---------------------------------------------------------------------------------------

    if (authenticate_worker($user,$pw)){

        return RLM_MODULE_OK;
    }

    #REJECT THE REST
    return RLM_MODULE_REJECT;
}

# Function to handle preacct
sub preacct {

    #--------------------------------------------------------------------------------------
    #--------------- 4/1/10 This is pulling a fast one on the accounting system-----------
    #---- It checks if the username is a MAC if so it uses the Devices module -------------
    #---- The devices module takes the MAC and if it is defined as a device replaces the --
    #---- 'User-Name' and 'Realm' values with the permanet user to which this device belongs
    #--------------------------------------------------------------------------------------
    # See if the username is a MAC - then we will use the Devices module to see if it is defined as a device
    my $user = $RAD_REQUEST{'User-Name'};
    # Filter on format XX:XX or XX-XX ( Mikrotik uses ':' by defaul; Chilli use '-' )
    if($user =~ m/^([0-9a-fA-F][0-9a-fA-F]:)|([0-9a-fA-F][0-9a-fA-F]-){5}([0-9a-fA-F][0-9a-fA-F])$/){
         #Replace the '-' with ':' cause the format in the devices table will be ':'
        $user =~ s/-/:/g;
        $RAD_REQUEST{'User-Name'} = $user;
        print "=========== MAC HACK ========\n";
        print "MAC account packet / replace the User-Name and Realm for device";
        my $devices = Devices->new($sql_connector);
        $devices->accounting_mac(\%RAD_REQUEST);
        print "============================\n";
    }
    #---------------------------------------------------------------------------------------

    #------ 20-01-10 ------------------------------------------------------------------------
    #---- This is a hack to use the SSID that an accounting request from hostapd ------------
    #--- and username without '@<realm>' will be changed to specify the realm as the SSID ---
    #----------------------------------------------------------------------------------------
#     if($RAD_REQUEST{'User-Name'} !~ /\@.+/){
# 
#         if($RAD_REQUEST{'Called-Station-Id'} =~ m/^([0-9a-fA-F][0-9a-fA-F]-){5}([0-9a-fA-F][0-9a-fA-F]):.+$/){      #This seems to come from hostapd
#             my $realm   = $RAD_REQUEST{'Called-Station-Id'};
#             $realm      =~ s/^([0-9a-fA-F][0-9a-fA-F]-){5}([0-9a-fA-F][0-9a-fA-F])://;
#             $RAD_REQUEST{'Realm'} = $realm;
#         }
#     }
    #-----------------------------------------------------------------------------------------
   return RLM_MODULE_OK;
}

sub accounting {

    my $user = User->new($sql_connector,$sql_counter);
    $user->accounting(\%RAD_REQUEST); #Pass a reference to the sub 

    #---- Comment out for Prime time / Normal time function ---
    #my $prime           = Prime->new($sql_connector);
    #$prime->accounting(\%RAD_REQUEST);
    #----------------------------------------------------------
    return RLM_MODULE_OK;
}


# Function to handle checksimul
sub checksimul {
       # For debugging purposes only
#       &log_request_attributes;

       return RLM_MODULE_OK;
}

# Function to handle pre_proxy
sub pre_proxy {
       # For debugging purposes only
#       &log_request_attributes;

       return RLM_MODULE_OK;
}

# Function to handle post_proxy
sub post_proxy {
       # For debugging purposes only
#       &log_request_attributes;

       return RLM_MODULE_OK;
}

# Function to handle post_auth
sub post_auth {
       # For debugging purposes only
#       &log_request_attributes;

       return RLM_MODULE_OK;
}

# Function to handle xlat
sub xlat {
       # For debugging purposes only
#       &log_request_attributes;

       # Loads some external perl and evaluate it
       my ($filename,$a,$b,$c,$d) = @_;
       &radiusd::radlog(1, "From xlat $filename ");
       &radiusd::radlog(1,"From xlat $a $b $c $d ");
       local *FH;
       open FH, $filename or die "open '$filename' $!";
       local($/) = undef;
       my $sub = <FH>;
       close FH;
       my $eval = qq{ sub handler{ $sub;} };
       eval $eval;
       eval {main->handler;};
}

# Function to handle detach
sub detach {
       # For debugging purposes only
#       &log_request_attributes;

       # Do some logging.
       &radiusd::radlog(0,"rlm_perl::Detaching. Reloading. Done.");
} 

#
# Some functions that can be called from other functions
#

sub test_call {
       # Some code goes here
}

sub log_request_attributes {
       # This shouldn't be done in production environments!
       # This is only meant for debugging!
       for (keys %RAD_REQUEST) {
               &radiusd::radlog(1, "RAD_REQUEST: $_ = $RAD_REQUEST{$_}");
       }
}


#====================================================================================
#======== YFI ADD ON ===========================================================
#====================================================================================

#====================================================================================
#======== YFI ADD ON ===========================================================
#====================================================================================

sub authenticate_worker {

    my ($username, $password) = @_;


    #---- Comment out for Prime time / Normal time function ---
    #my $prime           = Prime->new($sql_connector);
    #my $prime_return    = $prime->auth($username);
    #if ($prime_return != 1){
    #     $RAD_REPLY{'Reply-Message'} = "$prime_return";
    #     return 0;
    #}
    #----------------------------------------------------------

    #_______ NAS REALM CHECK ___________
    #Check if the user is allowed to authenticate from this nas device
    #get the realm of the user
    my $realm_part  = $username;
    $realm_part     =~ s/^.+\@//;
    #print "REALM $realm_part\n";
    if(exists($RAD_REQUEST{'NAS-IP-Address'})){
        #Check what the ID is of the nas
        my $nas     = Nas->new($sql_connector);
        my $nas_ident = $RAD_REQUEST{'NAS-IP-Address'};
        if($nas->is_realm_allowed($realm_part,$nas_ident) == 0){
            print "User can NOT authenticate from this NAS\n";
            $RAD_REPLY{'Reply-Message'} = "Realm $realm_part not allowed on $nas_ident";
            return 0;
        }
    }
    #_____ END NAS REALM CHECK _________
    
    my $attributes = Attributes->new($sql_connector);
 
    my $check_hash = $attributes->check_attributes($username);
 
    #********************************************
    #**If user is not present in the database****
    #********************************************
    if(!defined($check_hash)){
        $RAD_REPLY{'Reply-Message'} = "User Not Defined";
        return 0;
    }

    #*********************************************
    #**If password is not correct or not present**
    #*********************************************
    if(defined $check_hash->{'Cleartext-Password'}){
        if(!($check_hash->{'Cleartext-Password'} eq $password)){

            $RAD_REPLY{'Reply-Message'} = "Password Incorrect";
            return 0;
        }
    }

    #*********************************************
    #** Do a MAC test ****************************
    #*********************************************
    if(defined $check_hash->{'Calling-Station-Id'}){

        if ($RAD_REQUEST{'Calling-Station-Id'} ne $check_hash->{'Calling-Station-Id'}){

            $RAD_REPLY{'Reply-Message'} = "Wrong MAC Address";
            return 0;

        }
    }

    #*********************************************
    #** Check for simultaneous connections *******
    #*********************************************
    if(defined $check_hash->{'Simultaneous-Use'}){

        #Find the value of 'Simultaneous-Use'
        my $su_value = $check_hash->{'Simultaneous-Use'};
        my $connections_now  = $sql_connector->one_statement_value('radacct_count_username',$username);

        if($connections_now->{'count'} >= $su_value){

                #User already at their max!
                $RAD_REPLY{'Reply-Message'} = "Max Simultaneous Connections reached";
                return 0;
        }
    }

    #*********************************************
    #**Get all the standard reply attributes *****
    #*********************************************
    my $reply_hash = $attributes->reply_attributes($username);
    foreach my $key (keys %{$reply_hash}){
        $RAD_REPLY{$key} = $reply_hash->{$key};
    }

    #-------------------------------------------
    #-----YFI Voucher System---------------
    #-------------------------------------------
    #Check if there is a 'Hotcakes-Voucher' check attribute
    if((defined $check_hash->{'Yfi-Voucher'})&&($check_hash->{'Yfi-Voucher'} ne '0-00-00-00')){
        print "=====Voucher Detected!=======\n";

        my $voucher = Voucher->new($sql_connector);
       
        #----------------------------------------------------------------------------------
        #--- Check if the Yfi-Mac-Reset is clear if present --------------------------
        #---------------------------------------------------------------------------------- 
        print Dumper($check_hash);

        #NOTE: This is a Prove of Concept (POC) Work In Progress (WIP) = POCWIP
        #if(defined($check_hash->{'Yfi-MAC-Reset'})){    
            #voucher_check_for_existing_mac_reset($RAD_REQUEST{'Calling-Station-Id'});
            #voucher_check_for_existing_mac_reset('127.0.0.1',$username);
        #}

        my $voucher_value   = $check_hash->{'Yfi-Voucher'};
        my $time_left       = $voucher->valid_check($username,$voucher_value);

        print "Time Left: $time_left\n";

        if((defined($time_left))&&($time_left < 0)){
            $RAD_REPLY{'Reply-Message'} = "Voucher Duration Expired";
            return 0;
        }else{  #$time_left is undefined - First time login || get the latest terminate time

            my $expire_value = $voucher->expire_value($username,$voucher_value);

            #-----------------------------------------
            #Check if there was a WISPr-Session-Terminate-Time attribute in the reply hash
            my $expiry_date_reached = 0;
            if(defined $reply_hash->{'WISPr-Session-Terminate-Time'}){
                $expiry_date_reached = $voucher->check_expiry_date($reply_hash->{'WISPr-Session-Terminate-Time'},$expire_value);
            }
            #--------------------------------------

            #----------------------------------
            if($expiry_date_reached == 1){  #The expiry date is BEFORE the exiry of the voucher - we use the smallest
                $RAD_REPLY{'WISPr-Session-Terminate-Time'} = $reply_hash->{'WISPr-Session-Terminate-Time'};
            }else{
               $RAD_REPLY{'WISPr-Session-Terminate-Time'} = $expire_value;
            }
            #----------------------------------
        }
    }

    #--------------------------------------------------------------
    #----- YFi Permanent User System-------------------------------
    #--------------------------------------------------------------
    my $permanent_user      = User->new($sql_connector,$sql_counter);
    my $permanent_return    = $permanent_user->authenticate($username,$check_hash);
    if($permanent_return != 1){

        $RAD_REPLY{'Reply-Message'} = $permanent_return;
        print "--------------------------------------------\n";
        print "--FAIL Yfi Permanent User Module -----------\n";
        print "--------------------------------------------\n";
         return 0;
    }
    print "--------------------------------------------\n";
    print "--PASS Yfi Permanent User Module ---------\n";
    print "--------------------------------------------\n";

    #**********************************************
    #**** Check for SQL Counter Problems **********
    #**********************************************

    my $sql_counter_reply = $sql_counter->counter_check($username,$check_hash);

    #print "======SQL Counter Reply=======\n";
    #print Dumper($sql_counter_reply);
    #print "==============================\n";

    if(defined $sql_counter_reply){

        foreach my $key (keys %{$sql_counter_reply}){

            $RAD_REPLY{$key} = $sql_counter_reply->{$key};
            #If there was an error the 'Reply-Message' will have a value, if so return with a 0
            if($key eq 'Reply-Message'){ 
                return 0;
            }
        }
    }

    #All Authentication tests passed
    return 1;
}





