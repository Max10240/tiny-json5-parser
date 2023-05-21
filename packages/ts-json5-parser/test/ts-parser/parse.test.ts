import { describe, it, expect } from 'vitest';
import { Lexer, Parser } from "@/index";
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse as json5Parse } from 'json5';
import { getDirName } from '../utils';

function parse(input: string) {
  return new Parser(new Lexer(input).parse()).parse();
}

describe('test ts parser', () => {
  it('parse number', () => {
    expect(() => parse(`-Infinity.6`)).toThrowError(`Unexpected '.6'`);
    expect(() => parse(`-0x12adf.6`)).toThrowError(`Unexpected '.6'`);
  });

  it('parse string', () => {
    expect(() => parse(`"123"-5`)).toThrowError(`Unexpected '-5'`);
    expect(() => parse(`"123""1"`)).toThrowError(`Unexpected '1'`);
    expect(() => parse(`"123"'1'`)).toThrowError(`Unexpected '1'`);
    expect(() => parse(``)).toThrowError(`Unexpected '${Parser.EOF.value}'`);
  });

  it('parse object', () => {
    expect(parse(`{}`), 'empty object').toStrictEqual({});
    expect(parse(`{a: 1}`), 'without trailing comma').toStrictEqual({ a: 1 });
    expect(parse(`{true1: 1}`), 'keyword like key').toStrictEqual({ true1: 1 });
    expect(parse(`{Infinity: 1, NaN: 2}`), 'special key').toStrictEqual({ Infinity: 1, NaN: 2 });
    expect(parse(`{好: 1, NaN: 2}`), 'special key').toStrictEqual({ '好': 1, NaN: 2 });
    expect(parse(`{a: 1, 'b- cde❤好❤🎼': 2, "❤好❤🎼": 3,}`), 'single quote & double quote & trailing comma').toStrictEqual({
      a: 1,
      'b- cde❤好❤🎼': 2,
      "❤好❤🎼": 3,
    });
    expect(() => parse(`{,}`)).toThrowError('Expect `R_BRACE`, got `COMMA`');
    expect(() => parse(`{a: 1, 'b- cde❤好❤🎼': 2, "❤好❤🎼": 3,,}`)).toThrowError('Expect `R_BRACE`, got `COMMA`');
    expect(() => parse(`{a: 1},`)).toThrowError(`Unexpected ','`);
    expect(() => parse(`{null: 1},`)).toThrowError('Expect `R_BRACE`, got `NULL`');
    expect(() => parse(`{true: 1},`)).toThrowError('Expect `R_BRACE`, got `TRUE`');
    expect(() => parse(`{false: 1},`)).toThrowError('Expect `R_BRACE`, got `FALSE`');
    expect(() => parse(`{2: 1},`)).toThrowError('Expect `R_BRACE`, got `NUMBER`');
  });

  it('parse array', () => {
    expect(parse(`[]`)).toStrictEqual([]);
    expect(parse(`[1, true, Infinity, -Infinity, {}]`), 'without trailing comma').toStrictEqual([1, true, Infinity, -Infinity, {}]);
    expect(parse(`[1, true, Infinity, -Infinity, {},]`), 'trailing comma').toStrictEqual([1, true, Infinity, -Infinity, {}]);
    expect(() => parse(`[,]`)).toThrowError(`Unexpected ','`);
    expect(() => parse(`[],`)).toThrowError(`Unexpected ','`);
  });

  it('parse complex data', async () => {
    const testDataList = [
      { a: ["lisinopril", true, false, null, "是的"] },
    ];
    expect(parse(JSON.stringify(testDataList[0]))).toStrictEqual(testDataList[0]);

    const json5OrgTestData = `{
  // comments
  unquoted: 'and you can quote me on that',
  singleQuotes: 'I can use "double quotes" here',
  lineBreaks: "Look, Mom! \\
No \\\\n's!",
  hexadecimal: 0xdecaf,
  leadingDecimalPoint: .8675309, andTrailing: 8675309.,
  positiveSign: +1,
  trailingComma: 'in objects', andIn: ['arrays',],
  "backwardsCompatible": "with JSON",
}`;
    expect(parse(json5OrgTestData)).toStrictEqual({
      unquoted: 'and you can quote me on that',
      singleQuotes: 'I can use "double quotes" here',
      lineBreaks: "Look, Mom! No \\n's!",
      hexadecimal: 0xdecaf,
      leadingDecimalPoint: .8675309, andTrailing: 8675309.,
      positiveSign: +1,
      trailingComma: 'in objects', andIn: ['arrays',],
      "backwardsCompatible": "with JSON",
    });

    const chromiumConfigPath = path.join(getDirName(import.meta.url), 'chromium-runtime-enabled-features.json5');
    const configContent = (await readFile(chromiumConfigPath)).toString();
    expect(parse(configContent)).toStrictEqual(json5Parse(configContent));
  });
});
