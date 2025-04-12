package Devices;

use strict;
use warnings;
use Data::Dumper;

#Initialise this with a sql_connector object
sub new {

    print "   Devices::new called\n";
    my $type = shift;            # The package/type name
    my $self = {'sql_connector' => shift};               # Reference to empty hash
    return bless $self, $type;
}


sub authenticate_mac {

    my($self,$mac) = @_;

    my $return_data     = $self->{'sql_connector'}->one_statement_value('device_name',$mac);

    if(!exists $return_data->{'id'}){   #Unknown device
        return 0;
    }

	my $device_id		= $return_data->{'id'};
	my $user_id         = $return_data->{'user_id'};
	my $username		= '';
	my $password		= '';

	#Get the username for this MAC
	$return_data    = $self->{'sql_connector'}->one_statement_value('user_id',$user_id);
	$username       = $return_data->{'username'};

	#Get the password for this permanent user who has this device
    $return_data    = $self->{'sql_connector'}->one_statement_value('radcheck_username_password',$username);
    $password       = $return_data->{'value'};

	#Update the device table to indicate the last time this device made contact with us
    $self->{'sql_connector'}->one_statement_no_return('device_update_id',$device_id);

	my @rd =($username,$password);
	return @rd;
}


sub accounting_mac {

	my($self,$rad) = @_;
	my $mac 	    = $rad->{'User-Name'};

    my $return_data = $self->{'sql_connector'}->one_statement_value('device_name',$mac);

    if(!exists $return_data->{'id'}){   #Unknown device
        return 0;
    }
    my $user_id     = $return_data->{'user_id'};

	#Get the username for this MAC
    $return_data    = $self->{'sql_connector'}->one_statement_value('user_id',$user_id);
    my $username    = $return_data->{'username'};
	$rad->{'User-Name'} = $username;
	 
	my $realm_part 	= $username;
    $realm_part 	=~ s/^.+\@//;
	$rad->{'Realm'} = $realm_part;

}



1;
