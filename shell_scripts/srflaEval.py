"""
---------------------------------------------------------------
functions that are used in the original code but not used here:
---------------------------------------------------------------
"""
def expt(x, n):
   """function not used"""
   return x**n

def equals(e1, e2):
   """function not used"""
   return compare(e1, e2) == 0

def isArray(obj):
   """function not used"""
   return isinstance(obj, list)

def divide(e):
   """function not used"""
   return e[1][1] / float(e[2][1])   # custom exception handler is removed.

# lambda functions are used to replace functions below.
def srflaAnd(e1, e2):
   """function not used"""
   return bool_to_srfla(is_true(e1) and is_true(e2))

def srflaOr(e1, e2):
   """function not used"""
   return bool_to_srfla(is_true(e1) or is_true(e2))

def srflaImplies(e1, e2):
   """function not used"""
   return bool_to_srfla(not is_true(e1) or is_true(e2))

def srflaBicond(e1, e2):
   """function not used"""
   return bool_to_srfla(isTrue(e1) == isTrue(e2))

def srflaXor(e1, e2):
   """function not used"""
   return bool_to_srfla(isTrue(e1) != isTrue(e2))

def union(e1, e2):
   """function not used"""
   return bool_set_op(e1, e2, True, True, True)

def intersection(e1, e2):
   """function not used"""
   return bool_set_op(e1, e2, False, False, True)

def setdiff(e1, e2):
   """function not used"""
   return bool_set_op(e1, e2, True, False, False)


"""
---------------------------------------------------------------
functions that are defined but not used in the original code:
---------------------------------------------------------------
"""
def isSymbol(e):
   """the function is declared but not used in the original

   ?? little bit confused about what it's supposed to do
   len(e) == 1 changed to len(e) == 2.
   """
   return (len(e) == 2 and e[1] == 'Symbol')

def domain(e):
   """function not used"""
   return e[1]  #  need error-checking probably.

def codomain(e):
   """function not used"""
   return e[2]

def graph(e):
   """function not used"""
   return e[3]

def isArray(obj):
   """function not used"""
   return isinstance(e, list)

"""
---------------------------------------------------------------
New butchered srfla_eval.
---------------------------------------------------------------
"""
import math
import operator

CONST_SRFLAFALSE = ['\\F']
CONST_SRFLATRUE = ['\\T']
LIMIT_EXPT = 20
LIMIT_SET_SIZE = 1000
LIMIT_ARITH = 10000

def is_true(e):
   """return a python boolean"""
   return e[0] == '\\T'

def is_leaf(op):
   """op is string rep of operator

   Note: The first line is placed so that the code won't be broken
   if op is not a string. (eg. op = []).
   """
   if not isinstance(op, basestring):
      raise Exception("Operator must be a string: " + str(op))
   operator = ['Number', 'String', 'Symbol']
   if op not in operator:
      return 0    # default is 0
   return 1

def check_is_term(e):
   """assert that something is a term.

   FIXME: Terms should be a class, later.  Build this in as a method or attribute.
   Not really understand what fix me is about (term should be a class?).
   Note: str(e) in the last line can be replaced by custom tree printer.
   """
   if isinstance(e, list) and len(e) > 0 and isinstance(e[0], basestring):
      return
   raise Exception("Not a term: " + str(e))    # str() can be replaced.

