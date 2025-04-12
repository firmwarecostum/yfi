#!  /usr/bin/perl -w

use strict;

my $cap = 1132309;
my $extra_caps = 5435435;
my $usage   = 4009059;

my $pu = ($usage/($cap+$extra_caps))*100;
$b = sprintf("%.0f", $pu);

print $b;