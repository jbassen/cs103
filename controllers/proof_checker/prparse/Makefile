# FIXME: Need to find a nice way to generate everything from the same source grammar.

all: prParse.js mathparse.js

prParse.js:	prParse.jison
	jison prParse.jison

mathparse.js:	mathparse.jison
	jison mathparse.jison

mathparse.jison:	master.grammar
	perl makeGrammar.pl master.grammar math mathparse.jison

prParse.jison:	master.grammar
	perl makeGrammar.pl master.grammar proof prParse.jison

clean:
	rm prParse.js mathparse.js prParse.jison mathparse.jison