def compare(e1, e2):
   """comparison function

   FOR NOW: just need to compare constant terms.
   operators can be number, string, set, tuple (and that's it?).
   maybe function and relation?
   Order "lexicographically" by operator.
   If operators are the same, go by children, in order.
   Note: error checking now provides more useful information.
         However, don't expect all the errors can be revealed by this comparison function,
         instead they are revealed through evaluation.
   """
   # error checking for e1
   if not isinstance(e1, list):
      raise Exception("List expected when parsing arg1: " + str(e1))
   if len(e1) == 0:
      raise Exception("List must include an operator. arg1: " + str(e1))
   if not isinstance(e1[0], basestring):
      raise Exception("Operator must be a string for arg1: " + str(e1[0]))

   # error checking for e2
   if not isinstance(e2, list):
      raise Exception("List expected when parsing arg2: " + str(e2))
   if len(e2) == 0:
      raise Exception("List must include an operator. arg2: " + str(e2))
   if not isinstance(e2[0], basestring):
      raise Exception("Operator must be a string for arg2: " + str(e2[0]))

   # set up priorities
   legal_operator = {'\\T': 0.8, '\\F': 0.2, 'Number': 1.8, 'String': 2.8, 'Tuple': 4.2, 'Set': 4.8, 'Record': 5.2};
   if e1[0] not in legal_operator or e2[0] not in legal_operator:
      raise Exception("Illegal operator.\narg1: " + str(e1[0]) + "\narg2: " + str(e2[0]))
   if e1 == e2:
      return 0
   if e1[0] != e2[0]:   # not the same type! order alphabetically.
      return int(round(legal_operator[e1[0]] - legal_operator[e2[0]]))
   return {
      1: lambda e1, e2: 0,    # Note: not sure if this case exists: \\T and \\F
      2: lambda e1, e2: e1[1] - e2[1], # Number
      3: cmp, # String
      5: compare_set_or_tuple, # Set or Tuple
      6: compare_record # Record
   }[math.ceil(legal_operator[e1[0]])](e1, e2)

def compare_set_or_tuple(e1, e2):
   """compare set or tuple based on each individual slot.

   mutual recursion (compare and compareSetOrTuple)
   """
   for i in range(1, min(len(e1), len(e2))):
      c = compare(e1[i], e2[i])
      if c != 0:
         return c
   return len(e1) - len(e2)

def compare_record(e1, e2):
   """compare record after normalization.

   mutual recursion (compare and compare_record)
   """
   dict1 = sorted(e1[1].items())
   dict2 = sorted(e2[1].items())
   for i in range(0, min(len(dict1), len(dict2))):
      c = cmp(dict1[i][0], dict2[i][0])
      if c != 0:
         return c
      c = compare(dict1[i][1], dict2[i][1])
      if c != 0:
         return c
   return len(dict1) - len(dict2)

def normalize_set(e):
   """Sort set members and eliminate duplicates"""
   if len(e) > LIMIT_SET_SIZE:
      raise Exception("Set size too large")
   result = list(e)
   result[1:] = sorted(result[1:], cmp = compare)   # use compare function to make sure consistency.
   for i in reversed(range(1, len(result))):
      if result[i - 1] == result[i]:
         del result[i] # remove duplicates in the set
   return result

def bool_to_srfla(b):
   """Convert boolean to srfla true/false"""
   if b:
      return CONST_SRFLATRUE
   return CONST_SRFLAFALSE

def get_field(e, int):
   """get record or tuple field"""
   e1 = srfla_eval(e[1], int)
   e2 = srfla_eval(e[2], int)
   if e1[0] == 'Tuple':
      if e2[0] != 'Number':
         raise Exception("Tuple index must be numerical: " + str(e2))
      if e2[1] not in range(1, len(e1)): # tuple is 1-based
         raise Exception("Tuple index out of bound: " + str(e2[1]))
      return e1[e2[1]]
   if e1[0] == 'Record':
      if e2[0] != 'String':
         raise Exception("Record field access must be a symbol: " + str(e2))
      if e2[1] not in e1[1]:
         raise Exception("Not found in record: " + str(e2[1]))
      return e1[1][e2[1]]
   raise Exception("Access to non-tuple or record: " + str(e))

def is_member(e1, e2):
   """check if e1 is in e2

   prerequisite: e2 is a list
   """
   if not isinstance(e2, list):
      raise Exception("List expected. " + str(e2))
   return bool_to_srfla(e1 in e2[1:])

