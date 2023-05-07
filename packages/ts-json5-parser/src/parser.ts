import { IToken, TTokenType } from "./lexer";

type JSON =
  | null
  | string
  | number
  | boolean
  | JSON[]
  | {
  [prop: string]: JSON
};

type Position = {
  start: number;
  end: number;
};

export class ParseError extends Error {
  toString() {
    return `ParseError: ${this.message}`;
  }
}

export class Parser {
  static readonly EOF: DeepRequire<IToken> = {
    type: 'EOF',
    value: '<EOF>',
    position: -1,
  };

  protected currentIndex = 0;

  constructor(readonly tokens: IToken[]) {
  }

  parse(): JSON {
    const result = this.parseJson();

    if (this.isAtEnd()) return result;

    throw this.createParseError();
  }

  parseJson(): JSON {
    let result: JSON;

    if (this.check('L_BRACE')) result = this.parseObject();
    else if (this.check('L_S_BRACE')) result = this.parseArray();
    else if (this.check('STRING')) result = this.advance().value;
    else if (this.check('NUMBER')) result = this.parseNumber();
    else if (this.match('TRUE')) result = true;
    else if (this.match('FALSE')) result = false;
    else if (this.match('NULL')) result = null;
    else throw this.createParseError();

    return result;
  }

  protected parseObject(): Record<string, JSON> {
    this.consume('L_BRACE');

    const object: Record<string, JSON> = {};

    while (!this.isAtEnd() && (
      this.check('STRING', 'IDENTIFIER')
      || (this.check('NUMBER') && ['Infinity', 'NaN'].includes(this.peek().value))
    )) {
      const key = this.advance().value;
      this.consume('COLON');
      const value = this.parseJson();

      object[key] = value;

      if (!this.match('COMMA')) break;
    }

    this.consume('R_BRACE');

    return object;
  }

  protected parseArray(): JSON[] {
    this.consume('L_S_BRACE');

    const array: JSON[] = [];

    while (!(this.isAtEnd() || this.check('R_S_BRACE'))) {
      array.push(this.parseJson());

      if (!this.match('COMMA')) break;
    }

    this.consume('R_S_BRACE');

    return array;
  }

  protected parseNumber() {
    const token = this.consume('NUMBER');

    return token.value.startsWith('0x') ? parseInt(token.value.slice(2), 16) : +token.value;
  }

  protected createParseError() {
    return new ParseError(`Unexpected '${this.peek().value}' at position: ${this.peek().position}`);
  }

  protected match(...types: TTokenType[]) {
    return types.some(t => this.check(t) && this.advance());
  }

  protected check(...types: TTokenType[]) {
    if (this.isAtEnd()) return false;

    return types.includes(this.peek().type);
  }

  protected peek() {
    return this.isAtEnd() ? Parser.EOF : this.tokens[this.currentIndex];
  }

  protected advance() {
    if (!this.isAtEnd()) this.currentIndex++;

    return this.previous();
  }

  protected consume(type: TTokenType, msg?: string) {
    if (this.check(type)) return this.advance();

    const peek = this.peek();
    throw new ParseError(`Expect \`${type}\`, got \`${peek.type}\` at position: ${peek.position}`);
  }

  protected previous() {
    return this.tokens[this.currentIndex - 1];
  }

  protected isAtEnd() {
    return this.currentIndex >= this.tokens.length;
  }
}
