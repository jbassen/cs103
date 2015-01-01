import os
import sys
import re
import doctest
import json

def srfla_init(path):
   global srflaEval
   import srflaEval
   global srflaParser
   import srflaParser
   global outputParser
   import outputParser
   srflaParser.srflaParser_init(path)

def srfla(s, dict, verbose):
   #print s
   #print dict

   package = srflaParser.srfla_parse(s)
   if verbose or package[0] <= 0:
      print package[1]
   if (package[0] > 0) and (package[1] is not None):
      try:
         output = srflaEval.srfla_eval(package[1], dict)
      except Exception as e_e:
         print str(e_e)
         return
      if output is not None:
         output_interpret = outputParser.output_parse(str(output))
         if output_interpret is not None:
            print output_interpret

if __name__ == '__main__':
   path = os.path.dirname(__file__)
   srfla_init(path)
   dict = {}
   functiondef = "function Red(x): x.color =  \"red\";"
   srfla(functiondef, dict, False)
   functiondef2 = "function Blue(x): x.color = \"blue\";"
   srfla(functiondef2, dict, False)
   functiondef3 = "function Yellow(x): x.color = \"yellow\";"
   srfla(functiondef3, dict, False)
   functiondef4 = "function Square(x): x.shape = \"square\";"
   srfla(functiondef4, dict, False)
   functiondef5 = "function Triangle(x): x.shape = \"triangle\";"
   srfla(functiondef5, dict, False)
   functiondef6 = "function Circle(x): x.shape = \"circle\";"
   srfla(functiondef6, dict, False)
   functiondef7 = "function RightOf(x, y): x.x > y.x;"
   srfla(functiondef7, dict, False)
   functiondef8 = "function LeftOf(x, y): x.x < y.x;"
   srfla(functiondef8, dict, False)
   functiondef9 = "function Above(x, y): x.y < y.y;"
   srfla(functiondef9, dict, False)
   functiondef11 = "function Below(x, y): x.y > y.y;"
   srfla(functiondef11, dict, False)
   functiondef12 = "function SameCol(x, y): x.x = y.x;"
   srfla(functiondef12, dict, False)
   functiondef13 = "function SameRow(x, y): x.y = y.y;"
   srfla(functiondef13, dict, False)
   try:
     result = sys.argv[1]
   except EOFError:
     pass
   answer = json.loads(result)
   s = answer['world']
   srfla(s, dict, False)
   command = answer['logic']
   if 'nameA' in answer:
        nameA = answer['nameA']
        srfla(nameA, dict, False)
   if 'nameB' in answer:
        nameB = answer['nameB']
        srfla(nameB, dict, False)
   if 'nameC' in answer:
        nameC = answer['nameC']
        srfla(nameC, dict, False)
   srfla(command, dict, False)
