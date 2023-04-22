import { Lexer, Parser } from '@/parse-ts';

const jsonString = `"1\\n\\t\\"\\//\\\\299812\\r\\b\\f------\\u276455"`;

const lexer = new Lexer(jsonString);
const tokens = lexer.parse();

const parser = new Parser(tokens);
console.log(parser.parse());
