package Telkom;

use strict;
use warnings;
use XML::Simple;
use Data::Dumper;
use Mail::Sendmail; 
use DBI;
use POSIX;


require Exporter;

our @ISA =qw(Exporter);
our @EXPORT = qw(   &telkom_disabled_check
                    &telkom_mail_check 
                    &telkom_cap_check 
                    &telkom_extra_caps 
                    &telkom_mail_user 
                    &telkom_kick_user 
                    &telkom_mail_already_send 
                    &telkom_get_degraded 
                    &telkom_set_degraded
                    &telkom_kick_off_user
                    &telkom_kick_off_all_users
                    &telkom_disable_acc
            );

#===============================================================
#===== CONFIGURATION DATA ======================================
#===============================================================
my $config_file = '/usr/local/etc/raddb/rlm_perl_modules/conf/settings.conf';
#===============================================================
#===== END of Configuration Data ===============================
#===============================================================


my $xml     = new XML::Simple;
my $data    = $xml->XMLin($config_file);


sub telkom_disabled_check {
#---------------------------------------------------------------
#-- Check if specified username is disabled --------------------
#---------------------------------------------------------------
    my($username) = @_;
   
    my $disabled = 0; 
    my $pu_id = _permanent_user_id_for_username($username);

    if(defined $pu_id){

        my $query_string = "SELECT value FROM telkom_items WHERE permanent_user_id='$pu_id' AND name='disabled'";
        my $return_data  = do_sql_query($query_string);
        if($return_data->[0][0]){

            $disabled = $return_data->[0][0];
        } 
    }
    return $disabled;
}

sub telkom_mail_check {
#-------------------------------------------------------
#-- Check if specified username needs to be mailed------
#-------------------------------------------------------
    my($username) = @_;
    my $mail;
    my $pu_id           = _permanent_user_id_for_username($username);

    my $query_string = "SELECT value FROM telkom_items WHERE permanent_user_id='$pu_id' AND name='email_notify'";
    my $return_data  = do_sql_query($query_string);

    if($return_data->[0][0]){

        $mail = $return_data->[0][0];
    }

    return $mail;
}

sub telkom_mail_user {
#------------------------------------------------------------
#-- Mail the specified user informing them about the usage --
#-- add a 'mail_send' entry to the telkom_items table--------
#------------------------------------------------------------
    my ($username,$cap_size, $extra_caps, $usage, $mail_percent) = @_;

    my $pu_id           = _permanent_user_id_for_username($username);

    my $query_string    = "SELECT Name, email FROM permanent_users WHERE id=$pu_id";

    my $return_data  = do_sql_query($query_string);

    if($return_data->[0][0]){

        my $name        = $return_data->[0][0];
        my $email       = $return_data->[0][1];
        my $smtp_relay  = $data->{email}->{smtp_relay};
        my $sender_name = $data->{email}->{sender_name};
        my %mail = (
                    from => "$sender_name",
                    to => "$email",
                    subject => "ISP MAIL: Cap usage above $mail_percent \%",
                                'content-type' => 'text/html; charset="iso-8859-1"',
                    );
        $mail{body} = <<END_OF_BODY;
            <html>
            <head>
                <style> body {font: 13px Myriad,Arial,Helvetica,clean,sans-serif;}
                </style>
            </head>
            <body>
            Dear $name,<br><br>
            This is a notification mail to inform you that you have reached $mail_percent \% of the allowed Internet usage.<br>
            The usage information according to our system is as follows:<br><br>
            <b>Cap Size</b><br>
            $cap_size<br>
            <b>Extra Caps</b><br>
            $extra_caps<br>
            <b>Usage</b><br>
            $usage<br>
            </body>
            </html>
END_OF_BODY

        $mail{smtp} = $smtp_relay;
        sendmail(%mail) || print "Error: $Mail::Sendmail::error\n";
 
        #We also need to add a 'mail_send' entry with the e-mail addy as value
        $query_string    = "INSERT INTO telkom_items VALUES(null,$pu_id,'mail_send','$email',now(),now())";
        do_sql_query($query_string,1);


    }

}

sub telkom_mail_already_send {
#-------------------------------------------------------------------------
#-- Check wether an email were already sent out to this user this month---
#-------------------------------------------------------------------------
    my ($username) = @_;
    my $mailed_to;
    my $pu_id = _permanent_user_id_for_username($username);
    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime(time);
    #create a new timestamp:
    my $start_of_month = mktime (0, 0, 0, 1, $mon, $year, 0, 0);
    my $query_string = "SELECT value FROM telkom_items WHERE UNIX_TIMESTAMP(created) > $start_of_month AND permanent_user_id=$pu_id AND name='mail_send'";
    my $return_data  = do_sql_query($query_string);

     if($return_data->[0][0]){

        $mailed_to = $return_data->[0][0];
    }

    return $mailed_to;
}

sub telkom_get_degraded {
#-------------------------------------------------------------------------
#-- Check wether the account is already degraded this month---------------
#-------------------------------------------------------------------------
    my ($username) = @_;
    my $degraded;
    my $pu_id = _permanent_user_id_for_username($username);

    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime(time);
    #create a new timestamp:
    my $start_of_month = mktime (0, 0, 0, 1, $mon, $year, 0, 0);
    my $query_string = "SELECT value FROM telkom_items WHERE UNIX_TIMESTAMP(created) > $start_of_month AND permanent_user_id=$pu_id AND name='acc_degraded'";
    my $return_data  = do_sql_query($query_string);

     if($return_data->[0][0]){

        $degraded = $return_data->[0][0];
    }

    return $degraded;
}


