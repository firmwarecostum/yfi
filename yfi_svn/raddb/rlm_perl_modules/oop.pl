#!/usr/bin/perl


use lib "/usr/local/etc/raddb/rlm_perl_modules";
use SQLConnector;
use Devices;
use Attributes;
use SQLCounter;
use Data::Dumper;

print "Invoke MyClass method\n";
my $sql_connector = SQLConnector->new();

#print Dumper($sql_connector->query('SELECT * FROM users'));
$sql_connector->prepare_statements();


#------ Sample -----------------------------------------------
my $nas     = $sql_connector->one_statement_value('na_id','1');
#print Dumper($nas->{'shortname'});
#-------------------------------------------------------------

my $sql_counter = SQLCounter->new($sql_connector);

$sql_counter->create_sql_counter_hash();

$sql_counter->counter_check('dvdwalt@ri',{});

$sql_connector->finish_statements();

$sql_connector->{'db_handle'}->disconnect();