import { Lexer } from './lexer';
import { Parser } from './parser';

export {
  type TTokenType,
  type IToken,
  LexerParseError,
  Lexer,
} from './lexer';
export {
  ParseError,
  Parser,
} from './parser';

export function parse(input: string) {
  return new Parser(new Lexer(input).parse()).parse();
}
