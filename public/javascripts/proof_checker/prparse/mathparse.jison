/* description: Parses end executes mathematical expressions. */

// Copyright (c) 2014 by the Board of Trustees of Leland Stanford Junior University and David L. Dill
// All Rights Reserved.

%{
/* Global variables */
   var _label;			// holds label during grammar actions.
%}

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
"//".*	              /* comment (suboptimal, but easy) */
"function"	      return 'function';
"eval"		      return 'eval';
"domain" 	      return 'domain'
"codomain"            return 'codomain'
\"([^"\\]|(\\(.|\n)))*\" { yytext=yytext.substring(1, yytext.length-1); return 'STRING'; }
";"		      return ';';
"|"		      return '|';
"\\T"		      return '\\T';
"T"		      return '\\T';
"\\F"		      return '\\F';
"F"		      return '\\F';
"("		      return '('
")"		      return ')'
"\\{"		      return '\\{'
"\\}"		      return '\\}'
","		      return ','
":"		      return ':'
"\\times"             return '\\times'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"\\cdot"              return '\\cdot'
"*"	              return '\\cdot'
"^"                   return '^'
"\\logeq"	      return '\\logeq'
"<=>"		      return '\\logeq'
"="		      return '='
"\\ne"		      return '\\ne'
"\\ge"		      return '\\ge'
">="		      return '\\ge'
"\\le"		      return '\\le'
"<="		      return '\\le'
"<"		      return '<'
">"		      return '>'
"["                   return '['
"]"                   return ']'
"\\integers"	      return '\\integers'
"\\reals"	      return '\\reals'
"\\rationals"	      return '\\rationals'
"\\naturals"	      return '\\naturals'
"\\emptyset"	      return '\\emptyset'
"\\cup" 	      return '\\cup'
"\\cap" 	      return '\\cap'
"\\powset" 	      return '\\powset'
"\\ldots"	      return '\\ldots'
"\\in"		      return '\\in'
"\\subseteq" 	      return '\\subseteq'
"\\supseteq" 	      return '\\supseteq'
"\\subset" 	      return '\\subset'
"\\supset" 	      return '\\supset'
"\\ldots"	      return '\\ldots'
"\\vee"		      return '\\vee'
"vv"	              return '\\vee'
"or"	      	      return '\\vee'
"\\implies"	      return '\\implies'
"->"		      return '\\implies'
"\\bicond"	      return '\\bicond'
"<->"		      return '\\bicond'
"\\xor"		      return '\\xor'
"o+"	              return '\\xor'
"\\wedge"	      return '\\wedge'
"^^"                  return '\\wedge'
"and"                 return '\\wedge'
"\\neg"		      return '\\neg'
"\\forall"	      return '\\forall'
"AA"	              return '\\forall'
"\\exists"	      return '\\exists'
"EE"		      return '\\exists'
"\\relation"	      return '\\relation'
"\\to"		      return '\\to'
"\\mapsto"	      return '\\mapsto'
"\\lambda"	      return '\\lambda'
"if"		      return 'if'
"then"		      return 'then'
"else"		      return 'else'
"endif"		      return 'endif'
"."		      return '.'

[0-9]+("."[0-9]+)?\b  return 'NUMBER'
"def"	      	      return 'DEF'
"proof"	      	      return 'PROOF'
"end"	              return 'END'
"by"		      return 'BY'
"var"		      return 'VAR'
[a-zA-Z]([a-zA-Z0-9])*	return 'SYMBOL'

<<EOF>>               return 'EOF'
.                     {
		      // print("illegal char");  return 'INVALID_CHAR';
		      return "INVALID_CHAR";
		      }

/lex

/* operator associations and precedence */

%nonassoc DEF
%left    LAMBDA
%nonassoc '\\relation'
%nonassoc '\\logeq'
%nonassoc '\\implies'
%left ''\\bicond', ''\\xor'
%left '\\vee', 
%left '\\wedge'
%left '\\neg'
%nonassoc '\\subseteq' '\\supseteq' '\\subset' '\\supset'
%nonassoc '\\in'
%left '\\cup' '\\backslash'
%left '\\cap'
%left '\\times'
%nonassoc '\\forall' '\\exists'
%left '\\ldots'
%nonassoc '<' '>' '\\le' '\\ge' '='
%left '+' '-'
%left '\\cdot' '/'
%left UMINUS
%right '^'
%left '('
%left '.'


%start top

%% /* language grammar */

top
    :  e EOF { return $1; }
    ;

e
    : '\\T' { $$ = exprProto.trueVal; }
    | '\\F' { $$ = exprProto.falseVal; }
    | e '\\vee' e
        {$$ = makeExpr('\\vee', [$1, $3]);}
    | e '\\implies' e
        {$$ = makeExpr('\\implies', [$1, $3]);}
    | e '\\bicond' e
        {$$ = makeExpr('\\bicond', [$1, $3]);}
    | e '\\xor' e
        {$$ = makeExpr('\\xor', [$1, $3]);}
    | e '\\wedge' e
        {$$ = makeExpr('\\wedge', [$1, $3]);}
    | '\\neg' e
        {$$ = makeExpr('\\neg', [$2]);}
