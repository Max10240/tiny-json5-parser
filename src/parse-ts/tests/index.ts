import { Lexer } from '..';

const lexer = new Lexer(`{"a":[0,1,{"y":null,"x":"t\\n\\""}]}`);
const tokens = lexer.parse();
console.log(tokens);