def set_op(e1, e2, s1, s2, s3):
   """generic function for union, intersection, setdiff (and symmetric diff, if we want it)

   s1 adds all the elements in e1 that are not in e2.
   s2 adds all the elements in e2 that are not in e1.
   s3 adds all the elements that appear in both sets.
   perequisite: e1 and e2 are lists
   Note: in fact, e1 and e2 must be ordered by cmp = compare
   """
   result = ['Set']
   if not isinstance(e1, list):
      raise Exception("List expected. set one: " + str(e1))
   if not isinstance(e2, list):
      raise Exception("List expected. set two: " + str(e2))
   i1 = 1
   i2 = 1
   while i1 < len(e1) and i2 < len(e2):
      c = compare(e1[i1], e2[i2])
      if c < 0:
         if s1:
            result.append(e1[i1])
         i1 += 1
      elif c > 0:
         if s2:
            result.append(e2[i2])
         i2 += 1
      else:
         if s3:
            result.append(e1[i1])
         i1 += 1
         i2 += 1
   if s1:
      result += e1[i1:]
   if s2:
      result += e2[i2:]
   return result

def is_subset(e1, e2, needProper):
   """Checks whether constant e1 is a subseteq of e2.
   if needProper === true, requires proper subset.
   returns srfla boolean

   prerequisite: e1 and e2 must be lists
   """
   if not isinstance(e1, list):
      raise Exception("List expected. " + str(e1))
   if not isinstance(e2, list):
      raise Exception("List expected. " + str(e2))
   i1 = 1
   i2 = 1
   isProper = False
   while i1 < len(e1) and i2 < len(e2):
      c = compare(e1[i1], e2[i2])
      if c < 0:
         i1 += 1
         return CONST_SRFLAFALSE
      elif c > 0:
         i2 += 1
         isProper = True
      else:
         i1 += 1
         i2 += 1
   if i1 < len(e1):
      return CONST_SRFLAFALSE
   return bool_to_srfla(not needProper or isProper or i2 < len(e2))

def product(e1, e2):
   """cartesian product of two sets

   prerequisite: e1 and e2 must be lists
   """
   if not isinstance(e1, list):
      raise Exception("List expected. " + str(e1))
   if not isinstance(e2, list):
      raise Exception("List expected. " + str(e2))
   result = ['Set']
   if (len(e1) - 1) * (len(e2) - 1) >= LIMIT_SET_SIZE:
      raise Exception("The product result contains too many items")
   [result.append(['Tuple', elem1, elem2]) for elem1 in e1[1:] for elem2 in e2[1:]]
   return result

def power_set_generator(e):
   if len(e) == 0:
      yield([])
   else:
      for elem in power_set_generator(e[:-1]):
         yield(elem)
      for elem in power_set_generator(e[:-1]):
         yield(elem + e[-1:])

def power_set(e):
   if len(e) >= LIMIT_EXPT:
      raise Exception("Set size too large for powerset operation")
   return ['Set', ['Set']] + [['Set'] + elem for elem in power_set_generator(e[1:]) if elem != []]

def eval_range(e1, e2):
   """expand subrange to a set"""
   if e2[1] - e1[1] >= LIMIT_SET_SIZE:
      raise Exception("Range too large")
   return ['Set'] + [['Number', i] for i in range(e1[1], e2[1] + 1)]

def eval_quantifiers(init, vardecls, body, int, count):
   """evaluate quantifier with multiple variables.

   init is result for empty set (T for forall, F for exists).
   vardecls is a list [ ['vardecl', ['Symbol', 'x'], ['Set', ['Number', 1] ....]], ['vardecl', ...]]
   Unlike other eval1 functions, this does recursive evaluation because it requires
   a special evaluation strategy.
   FIXME: Figure out how to do this with evalComprehension.
          Return interpretation when we get short-circuit -- how to "return"?
   Note: fixme is unclear. Example?
         NOT TESTED
   """
   count[0] += 1
   if count[0] >= LIMIT_SET_SIZE:
      raise Exception("Set size too large for quantifiers")
   check_is_term(init)
   for arg in vardecls[1:]:
      check_is_term(arg)
   check_is_term(body)
   if len(vardecls) == 0:
      # For comprehension, same code, but eval result expression and
      # apply accumulation function here.
      return srfla_eval(body, int)
   binding = vardecls[0]
   symbol = binding[1]
   variable = symbol[1]
   set = srfla_eval(binding[2], int)[1:]
   new_vardecls = vardecls[1:]
   result = init
   new_int = int.copy()
   for value in set:
      new_int[variable] = value
      result = eval_quantifiers(init, new_vardecls, body, new_int, count)
      if compare(init, result) != 0:
         return result
   return result

