package Nas;

use strict;
use warnings;

use Data::Dumper;

#Initialise this with a sql_connector object
sub new {

    print "   Nas::new called\n";
    my $type = shift;                       # The package/type name
    my $self = {'sql_connector' => shift};  # Reference to empty hash
    return bless $self, $type;
}


sub is_realm_allowed {

    my($self,$realm, $nasname) = @_;
    print "Checking if Realm $realm can use $nasname\n";

    #Get the nas id from the nas table
    my $return_data     = $self->{'sql_connector'}->one_statement_value('na_nasname',$nasname);
    my $id              = $return_data->{'id'};

    #Get all the entries of the na_id in the na_realm table
    $return_data        = $self->{'sql_connector'}->many_statement_value('na_realm_na_id',$id);
    my $count		    = @{$return_data};
    if($count > 0){

        foreach my $entry(@{$return_data}){
            my $realm_id    = $entry->[2]; #realm_id it the third column (2 if zero based)
            my $feedback    = $self->{'sql_connector'}->one_statement_value('realm_id',$realm_id);
            if($feedback->{'append_string_to_user'} eq $realm){
                return 1;
            }
        }
 	    return 0;	#Not One match return failure
    }
   return 1; #NAS can be used by all realms
}


1;
