import { ID_START, ID_CONTINUE } from '../lib/unicode';

export type TTokenType =
  'L_BRACE'
  | 'R_BRACE'
  | 'L_S_BRACE'
  | 'R_S_BRACE'
  | 'COMMA'
  | 'COLON'
  | 'TRUE'
  | 'FALSE'
  | 'NULL'
  | 'NUMBER'
  | 'STRING'
  | 'IDENTIFIER'
  | 'COMMENT'
  | 'EOF';

export interface IToken {
  type: TTokenType;
  value: string;
  position: number;
}

export class LexerParseError extends Error {
  toString() {
    return `LexerParseError: ${this.message}`;
  }
}

export class Lexer {
  static readonly EOF = '';

  protected tokenList: IToken[] = [];
  protected currentIndex = 0;

  constructor(readonly input: string) {
  }

  parse(): IToken[] {
    let match = true;

    while (!this.isAtEnd() && match) {
      match = false;

      const peek = this.peek(), currentPosition = this.currentIndex;

      if (this.isNumber(peek) || '+-.'.includes(this.peek())) {
        match = true;
        this.tokenList.push({
          type: 'NUMBER',
          value: this.matchNumber(),
          position: currentPosition,
        });

        continue;
      }

      if (this.isIdentifierNameStart(peek)) {
        match = true;

        const matchResult = this.matchIdentifier();

        if (([
            ['true', 'TRUE'],
            ['false', 'FALSE'],
            ['null', 'NULL'],
            ['Infinity', 'NUMBER'],
            ['NaN', 'NUMBER'],
          ] satisfies [string, TTokenType][]
        ).some(
          ([value, type]) => value === matchResult && this.tokenList.push({
            type,
            value,
            position: currentPosition,
          }))
        ) {
          continue;
        }

        this.tokenList.push({
          type: 'IDENTIFIER',
          value: matchResult,
          position: currentPosition,
        });
        continue;
      }

      switch (peek) {
        case '{':
          match = true;
          this.tokenList.push({
            type: 'L_BRACE',
            value: this.advance(),
            position: currentPosition,
          });
          break;
        case '}':
          match = true;
          this.tokenList.push({
            type: 'R_BRACE',
            value: this.advance(),
            position: currentPosition,
          });
          break;
        case '[':
          match = true;
          this.tokenList.push({
            type: 'L_S_BRACE',
            value: this.advance(),
            position: currentPosition,
          });
          break;
        case ']':
          match = true;
          this.tokenList.push({
            type: 'R_S_BRACE',
            value: this.advance(),
            position: currentPosition,
          });
          break;
        case ',':
          match = true;
          this.tokenList.push({
            type: 'COMMA',
            value: this.advance(),
            position: currentPosition,
          });
          break;
        case ':':
          match = true;
          this.tokenList.push({
            type: 'COLON',
            value: this.advance(),
            position: currentPosition,
          });
          break;
        case '"':
        case "'":
          match = true;

          const value = this.matchString();
          this.tokenList.push({
            type: 'STRING',
            value: value.slice(1, -1),
            position: currentPosition,
          });
          break;
        case '/':
          match = true;

          let comment = '';

          if (this.lookForward(1) === '/') {
            this.advance();
            this.advance();

            while (!(this.isAtEnd() || '\n\r'.includes(this.peek()))) comment += this.advance();

            break;
          }

          if (this.lookForward(1) === '*') {
            this.advance();
            this.advance();

            while (!this.isAtEnd()) {
              if (this.peek() === '*' && this.lookForward(1) === '/') {
                this.advance();
                this.advance();

                break;
              }

              comment += this.advance();
            }

            break;
          }

          throw this.createParseError();
        case '\u0009':
        case '\u000A':
        case '\u000B':
        case '\u000C':
        case '\u000D':
        case '\u0020':
        case '\u00A0':
        case '\u2028':
        case '\u2029':
        case '\uFEFF':
        case '\u1680':
        case '\u2000':
        case '\u2001':
        case '\u2002':
        case '\u2003':
        case '\u2004':
        case '\u2005':
        case '\u2006':
        case '\u2007':
        case '\u2008':
        case '\u2009':
        case '\u200A':
        case '\u202F':
        case '\u205F':
        case '\u3000':
          match = true;
          this.advance();
          break;
      }
    }

    if (this.isAtEnd()) return this.tokenList;

    throw this.createParseError();
  }