def check_vardecl_list_size(e):
   if len(e) > LIMIT_EXPT:
      raise Exception("Vardecl list contains too many symbols")

def eval_for_all(e, int):
   """
   FIXME: This is a special case of something more general: map, collect & reduce.
   Are set comprehensions also a special case?
   e is ['\\forall', <vardecls>, <body>], int is an object (interpretation)
   Note: not tested.
   """
   check_vardecl_list_size(e[1][1:])
   count = 0
   return eval_quantifiers(CONST_SRFLATRUE, e[1][1:], e[2], int, [count])

def eval_exists(e, int):
   """
   e is ['\\exists', <vardecls>, <body>], int is an object (interpretation)
   Note: not tested.
   """
   check_vardecl_list_size(e[1][1:])
   count = 0
   return eval_quantifiers(CONST_SRFLAFALSE, e[1][1:], e[2], int, [count])

def eval_comprehension(reduce_fn, accum_result, vardecls, filter_form, result_term, int, count):
   count[0] += 1
   if count[0] >= LIMIT_SET_SIZE:
      raise Exception("Set size too large for quantifiers")
   for elem in vardecls:
      check_is_term(elem)
   check_is_term(filter_form)
   check_is_term(result_term)
   if len(vardecls) == 0:
      if is_true(srfla_eval(filter_form, int)):
         new_elt = list(srfla_eval(result_term, int))
         return reduce_fn(accum_result, [new_elt])
      return accum_result
   binding = vardecls[0]
   symbol = binding[1]
   variable = symbol[1]
   set = srfla_eval(binding[2], int)[1:]
   new_vardecls = vardecls[1:]
   new_int = int.copy()
   for elem in set:
      new_int[variable] = elem
      accum_result = eval_comprehension(reduce_fn, accum_result, new_vardecls,
                                        filter_form, result_term, new_int, count)
   return accum_result

def srfla_eval_comprehension(e, int):
   check_vardecl_list_size(e[2][1:])
   count = 0
   return normalize_set(eval_comprehension(operator.concat, ['Set'], e[2][1:], e[3], e[1], int, [count]))

def eval_record(e, int):
   """
   [ 'recordfields', ['\\mapsto', var, val], ...] ]
   Note: not tested.
   """
   rec = {}
   for elem in e[1:]:
      # FIXME: Should I allow dependencies on previous field decls, like let*?
      # not understand FIXME.
      rec[elem[1]] = srfla_eval(elem[2], int)
   # FIXME: need different tags for record literal and record parse tree.
   # Note: not sure what FIXME is about
   return ['Record', rec]

def apply_lambda(lambda_expr, actuals, int):
   """evaluate lambdaExpr given actuals and int

   lambda expression is in form of ['\\lambda', ['args', <formals>], <body>]
   actuals is in form of [<actuals>] and has the one to one relation with <formals>
   Note: not TESTED.
   """
   formals = lambda_expr[1][1:]
   body = lambda_expr[2]
   if len(formals) != len(actuals):
      raise Exception("Different numbers of formals and actuals in: \n"
                      + str(formals) + "\n" + str(actuals))
   new_int = int.copy()
   # bind formals to actuals
   for i in range(len(actuals)):
      new_int[formals[i]] = srfla_eval(actuals[i], int)
   return srfla_eval(body, new_int)