sub telkom_set_degraded {
#-------------------------------------------------------------------------
#-- Set the account in degraded mode (because the CAP was depledetd)------
#-------------------------------------------------------------------------
    my ($username) = @_;
    my $pu_id = _permanent_user_id_for_username($username);
    my $query_string = "INSERT INTO telkom_items VALUES(null,$pu_id,'acc_degraded','1',now(),now())";
    do_sql_query($query_string,1);
}


sub telkom_cap_check {
#---------------------------------------------------------
#-- Check what type of a cap the usere has and react------
#-- accordingly ------------------------------------------
#---------------------------------------------------------
    my($username) = @_;

    my $cap ='soft';    #Default if not present is soft
    my $pu_id           = _permanent_user_id_for_username($username);

    my $query_string = "SELECT value FROM telkom_items WHERE permanent_user_id='$pu_id' AND name='cap_limit'";
    my $return_data  = do_sql_query($query_string);

    if($return_data->[0][0]){

        $cap = $return_data->[0][0];
    }
 
    return $cap;

}

sub telkom_extra_caps {
#------------------------------------------------------------
#--- Get the amount of extra caps added to the user for this-
#--- month --------------------------------------------------
#------------------------------------------------------------
    my($username) = @_;

    my $extra_caps      = 0;
    my $pu_id           = _permanent_user_id_for_username($username);
    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime(time);
    #create a new timestamp:
    my $start_of_month = mktime (0, 0, 0, 1, $mon, $year, 0, 0);

    my $query_string = "SELECT SUM(value) FROM telkom_items WHERE UNIX_TIMESTAMP(created) > $start_of_month AND permanent_user_id=$pu_id AND name='extra_cap'";
    my $return_data  = do_sql_query($query_string);

    if($return_data->[0][0]){

        $extra_caps = $return_data->[0][0];
    }
 
    return $extra_caps;
}

sub telkom_kick_off_user {

#-------------------------------------------------------------
#--- Kick of the user using the POD packet as specified in the TELKOM
#---Document---------------------------------------------------
#--------------------------------------------------------------
    my($username) = @_;

    #We need to get all the active connections for the specified user
    my $query_string = "SELECT framedipaddress,nasipaddress,xascendsessionsvrkey FROM radacct WHERE username='$username' and  acctstoptime is NULL";
    my $pod_script   = $data->{telkom_pod}->{pod_script};
    my $return_data  = do_sql_query($query_string);

    foreach my $line (@{$return_data}){
        #Usage radpod <Username> <Framed-IP-Address> <X-Ascend-Session-Svr-Key> <NAS-IP-Address> 
        my $ip          = $line->[0];
        my $nas         = $line->[1];
        my $key         = $line->[2];
        print "$pod_script $username $ip $key $nas\n";
        system("perl $pod_script $username $ip $key $nas");
    }
}

sub telkom_kick_off_all_users {

#--------------------------------------------------------------
#--- Kick of all active user's sessions -----------------------
#--------------------------------------------------------------
    #We need to get all the active connections for the specified user
    my $query_string = "SELECT framedipaddress,nasipaddress,xascendsessionsvrkey,username FROM radacct WHERE acctstoptime is NULL";
    my $pod_script   = $data->{telkom_pod}->{pod_script};
    my $return_data  = do_sql_query($query_string);

    foreach my $line (@{$return_data}){
        #Usage radpod <Username> <Framed-IP-Address> <X-Ascend-Session-Svr-Key> <NAS-IP-Address> 
        my $ip          = $line->[0];
        my $nas         = $line->[1];
        my $key         = $line->[2];
        my $username    = $line->[3];
        print "$pod_script $username $ip $key $nas\n";
        system("perl $pod_script $username $ip $key $nas");
    }
}

sub telkom_disable_acc {

#-------------------------------------------------------------
#--- Disable the ACCOUNT -------------------------------------
#--------------------------------------------------------------
    my($username) = @_;
    my $pu_id = _permanent_user_id_for_username($username);
    my $query_string = "UPDATE telkom_items SET value='1' WHERE name='disabled' AND permanent_user_id='$pu_id'";
    do_sql_query($query_string,1);
}


sub _permanent_user_id_for_username {

    my ($username) = @_;


    my $query_string = "SELECT id FROM permanent_users WHERE username='$username'";
    my $return_data  = do_sql_query($query_string);
    my $user_id;

    if($return_data->[0][0]){

        $user_id = $return_data->[0][0];
    }

    return $user_id;
}


#------------------------------
#---Sub to which will return --
#---the output from a query----
#------------------------------
sub do_sql_query {

    my($query,$no_return) = @_;

    my $db_server   = $data->{mysql_server}->{ip};
    my $db_name     = $data->{mysql_server}->{dbname};
    my $db_user     = $data->{mysql_server}->{username};
    my $db_password = $data->{mysql_server}->{password};

    my $DataHandle      =   DBI->connect("DBI:mysql:database=$db_name;host=$db_server",
                                     "$db_user", 
                                     "$db_password",
                                     { RaiseError => 1,
                                       AutoCommit => 0 }) || die "Unable to connect to $db_server because $DBI::errstr";

    my $StatementHandle = $DataHandle->prepare("$query");
    $StatementHandle->execute();
    if($no_return){ #We do an INSERT OR DELETE No return data needed
        $StatementHandle->finish();
        $DataHandle->disconnect();
        return;
    }

    my $ReturnData      = $StatementHandle->fetchall_arrayref();
    $StatementHandle->finish();
    $DataHandle->disconnect();
    return $ReturnData;
}

1;