// Need the ':' in quantifiers because of parsing problem.
// conflict with \forall x \in S (e)
// Interpret as S is type of x, or S(e) is type of x?
// can't resolve without infinite lookahead.
    | '\\forall' vardecllist ':' e 
        {$$ = makeExpr('\\forall', [$2, $4]); }
    | '\\exists' vardecllist ':' e 
        {$$ = makeExpr('\\exists', [$2, $4]); }
    | e '=' e
    	{$$ = makeExpr('=', [$1, $3]); }
    | e '\\logeq' e
    	{$$ = makeExpr('\\logeq', [$1, $3]); }
    | e '\\le' e
    	{$$ = makeExpr('\\le', [$1, $3 ]); }
    | e '\\ge' e
    	{$$ = makeExpr('\\ge', [$1, $3]); }
    | e '<' e
    	{$$ = makeExpr('<', [$1, $3]); }
    | e '>' e
    	{$$ = makeExpr('>', [$1, $3]); }
    | e '+' e
        {$$ = makeExpr('+', [$1, $3]);}
    | e '-' e
        {$$ = makeExpr('-', [$1, $3]);}
    | e '\\cdot' e
        {$$ = makeExpr('\\cdot', [$1, $3]);}
    | e '/' e
        {$$ = makeExpr('/', [$1, $3]);}	
    | e '^' e
        {$$ = makeExpr('^', [$1, $3]);}	
    | '-' e %prec UMINUS
        {$$ = makeExpr('#UMINUS', [$2]);}
    | e '\\cup' e
        {$$ = makeExpr('\\cup', [$1, $3]);}
    | e '\\cap' e
        {$$ = makeExpr('\\cap', [$1, $3]);}
    | e '\\times' e
        {$$ = makeExpr('\\times', [$1, $3]);}
    | e '\\backslash' e
        {$$ = makeExpr('\\backslash', [$1, $3]);}
    | '\\powset' '{' e '}'
        {$$ = makeExpr('\\powset', [$1, $3]);}
    | '[' e '\\ldots' e ']' 
	{ $$ = makeExpr('\\ldots', [$2, $4]); }
    | '\\emptyset'
        {$$ = makeExpr('\\emptyset', []);}
    | '\\integers'
        {$$ = makeExpr('\\integers', []);}
    | '\\rationals'
        {$$ = makeExpr('\\rationals', []);}
    | '\\reals'
        {$$ = makeExpr('\\reals', []);}
    | '\\naturals'
        {$$ = makeExpr('\\naturals', []);}
    | e '\\in' e 
	{$$ = makeExpr('\\in', [$1, $3 ]); }	
    | e '\\subseteq' e
        {$$ = makeExpr('\\subseteq', [$1, $3]);}
    | e '\\supseteq' e
        {$$ = makeExpr('\\supseteq', [$1, $3]);}
    | e '\\subset' e
        {$$ = makeExpr('\\subset', [$1, $3]);}
    | e '\\supset' e
        {$$ = makeExpr('\\supset', [$1, $3]); }
    | '\\{' e '|' vardecllist ':' e '\\}'
       {
          $$ = makeExpr('comprehension', [$2, $4, $6]);
      }
    | '\\relation' e '\\to' e ':' e
      {
	$$ = makeExpr('\\relation', [$2, $4, $6]);
      }
    | '\\{' exprlist '\\}'
       { $$ = makeExpr('Set', $2); }
    | e '.' e { $$ = makeExpr("getfield", [$1, $3]); }
    | e '(' exprlist ')' 
      {  /* op in function is Symbol expr */   
         $$ = makeExpr($1, $3); }
    | e '(' ')' 
      { $$ = makeExpr($1, []); }
    | '[' recorddecllist ']'
       { $$ = makeExpr('recordfields', $2); }
    | '(' tupleexprlist ')' 
       { $$ = makeExpr('Tuple', $2); }
    | '(' e ')'
// causes lots of problems.
//        {$$ = makeExpr('(', [$2]) ;} // preserve parentheses
	  {$$ = $2; } 
	  
    | NUMBER
        {$$ = makeExpr('Number', [parseInt($1)]) ;}  // FIXME: In future, rationals? bignums? FP?
    | SYMBOL
        {$$ = makeExpr('Symbol', [$1]) ;}
    | STRING
        { $$ = makeExpr('String', [$1]); }
    | '\\lambda' vardecllist ':' e %prec LAMBDA
      { $$ = makeExpr('\\lambda', [$2, $4 ]); }
    | 'if' e 'then' e 'else' e 'endif' { $$ = makeExpr('ite', [$2, $4, $6 ]); }
    | 'if' e 'then' e 'endif' { throw new Error("if-then must have else."); }
    ;

exprlist
    : e  { $$ = [ $1]; }
    | exprlist ',' e
     { $1.push($3);
       $$ = $1;
     }
    ;

tupleexprlist
    : e ',' e  { $$ = [$1, $3]; }
    | tupleexprlist ',' e
      {
        $1.push($3);
        $$ = $1;
      }
    ;

vardecl
    : SYMBOL '\\in' e { $$ = makeExpr('vardecl', [makeExpr('Symbol', [$1]), $3 ]); }
    | SYMBOL { $$ = makeExpr('vardecl', [makeExpr('Symbol', [$1]), exprProto.anyMarker]); }
    ;

vardecllist1
    : vardecllist1 ',' vardecl { $$ = $1; $$.push($3); }
    | vardecl  { $$ = [ $1 ]; }
    ;

vardecllist
    : vardecllist1 { $$ = makeExpr('vardecllist', $1); }
    ;

recorddecl
    : SYMBOL '\\mapsto' e { $$ = makeExpr("\\mapsto", [$1, $3]); }
    ;

recorddecllist1
    : recorddecllist1 ',' recorddecl { $$ = $1; $$.push($3); }
    | recorddecl { $$ = [ $1 ]; }
    ;

recorddecllist
    : recorddecllist1 { $$ = $1; }
    ;

symlist
    : symlist ',' SYMBOL { $$ = $1; $$.push($3); }
    | SYMBOL { $$ = [ $1 ] ; }
    ;

