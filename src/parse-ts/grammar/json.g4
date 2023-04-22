grammar json;

json            : object | array | STRING | NUMBER | LITERAL;
object          : '{' ((kvPair ',')* kvPair)* '}';
array           : '[' ((json ',')* json)* ']';
kvPair          : STRING ':' json;
STRING          : '"' ('\\"' | ~["\n])* '"';
NUMBER          : [0-9]+;
LITERAL         : 'true' | 'false' | 'null';
WS              : [ \n\r\t]+ -> skip;