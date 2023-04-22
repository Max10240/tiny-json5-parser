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

type StringToNumber<T extends string> = T extends `${infer N extends number}` ? N : never;

export class ParseError extends Error {
  toString() {
    return `ParseError: ${this.message}`;
  }
}

export class Parser {
  currentIndex = 0;

  constructor(readonly tokens: IToken[]) {
  }

  parse(): JSON {
    const result = this.parseJson();

    if (this.isAtEnd()) return result;

    throw new ParseError(`Unexpected ${this.peek().value} at position: ${this.peek().position}`);
  }

  parseJson(): JSON {
    let result: JSON;

    if (this.check('L_BRACE')) result = this.parseObject();
    else if (this.check('L_S_BRACE')) result = this.parseArray();
    else if (this.check('STRING')) result = this.advance().value;
    else if (this.check('NUMBER')) result = +this.advance().value;
    else if (this.match('TRUE')) result = true;
    else if (this.match('FALSE')) result = false;
    else if (this.match('NULL')) result = null;
    else throw new ParseError(`Unexpected ${this.peek().value} at position: ${this.peek().position}`);

    return result;
  }

  protected parseObject(): Record<string, JSON> {
    this.consume('L_BRACE');

    const object: Record<string, JSON> = {};

    while (!this.isAtEnd() && this.check('STRING')) {
      const key = this.consume('STRING').value;
      this.consume('COLON');
      const value = this.parseJson();

      object[key] = value;

      if (this.match('COMMA')) continue;
      break;
    }

    this.consume('R_BRACE');

    return object;
  }

  protected parseArray(): JSON[] {
    this.consume('L_S_BRACE');

    const array: JSON[] = [];

    while (!(this.isAtEnd() || this.check('R_S_BRACE'))) {
      array.push(this.parseJson());

      if (this.match('COMMA')) continue;
      break;
    }

    this.consume('R_S_BRACE');

    return array;
  }

  protected match(...types: TTokenType[]) {
    return types.some(t => this.check(t) && this.advance());
  }

  protected check(...types: TTokenType[]) {
    if (this.isAtEnd()) return false;

    return types.includes(this.peek().type);
  }

  protected peek() {
    return this.tokens[this.currentIndex];
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
