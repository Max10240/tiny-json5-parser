import { Lexer } from "@/parse-ts";

function parse(input: string) {
  return new Lexer(input).parse();
}

describe('test ts lexer', () => {
  it('parse number', () => {
    expect(+parse('-1.5e+5')[0].value).toBe(-1.5e+5);
    expect(+parse('1.5e-5')[0].value).toBe(1.5e-5);
    expect(+parse('-1.5e-5')[0].value).toBe(-1.5e-5);
    expect(() => parse('1.e+5.')).toThrowError(`unexpected token 'e'`);
    expect(() => parse('.e+5')).toThrowError(`unexpected token '.'`);
    expect(() => parse('1.5e+5.')).toThrowError(`unexpected token '.' at position 6`);
    expect(() => parse('1.5e+5.1')).toThrowError(`unexpected token '.' at position 6`);
    expect(() => parse('+1.5e+5.1')).toThrowError(`unexpected token '+'`);
    expect(() => parse('-1.5e+')).toThrowError(`unexpected token ''`);
  });

  it('parse string', () => {
    expect(parse(`"123\\n\\r\\f\\b\\/\\\\\\t---\\u2764\\u597d❤\\uD83C\\uDFBC"`)[0].value).toBe(`123\n\r\f\b/\\\t---❤好❤🎼`);
  });
});
