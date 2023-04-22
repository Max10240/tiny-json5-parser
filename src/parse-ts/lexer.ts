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
  | 'STRING';

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

      if (this.isNumber(peek) || this.peek() === '-') {
        match = true;
        this.tokenList.push({
          type: 'NUMBER',
          value: this.matchNumber(),
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
        case 't':
          if (this.matchSequence('true')) {
            match = true;
            this.tokenList.push({
              type: 'TRUE',
              value: 'true',
              position: currentPosition,
            });
          }
          break;
        case 'f':
          if (this.matchSequence('false')) {
            match = true;
            this.tokenList.push({
              type: 'FALSE',
              value: 'false',
              position: currentPosition,
            });
          }
          break;
        case 'n':
          if (this.matchSequence('null')) {
            match = true;
            this.tokenList.push({
              type: 'NULL',
              value: 'null',
              position: currentPosition,
            });
          }
          break;
        case '"':
          const { success, value } = this.matchString();

          if (match = success) {
            this.tokenList.push({
              type: 'STRING',
              value: value.slice(1, -1),
              position: currentPosition,
            });
          }
          break;
        case '\n':
        case '\r':
        case ' ':
        case '\t':
          match = true;
          this.advance();
          break;
      }
    }

    if (this.isAtEnd()) return this.tokenList;

    throw this.createParseError();
  }

  protected matchSequence(sequence: string) {
    return Array.from(sequence).every(c => this.advance() === c);
  }

  protected matchString() {
    let stringBuffer = '', success = false;

    if (this.peek() !== '"') return {
      success,
      value: stringBuffer,
    };

    stringBuffer += this.advance();

    while (!this.isAtEnd()) {
      const peek = this.peek();

      stringBuffer += peek;

      if (['\n', '\r'].includes(peek)) {
        success = false;
        break;
      }

      this.advance();

      if (peek === '"') {
        success = true;
        break;
      }

      if (peek === '\\') {
        stringBuffer = stringBuffer.slice(0, -1)

        const nearBackslash = this.peek();

        if ([
          ['"', '"'],
          ['\\', '\\'],
          ['/', '/'],
          ['"', '"'],
          ['b', '\b'],
          ['f', '\f'],
          ['n', '\n'],
          ['r', '\r'],
          ['t', '\t'],
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

        success = false;
        break;
      }
    }

    return {
      success,
      value: stringBuffer,
    }
  }

  protected matchNumber() {
    let valueBuffer = '', assertNumberBehind = false;

    while (!this.isAtEnd()) {
      if (assertNumberBehind) {
        assertNumberBehind = false;

        if (this.isNumber(this.peek())) {
          valueBuffer += this.advance();
          continue;
        }

        throw this.createParseError();
      }

      if (this.peek() === '-') {
        if (!valueBuffer || valueBuffer.slice(-1) === 'e') {
          valueBuffer += this.advance();

          assertNumberBehind = true;
          continue;
        }

        throw this.createParseError();
      }

      if (this.peek() === '+') {
        if (valueBuffer.slice(-1) === 'e') {
          valueBuffer += this.advance();

          assertNumberBehind = true;
          continue;
        }

        throw this.createParseError();
      }

      if (this.peek() === '.') {
        if (!valueBuffer.includes('e') && !valueBuffer.includes('.') && this.isNumber(valueBuffer.slice(-1))) {
          valueBuffer += this.advance();

          assertNumberBehind = true;
          continue;
        }

        throw this.createParseError();
      }

      if (this.peek() === 'e') {
        if (!valueBuffer.includes('e') && this.isNumber(valueBuffer.slice(-1))) {
          valueBuffer += this.advance();

          continue;
        }

        throw this.createParseError();
      }

      if (!this.isNumber(this.peek())) break;

      valueBuffer += this.advance();
    }

    if (!this.isNumber(valueBuffer.slice(-1))) throw this.createParseError();

    return valueBuffer;
  }

  protected isNumber(char: string) {
    return char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57;
  }

  protected isHex(char: string) {
    return this.isNumber(char) || (char.toUpperCase().charCodeAt(0) >= 65 && char.toUpperCase().charCodeAt(0) <= 70);
  }

  protected createParseError() {
    return new LexerParseError(`unexpected token '${this.peek()}' at position ${this.currentIndex}`);
  }

  protected peek() {
    return !this.isAtEnd() ? this.input[this.currentIndex] : Lexer.EOF;
  }

  protected advance() {
    return !this.isAtEnd() ? this.input[this.currentIndex++] : Lexer.EOF;
  }

  protected isAtEnd() {
    return this.currentIndex >= this.input.length;
  }
}
