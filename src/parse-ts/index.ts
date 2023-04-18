type TTokenType =
  'L_BRACE'
  | 'R_BRACE'
  | 'L_S_BRACE'
  | 'R_S_BRACE'
  | 'COMMA'
  | 'COLON'
  | 'true'
  | 'false'
  | 'null'
  | 'NUMBER'
  | 'STRING';

interface IToken {
  type: TTokenType;
  value: string;
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

      const peek = this.peek();

      switch (peek) {
        case '{':
          match = true;
          this.tokenList.push({
            type: 'L_BRACE',
            value: this.advance(),
          });
          break;
        case '}':
          match = true;
          this.tokenList.push({
            type: 'R_BRACE',
            value: this.advance(),
          });
          break;
        case '[':
          match = true;
          this.tokenList.push({
            type: 'L_S_BRACE',
            value: this.advance(),
          });
          break;
        case ']':
          match = true;
          this.tokenList.push({
            type: 'R_S_BRACE',
            value: this.advance(),
          });
          break;
        case ',':
          match = true;
          this.tokenList.push({
            type: 'COMMA',
            value: this.advance(),
          });
          break;
        case ':':
          match = true;
          this.tokenList.push({
            type: 'COLON',
            value: this.advance(),
          });
          break;
        case 't':
          match = true;
          if (this.matchSequence('true')) {
            match = true;
            this.tokenList.push({
              type: 'true',
              value: 'true',
            });
          }
          break;
        case 'f':
          match = true;
          if (this.matchSequence('false')) {
            match = true;
            this.tokenList.push({
              type: 'false',
              value: 'false',
            });
          }
          break;
        case 'n':
          match = true;
          if (this.matchSequence('null')) {
            match = true;
            this.tokenList.push({
              type: 'null',
              value: 'null',
            });
          }
          break;
        case '"':
          const {success, value} = this.matchString();

          if (match = success) {
            this.tokenList.push({
              type: 'STRING',
              value,
            });
          }
          break;
        case '\n':
        case '\r':
        case ' ':
        case '\t':
          break;
      }

      if (this.isNumber(peek)) {
        match = true;
        this.tokenList.push({
          type: 'NUMBER',
          value: this.matchNumber(),
        })
      }
    }

    if (this.isAtEnd()) return this.tokenList;

    throw new LexerParseError(`unexpected token '${this.peek()}' at position ${this.currentIndex}`);
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
        const nearBackslash = this.peek();

        if (['\n', '\r', Lexer.EOF].includes(nearBackslash)) {
          success = false;
          break;
        }

        stringBuffer += nearBackslash;

        this.advance();
      }
    }

    return {
      success,
      value: stringBuffer,
    }
  }

  protected matchNumber() {
    let valueBuffer = '';
    while (!this.isAtEnd()) {
      if (!this.isNumber(this.peek())) break;

      valueBuffer += this.advance();
    }

    return valueBuffer;
  }

  protected isNumber(char: string) {
    return char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57;
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