  protected matchString(): string {
    let stringBuffer = '', closed = false;

    if (!['"', "'"].includes(this.peek())) throw this.createParseError();

    const quote = this.peek();

    stringBuffer += this.advance();

    while (!this.isAtEnd()) {
      const peek = this.peek();

      stringBuffer += peek;

      if (['\n', '\r'].includes(peek)) throw this.createParseError();

      this.advance();

      if (peek === quote) {
        closed = true;
        break;
      }

      if (peek === '\\') {
        stringBuffer = stringBuffer.slice(0, -1)

        const nearBackslash = this.peek();

        if ([
          ['"', '"'],
          ["'", "'"],
          ['\\', '\\'],
          ['/', '/'],
          ['"', '"'],
          ['b', '\b'],
          ['f', '\f'],
          ['n', '\n'],
          ['r', '\r'],
          ['t', '\t'],
          ['v', '\v'],
          ['0', '\0'],
          ['\n', ''],
        ].some(
          ([k, v]) => nearBackslash === k && (stringBuffer += v))
        ) {
          this.advance();
          continue;
        }

        if (nearBackslash === 'u') {
          this.advance();

          let hexCode = '', flag = true;

          for (let i = 0; i < 4; i++) {
            if (!(flag = this.isHex(this.peek()))) {
              throw this.createParseError();
            }

            hexCode += this.advance();
          }

          stringBuffer += String.fromCharCode(parseInt(hexCode, 16));

          continue;
        }

        throw this.createParseError();
      }
    }

    if (!closed) throw this.createParseError();

    return stringBuffer;
  }

  protected matchIdentifier() {
    if (!this.isIdentifierNameStart(this.peek())) throw this.createParseError();

    let stringBuffer = '';
    while (!this.isAtEnd() && this.isIdentifierNamePart(this.peek())) stringBuffer += this.advance();

    return stringBuffer;
  }

  protected matchNumber() {
    let valueBuffer = '';

    if ('+-'.includes(this.peek())) valueBuffer += this.advance();

    if (this.peek() === '0' && this.lookForward(1) === 'x') {
      valueBuffer += this.advance();
      valueBuffer += this.advance();

      let hexSequence = '';

      while (this.isHex(this.peek())) hexSequence += this.advance();

      if (!hexSequence) throw this.createParseError();

      return valueBuffer + hexSequence;
    }

    if (this.peek() === 'I') {
      const identifier = this.matchIdentifier();

      if (identifier === 'Infinity') return valueBuffer + identifier;

      throw this.createParseError();
    }

    if (this.peek() === 'N') {
      const identifier = this.matchIdentifier();

      if (identifier === 'NaN') return valueBuffer + identifier;

      throw this.createParseError();
    }

    while (!this.isAtEnd()) {
      if (this.peek() === '-' || this.peek() === '+') {
        if (!valueBuffer || valueBuffer.slice(-1) === 'e') {
          valueBuffer += this.advance();

          if (this.peek() === '.' && !valueBuffer.includes('.')) continue;

          valueBuffer += this.matchPureNumber();
          continue;
        }

        throw this.createParseError();
      }

      if (this.peek() === '.') {
        if (!valueBuffer.includes('e') && !valueBuffer.includes('.')) {
          valueBuffer += this.advance();

          if (this.isNumber(valueBuffer.slice(-2, -1)) && !this.isNumber(this.lookForward(1))) continue;

          valueBuffer += this.matchPureNumber();

          continue;
        }

        throw this.createParseError();
      }

      if (this.peek() === 'e') {
        if (!valueBuffer.includes('e') && (valueBuffer.slice(-1) === '.' || this.isNumber(valueBuffer.slice(-1)))) {
          valueBuffer += this.advance();

          if ('+-'.includes(this.peek())) valueBuffer += this.advance();
          valueBuffer += this.matchPureNumber();

          continue;
        }

        throw this.createParseError();
      }

      if (!this.isNumber(this.peek())) break;

      valueBuffer += this.advance();
    }

    return valueBuffer;
  }

  protected matchPureNumber() {
    let valueBuffer = '';

    while (!this.isAtEnd() && this.isNumber(this.peek())) valueBuffer += this.advance();

    if (!valueBuffer) throw this.createParseError();

    return valueBuffer;
  }

  protected isNumber(char: string) {
    return char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57;
  }

  protected isIdentifierNameStart(char: string) {
    return '_$'.includes(char) || (char.toUpperCase() >= 'A' && char.toUpperCase() <= 'Z') || ID_START.test(char);
  }

  protected isIdentifierNamePart(char: string) {
    return this.isIdentifierNameStart(char) || this.isNumber(char) || '\u200D\u200D'.includes(char) || ID_CONTINUE.test(char);
  }

  protected isHex(char: string) {
    return this.isNumber(char) || (char.toUpperCase() >= 'A' && char.toUpperCase() <= 'F');
  }

  protected createParseError() {
    return new LexerParseError(`unexpected token '${this.peek()}' at position ${this.currentIndex}`);
  }

  protected peek() {
    return !this.isAtEnd() ? this.input[this.currentIndex] : Lexer.EOF;
  }

  protected lookForward(steps: number) {
    if (this.currentIndex + steps >= this.input.length) return Lexer.EOF;

    return this.input[this.currentIndex + steps];
  }

  protected advance() {
    return !this.isAtEnd() ? this.input[this.currentIndex++] : Lexer.EOF;
  }

  protected isAtEnd() {
    return this.currentIndex >= this.input.length;
  }
}