def eval_call(e, int):
   """evalutate a call expression.

   e = ['call', funexpr, ...]
   Funexpr must eval to a javascript function or a lambda expression.
   Note: right now javascript function is not supported.
   """
   efun = srfla_eval(e[1], int) # eval the operator
   actuals = e[2:]
   if isinstance(efun, list) and efun[0] == '\\lambda':
      return apply_lambda(efun, actuals, int)
   raise Exception("Call not a function: " + str(efun))

def eval_ite(e, int):
   eval_cond = srfla_eval(e[1], int)
   if is_true(eval_cond):
      return srfla_eval(e[2], int)
   return srfla_eval(e[3], int)

def eval_symbol(e, int):
   if e[1] not in int:
      raise Exception("Undefined variable: " + e[1] + "\nInterpretation: " + str(int))
   return int[e[1]]

def eval_subtract(e):
   if len(e) == 2:
      return ['Number', -e[1][1]]
   return ['Number', e[1][1] - e[2][1]]

def eval_var(e, int):
   val = srfla_eval(e[2], int)
   int[e[1]] = val

def eval_division(e1, e2):
   if e2 == 0:
      raise Exception("Divided by zero")
   return ['Number', e1[1] / float(e2[1])]

def eval_expt(e1, e2):
   if e2[1] < 0:
      raise Exception("Exponent should be an integer")
   if e2[1] >= LIMIT_EXPT:
      raise Exception("Exponent too large: " + str(e2[1]))
   if e1[1] >= LIMIT_ARITH:
      raise Exception("Base too large: " + str(e1[1]))
   if e1[1]**e2[1] >= LIMIT_ARITH:
      raise Exception("Exponentiation result too large.")
   return ['Number', e1[1]**e2[1]]

def eval_multiply(e1, e2):
   if e1[1] > LIMIT_ARITH or e2[1] < -LIMIT_ARITH:
      raise Exception("The absolute value of arg1 is too large for multiplication: " + str(e1[1]))
   if e2[1] > LIMIT_ARITH or e2[1] < -LIMIT_ARITH:
      raise Exception("The absolute value of arg2 is too large for multiplication: " + str(e2[1]))
   return ['Number', e1[1] * e2[1]]

def eval_sum(e1, e2):
   if e1[1] > LIMIT_ARITH or e2[1] < -LIMIT_ARITH:
      raise Exception("The absolute value of arg1 is too large for summation: " + str(e1[1]))
   if e2[1] > LIMIT_ARITH or e2[1] < -LIMIT_ARITH:
      raise Exception("The absolute value of arg2 is too large for summation: " + str(e2[1]))
   return ['Number', e1[1] + e2[1]]

def eval_wedge(e, int):
   e1 = srfla_eval(e[1], int)
   if not is_true(e1):
      return e1
   e2 = srfla_eval(e[2], int)
   return e2

def eval_vee(e, int):
   e1 = srfla_eval(e[1], int)
   if is_true(e1):
      return e1
   e2 = srfla_eval(e[2], int)
   return e2

def eval_implies(e, int):
   e2 = srfla_eval(e[2], int)
   if is_true(e2):
      return e2
   e1 = srfla_eval(e[1], int)
   return bool_to_srfla(not is_true(e1))

