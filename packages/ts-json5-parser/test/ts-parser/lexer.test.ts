import { Lexer, type IToken } from "@/index";

function parse(input: string) {
  return new Lexer(input).parse();
}

describe('test ts lexer', () => {
  it('parse number', () => {
    expect(+parse('-1.5e+5')[0].value).toBe(-1.5e+5);
    expect(+parse('1.5e-5')[0].value).toBe(1.5e-5);
    expect(+parse('-1.5e-5')[0].value).toBe(-1.5e-5);
    expect(+parse('-.5e-5')[0].value).toBe(-.5e-5);
    expect(+parse('.5e-5')[0].value).toBe(.5e-5);
    expect(+parse('.5')[0].value).toBe(.5);
    expect(+parse('+.5')[0].value).toBe(.5);
    expect(+parse('+.5e+5')[0].value).toBe(+.5e+5);
    expect(+parse('-2')[0].value).toBe(-2);
    expect(+parse('5.')[0].value).toBe(5);
    expect(parse('0x0123456789abcdefABCDEF')[0]).toMatchObject({
      type: 'NUMBER',
      value: '0x0123456789abcdefABCDEF',
    } satisfies Partial<IToken>);
    expect(parse('-0x0123456789abcdefABCDEF')[0]).toMatchObject({
      type: 'NUMBER',
      value: '-0x0123456789abcdefABCDEF',
    } satisfies Partial<IToken>);
    expect(parse('Infinity')[0]).toMatchObject({
      type: 'NUMBER',
      value: 'Infinity',
    } satisfies Partial<IToken>);
    expect(parse('+Infinity')[0]).toMatchObject({
      type: 'NUMBER',
      value: '+Infinity',
    } satisfies Partial<IToken>);
    expect(parse('-Infinity')[0]).toMatchObject({
      type: 'NUMBER',
      value: '-Infinity',
    } satisfies Partial<IToken>);
    expect(parse('NaN')[0]).toMatchObject({
      type: 'NUMBER',
      value: 'NaN',
    } satisfies Partial<IToken>);
    expect(parse('+NaN')[0]).toMatchObject({
      type: 'NUMBER',
      value: '+NaN',
    } satisfies Partial<IToken>);
    expect(parse('-NaN')[0]).toMatchObject({
      type: 'NUMBER',
      value: '-NaN',
    } satisfies Partial<IToken>);
    expect(() => parse('1.e+5.')).toThrowError(`unexpected token '.'`);
    expect(() => parse('1.e+5-2')).toThrowError(`unexpected token '-'`);
    expect(() => parse('.e+5')).toThrowError(`unexpected token 'e'`);
    expect(() => parse('1.5e+5.')).toThrowError(`unexpected token '.' at position 6`);
    expect(() => parse('1.5e+5.1')).toThrowError(`unexpected token '.' at position 6`);
    expect(() => parse('+1.5e+5.1')).toThrowError(`unexpected token '.'`);
    expect(() => parse('-1.5e+')).toThrowError(`unexpected token ''`);
    expect(() => parse('-.5e')).toThrowError(`unexpected token ''`);
    expect(() => parse('.')).toThrowError(`unexpected token ''`);
    expect(() => parse('0x')).toThrowError(`unexpected token ''`);
    expect(() => parse('0xg')).toThrowError(`unexpected token 'g'`);
    expect(() => parse('0x')).toThrowError(`unexpected token ''`);
  });

  it('parse string', () => {
    expect(parse(`"123\\n\\r\\f\\b\\/\\\\\\t---\\u2764\\u597d❤\\uD83C\\uDFBC"`)[0].value).toBe(`123\n\r\f\b/\\\t---❤好❤🎼`);
    expect(parse(`"123\\
456"`)[0].value, 'line break').toBe(`123456`);
    expect(parse(`'single quote string\\'ok'`)[0].value, 'single quote').toBe(`single quote string'ok`);
    expect(() => parse(`'unclosed single quote string`), 'unclosed single quote').toThrowError(`unexpected token ''`);
    expect(() => parse(`"unclosed double quote string :`), 'unclosed double quote').toThrowError(`unexpected token ''`);
  });

  it('parse identifier', () => {
    expect(parse(`identifierName`)[0]).toMatchObject({
      type: 'IDENTIFIER',
      value: 'identifierName'
    } satisfies Partial<IToken>);
    expect(parse(`$_abc`)[0].value).toBe(`$_abc`);
    expect(parse(`_$abc`)[0].value).toBe(`_$abc`);
    expect(parse(`好_$abc\u200D\u200D`)[0].value).toBe(`好_$abc\u200D\u200D`);

    const num_identifier = parse(`0_$`);
    expect(num_identifier[0]).toMatchObject({
      type: 'NUMBER',
      value: '0',
    } satisfies Partial<IToken>);
    expect(num_identifier[1]).toMatchObject({
      type: 'IDENTIFIER',
      value: '_$',
    } satisfies Partial<IToken>);

    expect(() => parse(`\u200D\u200D`)).toThrowError(`unexpected token`);
  });

  it('parse comment', () => {
    const commentTest0 = parse(`//❤好❤🎼abcde ❤好❤🎼\n123`);
    expect(commentTest0.length).toBe(1);
    expect(commentTest0[0]).toMatchObject({
      type: 'NUMBER',
      value: '123',
    } satisfies Partial<IToken>);

    const commentTest1 = parse(`/*❤好❤🎼abcde ❤好❤🎼\n123\n456***\\ \n*/123`);
    expect(commentTest1.length).toBe(1);
    expect(commentTest1[0]).toMatchObject({
      type: 'NUMBER',
      value: '123',
    } satisfies Partial<IToken>);
  });
});
