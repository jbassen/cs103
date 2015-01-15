/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var blocksParser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"formula":3,"e":4,"EOF":5,"\\\\T":6,"\\\\F":7,"\\\\vee":8,"\\\\implies":9,"\\\\bicond":10,"\\\\xor":11,"\\\\wedge":12,"\\\\neg":13,"\\\\forall":14,"vardecllist":15,"\\\\exists":16,"(":17,"exprlist":18,")":19,"=":20,"\\\\not":21,"\\\\ne":22,"SYMBOL":23,"vardecl":24,"vardecllist1":25,",":26,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"\\\\T",7:"\\\\F",8:"\\\\vee",9:"\\\\implies",10:"\\\\bicond",11:"\\\\xor",12:"\\\\wedge",13:"\\\\neg",14:"\\\\forall",16:"\\\\exists",17:"(",19:")",20:"=",21:"\\\\not",22:"\\\\ne",23:"SYMBOL",26:","},
productions_: [0,[3,2],[4,1],[4,1],[4,3],[4,3],[4,3],[4,3],[4,3],[4,2],[4,3],[4,3],[4,4],[4,3],[4,3],[4,4],[4,3],[4,1],[24,1],[25,3],[25,1],[15,1],[18,1],[18,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: return $$[$0-1]; 
break;
case 2: this.$ = ['\\T']; 
break;
case 3: this.$ = ['\\F']; 
break;
case 4:this.$ = ['\\vee', $$[$0-2], $$[$0]];
break;
case 5:this.$ = ['\\implies', $$[$0-2], $$[$0]];
break;
case 6:this.$ = ['\\bicond', $$[$0-2], $$[$0]];
break;
case 7:this.$ = ['\\xor', $$[$0-2], $$[$0]];
break;
case 8:this.$ = ['\\wedge', $$[$0-2], $$[$0]];
break;
case 9:this.$ = ['\\neg', $$[$0]];
break;
case 10:this.$ = [ '\\forall', $$[$0-1], $$[$0] ]; 
break;
case 11:this.$ = [ '\\exists', $$[$0-1], $$[$0] ]; 
break;
case 12: $$[$0-1].unshift('call', $$[$0-3]);
        this.$ = $$[$0-1];
      
break;
case 13:this.$ = $$[$0-1] ;
break;
case 14: this.$ = ['=', $$[$0-2], $$[$0]]; 
break;
case 15: this.$ = ['\\neg', ['=', $$[$0-3], $$[$0]] ]; 
break;
case 16: this.$ = ['\\neg', ['=', $$[$0-2], $$[$0]] ]; 
break;
case 17:this.$ = ['Symbol', $$[$0]] ;
break;
case 18: this.$ = [ 'vardecl', ['Symbol', $$[$0]], ['Symbol', 'world'] ]; 
break;
case 19: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 20: this.$ = [ $$[$0] ]; 
break;
case 21: this.$ = $$[$0]; this.$.unshift("vardecllist"); 
break;
case 22: this.$ = [ $$[$0]]; 
break;
case 23: $$[$0-2].push($$[$0]);
       this.$ = $$[$0-2];
     
break;
}
},
table: [{3:1,4:2,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{1:[3]},{5:[1,10],8:[1,11],9:[1,12],10:[1,13],11:[1,14],12:[1,15],17:[1,16],20:[1,17],21:[1,18],22:[1,19]},{5:[2,2],8:[2,2],9:[2,2],10:[2,2],11:[2,2],12:[2,2],17:[2,2],19:[2,2],20:[2,2],21:[2,2],22:[2,2],26:[2,2]},{5:[2,3],8:[2,3],9:[2,3],10:[2,3],11:[2,3],12:[2,3],17:[2,3],19:[2,3],20:[2,3],21:[2,3],22:[2,3],26:[2,3]},{4:20,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{15:21,23:[1,24],24:23,25:22},{15:25,23:[1,24],24:23,25:22},{4:26,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{5:[2,17],8:[2,17],9:[2,17],10:[2,17],11:[2,17],12:[2,17],17:[2,17],19:[2,17],20:[2,17],21:[2,17],22:[2,17],26:[2,17]},{1:[2,1]},{4:27,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{4:28,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{4:29,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{4:30,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{4:31,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{4:33,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],18:32,23:[1,9]},{4:34,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{20:[1,35]},{4:36,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{5:[2,9],8:[2,9],9:[2,9],10:[2,9],11:[2,9],12:[2,9],17:[1,16],19:[2,9],20:[1,17],21:[1,18],22:[1,19],26:[2,9]},{4:37,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{6:[2,21],7:[2,21],13:[2,21],14:[2,21],16:[2,21],17:[2,21],23:[2,21],26:[1,38]},{6:[2,20],7:[2,20],13:[2,20],14:[2,20],16:[2,20],17:[2,20],23:[2,20],26:[2,20]},{6:[2,18],7:[2,18],13:[2,18],14:[2,18],16:[2,18],17:[2,18],23:[2,18],26:[2,18]},{4:39,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{8:[1,11],9:[1,12],10:[1,13],11:[1,14],12:[1,15],17:[1,16],19:[1,40],20:[1,17],21:[1,18],22:[1,19]},{5:[2,4],8:[2,4],9:[2,4],10:[2,4],11:[2,4],12:[1,15],17:[1,16],19:[2,4],20:[1,17],21:[1,18],22:[1,19],26:[2,4]},{5:[2,5],8:[1,11],10:[1,13],11:[1,14],12:[1,15],17:[1,16],19:[2,5],20:[1,17],21:[1,18],22:[1,19],26:[2,5]},{5:[2,6],8:[1,11],9:[2,6],10:[2,6],11:[2,6],12:[1,15],17:[1,16],19:[2,6],20:[1,17],21:[1,18],22:[1,19],26:[2,6]},{5:[2,7],8:[1,11],9:[2,7],10:[2,7],11:[2,7],12:[1,15],17:[1,16],19:[2,7],20:[1,17],21:[1,18],22:[1,19],26:[2,7]},{5:[2,8],8:[2,8],9:[2,8],10:[2,8],11:[2,8],12:[2,8],17:[1,16],19:[2,8],20:[1,17],21:[1,18],22:[1,19],26:[2,8]},{19:[1,41],26:[1,42]},{8:[1,11],9:[1,12],10:[1,13],11:[1,14],12:[1,15],17:[1,16],19:[2,22],20:[1,17],21:[1,18],22:[1,19],26:[2,22]},{5:[2,14],8:[2,14],9:[2,14],10:[2,14],11:[2,14],12:[2,14],17:[1,16],19:[2,14],21:[1,18],26:[2,14]},{4:43,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{5:[2,16],8:[2,16],9:[2,16],10:[2,16],11:[2,16],12:[2,16],17:[1,16],19:[2,16],21:[1,18],26:[2,16]},{5:[2,10],8:[2,10],9:[2,10],10:[2,10],11:[2,10],12:[2,10],17:[1,16],19:[2,10],20:[2,10],21:[2,10],22:[2,10],26:[2,10]},{23:[1,24],24:44},{5:[2,11],8:[2,11],9:[2,11],10:[2,11],11:[2,11],12:[2,11],17:[1,16],19:[2,11],20:[2,11],21:[2,11],22:[2,11],26:[2,11]},{5:[2,13],8:[2,13],9:[2,13],10:[2,13],11:[2,13],12:[2,13],17:[2,13],19:[2,13],20:[2,13],21:[2,13],22:[2,13],26:[2,13]},{5:[2,12],8:[2,12],9:[2,12],10:[2,12],11:[2,12],12:[2,12],17:[2,12],19:[2,12],20:[2,12],21:[2,12],22:[2,12],26:[2,12]},{4:45,6:[1,3],7:[1,4],13:[1,5],14:[1,6],16:[1,7],17:[1,8],23:[1,9]},{5:[2,15],8:[2,15],9:[2,15],10:[2,15],11:[2,15],12:[2,15],17:[1,16],19:[2,15],20:[2,15],22:[2,15],26:[2,15]},{6:[2,19],7:[2,19],13:[2,19],14:[2,19],16:[2,19],17:[2,19],23:[2,19],26:[2,19]},{8:[1,11],9:[1,12],10:[1,13],11:[1,14],12:[1,15],17:[1,16],19:[2,23],20:[1,17],21:[1,18],22:[1,19],26:[2,23]}],
defaultActions: {10:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 26;
break;
case 2: yy_.yytext=yy_.yytext.substring(1, yy_.yytext.length-1); return 'STRING'; 
break;
case 3:return 6;
break;
case 4:return 7;
break;
case 5:return 17
break;
case 6:return 19
break;
case 7:return 8
break;
case 8:return 8
break;
case 9:return 8
break;
case 10:return 9
break;
case 11:return 9
break;
case 12:return 10
break;
case 13:return 10
break;
case 14:return 11
break;
case 15:return 11
break;
case 16:return 12
break;
case 17:return 12
break;
case 18:return 12
break;
case 19:return 13
break;
case 20:return 14
break;
case 21:return 14
break;
case 22:return 16
break;
case 23:return 16
break;
case 24:return 20
break;
case 25:return 21
break;
case 26:return 22
break;
case 27:return 'NUMBER'
break;
case 28:return 23
break;
case 29:return 5
break;
case 30:
		      // print("illegal char");  return 'INVALID_CHAR';
		      return "INVALID_CHAR";
		      
break;
}
},
rules: [/^(?:\s+)/,/^(?:,)/,/^(?:"([^"\\]|(\\(.|\n)))*")/,/^(?:\\T\b)/,/^(?:\\F\b)/,/^(?:\()/,/^(?:\))/,/^(?:\\vee\b)/,/^(?:vv\b)/,/^(?:or\b)/,/^(?:\\implies\b)/,/^(?:->)/,/^(?:\\bicond\b)/,/^(?:<->)/,/^(?:\\xor\b)/,/^(?:o\+)/,/^(?:\\wedge\b)/,/^(?:\^\^)/,/^(?:and\b)/,/^(?:\\neg\b)/,/^(?:\\forall\b)/,/^(?:AA\b)/,/^(?:\\exists\b)/,/^(?:EE\b)/,/^(?:=)/,/^(?:\\not\b)/,/^(?:\\ne\b)/,/^(?:[0-9]+(\.[0-9]+)?\b)/,/^(?:[a-zA-Z]([a-zA-Z0-9])*)/,/^(?:$)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = blocksParser;
exports.Parser = blocksParser.Parser;
exports.parse = function () { return blocksParser.parse.apply(blocksParser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}