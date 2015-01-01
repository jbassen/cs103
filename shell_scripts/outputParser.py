# This outputParser takes in a set, string, srfla_bool, number or tuple
# in json format returns NORMAL (not mathjax) interpretation.

def output_parse(s):
   return output_parser(s, 0, len(s) - 1)

def output_parser(s, start, end):
   result = ""
   if s[start] != '[' or s[end] != ']':
      raise Exception("Illegal format. '[' or ']' might be missing")
   start += 1
   end -= 1
   parenthesis = False
   close_bracket = ""
   ignore_comma = True

   # find type:

   if s[start] not in {'"', '\''}:
      raise Exception("Illegal format")
   mid = start + 1
   type = ""
   while not s[mid] == s[start] and mid <= end:
      type += s[mid]
      mid += 1
   if mid > end:
      raise Exception("Illegal format")
   if type not in {'Number', 'Set', '\\\\T', '\\\\F', 'Record', 'Tuple', 'String'}:
      return s[(start - 1) : (end + 2)]
   if type in {'\\\\T', '\\\\F'}:
      return type[2]
   if type == 'Set':
      result += '{'
      close_bracket = '}'
   if type == 'Tuple':
      result += '('
      close_bracket = ')'
   start = mid + 1

   # parse the rest of the string

   while start <= end:
      if s[start] == ':':
         result += s[start]
         if not parenthesis:
            result += ' '
         start += 1
         continue
      if s[start] in {'"', '\''}:
         parenthesis = not parenthesis
         result += s[start]
         start += 1
         continue
      if s[start] in {' ', '\t', '\n'}:
         if parenthesis:
            result += s[start]
         start += 1
         continue
      if s[start] == ',':
         if parenthesis:
            result += s[start]
         else:
            if ignore_comma:
               ignore_comma = False
            else:
               result += s[start] + ' '
         start += 1
         continue
      if s[start] == '[':
         lvl = 1
         mid = start + 1
         while lvl > 0 and mid <= end:
            if not parenthesis:
               if s[mid] in {'"', '\''}:
                  parenthesis = True
                  escape_char = s[mid]
               elif s[mid] == '[':
                  lvl += 1
               elif s[mid] == ']':
                  lvl -= 1
            else:
               if s[mid] == escape_char:
                  parenthesis = False
            mid += 1
         if lvl > 0:
            raise Exception("Illegal format. '[' or ']' might be missing")
         result += output_parser(s, start, mid - 1)
         start = mid
         continue
      result += s[start]
      start += 1
   result += close_bracket
   return result

if __name__ == '__main__':
   while True:
      try:
         s = raw_input('outputParser > ')
      except EOFError:
         break
      try:
         print output_parse(s)
      except Exception as e:
         print str(e)
