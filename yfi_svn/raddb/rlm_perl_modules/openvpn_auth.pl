#! /usr/bin/perl -w

use strict;

use Data::Dumper;
use lib "/usr/local/etc/raddb/rlm_perl_modules";
use SQLConnector;

#Taken from the sample script
my $ARG;
if ($ARG = shift @ARGV) {
    if (!open (UPFILE, "<$ARG")) {
	print "Could not open username/password file: $ARG\n";
	exit 1;
    }
} else {
    print "No username/password file specified on command line\n";
    exit 1;
}

my $username = <UPFILE>;
my $password = <UPFILE>;

if (!$username || !$password) {
    print "Username/password not found in file: $ARG\n";
    exit 1;
}

chomp $username;
chomp $password;

close (UPFILE);
#END Taken from the sample script

#Security check, string should be 50 chars long 
my $community=$username."_".$password;
if(length($community) != 50){
    print "Preventing false attempts given: $username $password \n";
    exit 1;
}

my $sql_connector   = SQLConnector->new();
my $query_string    = "SELECT COUNT(*) FROM nas where community='$community'"; 
my $nas_detail      = $sql_connector->query($query_string);
my $count           = $nas_detail->[0][0];

if($count == 0){
    print "Username: $username and Password: $password not valid\n";
    exit 1;
}else{
    exit 0;
}

