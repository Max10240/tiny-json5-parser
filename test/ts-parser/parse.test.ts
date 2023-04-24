import { Lexer, Parser } from "@/parse-ts";

function parse(input: string) {
  return new Parser(new Lexer(input).parse()).parse();
}

const testDataList = [
  { a: ["lisinopril", true, false, null, "是的"] },
];

describe('test ts parser', () => {
  it('parse string', () => {
    expect(() => parse(`"123"-5`)).toThrowError(`Unexpected '-5'`);
    expect(() => parse(`"123""1"`)).toThrowError(`Unexpected '1'`);
    expect(() => parse(`"123"'1'`)).toThrowError(`Unexpected '1'`);
    expect(() => parse(``)).toThrowError(`Unexpected '${Parser.EOF.value}'`);
  });

  it('parse nested object', () => {
    expect(parse(JSON.stringify(testDataList[0]))).toStrictEqual(testDataList[0]);
  });
});
