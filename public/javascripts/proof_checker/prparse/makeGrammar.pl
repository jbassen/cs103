#!/usr/bin/perl -w

# Script to extract CFGs for various subgrammars from a single master
# jison file, using an #ifdef like mechanism.
# (Can't use c preprocessor because it does other harmful transformations).

use strict;

if (scalar(@ARGV) ne 3) {
    print "usage: makeGrammars <sourcefile> <language> <jisonfile>";
}

my $sourceFile = $ARGV[0];
my $language = $ARGV[1];
my $jisonFile = $ARGV[2];

open(INFILE, "<$sourceFile") || die "Open of file $sourceFile failed: $!";

open(JISON, ">$jisonFile") || die "Open of file $jisonFile failed: $!";

my $state = 'any';			# Says what to do with lines.

while (my $line = <INFILE>) {
    # e.g.  #iflang  proof
    if ($line =~ /^\#iflang \s*(.*)\s*/) {
	$state = $1;
    }
    elsif ($state eq 'any' || $state eq $language) {
	print JISON $line;
    }
}

close(INFILE);
close(JISON);