def srfla_eval(e, int):
   """recursive evaluator

   FIXME: split into special eval function with default of switch going to bottom-up eval.
   FIXME: If op were attribute of array object, accessing children would be easier.
   Later: ITE?
     *** Need array objects for true and false?
   e is an expr, int is an object representing an interpretation
   Note: not TESTED.
   """
   check_is_term(e)
   # if !int: raise Exception("int is undefined") when it's not undefined. ??
   op = e[0]
   ee = e
   # FIXME: evaluation strategy. This should be handled more generally.
   # perhaps a separate table for how to evaluate each operator?
   # Also, non-strict evaluation of if, and, or, etc. here.
   # first, evaluate children.
   if not isinstance(op, basestring):
      raise Exception("Operator must be a string: " + str(op))
   # original source code talks about the evaluation strategy
   skip_operator = ['\\forall', '\\exists', 'comprehension', 'var', 'call',
                    'recordfields', 'Record', 'getfield', '\\lambda',
                    '\\wedge', '\\vee', '\\implies']
   # but doesn't do anything special. So I deleted it.
   if not is_leaf(op) and op not in skip_operator:
      ee = [op] + [srfla_eval(elem, int) for elem in e[1:]]
   # functions corresponding to op are shown below.

   # return e
   selfReturnOp = ['\\T', '\\F', 'Number', 'String', 'Record',
                   'Tuple', '\\relation', '\\lambda']
   if op in selfReturnOp:
      return ee

   # pass in e and int, mostly for comprehension and interpretation function
   eIntOp = ['Symbol', 'getfield', '\\forall', '\\exists', 'var', 'recordfields', 'ite', 'call', 'comprehension',
             '\\wedge', '\\vee', '\\implies']
   if op in eIntOp:
      return {
         'Symbol': eval_symbol,
         'getfield': get_field,
         '\\forall': eval_for_all,
         '\\exists': eval_exists,
         'var': eval_var,
         'recordfields': eval_record,
         'ite': eval_ite,
         'call': eval_call,
         'comprehension': srfla_eval_comprehension,

         '\\wedge': eval_wedge, # and
         '\\vee': eval_vee, # or
         '\\implies': eval_implies, # ->
      }[op](ee, int)

   # pass in e[1] and e[2], mostly for relation and comparison function
   e1e2Op = ['=', '\\ldots',
             '\\subseteq', '\\subset', '\\supseteq', '\\supset', '\\in',
             '\\cup', '\\cap', '\\backslash', '\\times',
             '+', '\\cdot', '/', '^',
             '<', '>', '\\le', '\\ge',
             '\\bicond', '\\xor']
   if op in e1e2Op:
      return {
         # equality
         '=': lambda e1, e2: bool_to_srfla(compare(e1, e2) == 0),

         '\\ldots': eval_range,

         # Set relations
         '\\subseteq': lambda e1, e2: is_subset(e1, e2, False),
         '\\subset': lambda e1, e2: is_subset(e1, e2, True),
         '\\supseteq': lambda e1, e2: is_subset(e2, e1, False),
         '\\supset': lambda e1, e2: is_subset(e2, e1, True),
         '\\in': is_member,

         # Set operations
         '\\cup': lambda e1, e2: set_op(e1, e2, True, True, True), # union
         '\\cap': lambda e1, e2: set_op(e1, e2, False, False, True), # intersection
         '\\backslash': lambda e1, e2: set_op(e1, e2, True, False, False), # setdiff
         '\\times': product,

         # Arithmetic operations
         '+': eval_sum,
         '\\cdot': eval_multiply,
         '/': eval_division,
         '^': eval_expt,

         # comparison
         '<': lambda e1, e2: bool_to_srfla(compare(e1, e2) < 0),
         '>': lambda e1, e2: bool_to_srfla(compare(e1, e2) > 0),
         '\\le': lambda e1, e2: bool_to_srfla(compare(e1, e2) <= 0),
         '\\ge': lambda e1, e2: bool_to_srfla(compare(e1, e2) >= 0),

         # logical connectives
         '\\bicond': lambda e1, e2: bool_to_srfla(is_true(e1) == is_true(e2)), # <==>
         '\\xor': lambda e1, e2: bool_to_srfla(is_true(e1) != is_true(e2)) # xor
      }[op](ee[1], ee[2])

   # pass in e
   eOp = ['Set', '\\powset', '-', '\\neg', '\\cardinality']
   if op in eOp:
      return {
         'Set': normalize_set,
         '\\powset': lambda e: normalize_set(power_set(e[1])),
         '-': eval_subtract,
         '\\neg': lambda e: bool_to_srfla(not is_true(e[1])),
         '\\cardinality': lambda e: ['Number', len(e[1]) - 1]
      }[op](ee)
   raise Exception("Operator not defined: " + op)
