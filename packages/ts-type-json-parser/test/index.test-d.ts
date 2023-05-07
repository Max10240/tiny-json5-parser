import type {
  Match,
  MatchSimpleToken,
  MatchPureNumber,
  MatchStringContent,
  MatchNumber,
  MatchString,
  StartsWith,
  MatchSequence,
  Lexer,
  MatchToken,
} from '@/index';
import { expectTypeOf } from "vitest";

describe('test ts type parser', () => {
  describe('test lexer', () => {
    it('test MatchNumber', () => {
      expectTypeOf<MatchNumber<'12.456e-43==='>>().toEqualTypeOf<[true, "12.456e-43", "==="]>();
      expectTypeOf<MatchNumber<'12.456e-XXX43==='>>().toEqualTypeOf<[false, "", "12.456e-XXX43===", "expect 'number' after 12.456e-"]>();
      expectTypeOf<MatchNumber<'12.456e43==='>>().toEqualTypeOf<[true, "12.456e43", "==="]>();
      expectTypeOf<MatchNumber<'12.456eXXX43==='>>().toEqualTypeOf<[false, "", "12.456eXXX43===", "expect number after 12.456e"]>();
      expectTypeOf<MatchNumber<'12.456===e43'>>().toEqualTypeOf<[true, "12.456", "===e43"]>();
      expectTypeOf<MatchNumber<'12.XXX456===e43'>>().toEqualTypeOf<[false, "", "12.XXX456===e43", "expect number after 12."]>();
      expectTypeOf<MatchNumber<'12===.456ke43--='>>().toEqualTypeOf<[true, "12", "===.456ke43--="]>();
      expectTypeOf<MatchNumber<'XXX12===.456ke43--='>>().toEqualTypeOf<[false, "", "XXX12===.456ke43--=", "expect number at start"]>();
    });

    it('test MatchString', () => {
      expectTypeOf<MatchString<'""=====extra...'>>().toEqualTypeOf<[true, "", "=====extra..."]>();
      expectTypeOf<MatchString<'"123\\n\\r\\t\\b\\f\\/\\\\\\""=====extra...'>>().toEqualTypeOf<[true, "123\n\r\t\b\f/\\\"", "=====extra..."]>();
      expectTypeOf<MatchString<'"...'>>().toEqualTypeOf<[false, "", "\"...", "unexpected EOF after ..."]>();
    });

    it('test MatchSimpleToken', () => {
      expectTypeOf<MatchSimpleToken<':'>>().toEqualTypeOf<[true, { type: "COLON"; value: ":"; }, ""]>();
      expectTypeOf<MatchSimpleToken<'null==='>>().toEqualTypeOf<[true, { type: "NULL"; value: "null"; }, "==="]>();
    });

    it('test Lexer', () => {
      type Str1 = '[1, 2.3454e99, false, null, true, "1\\n\\r\\t\\b\\f\\"", { "x\\"": {} } \n]';
      expectTypeOf<Lexer<Str1>>().toEqualTypeOf<[true, [
        { type: "L_S_BRACE"; value: "["; },
        { type: 'NUMBER'; value: "1"; },
        { type: "COMMA"; value: ","; },
        { type: 'NUMBER'; value: "2.3454e99"; },
        { type: "COMMA"; value: ","; },
        { type: "FALSE"; value: "false"; },
        { type: "COMMA"; value: ","; },
        { type: "NULL"; value: "null"; },
        { type: "COMMA"; value: ","; },
        { type: "TRUE"; value: "true"; },
        { type: "COMMA"; value: ","; },
        { type: 'STRING'; value: "1\n\r\t\b\f\""; },
        { type: "COMMA"; value: ","; },
        { type: "L_BRACE"; value: "{"; },
        { type: 'STRING'; value: "x\""; },
        { type: "COLON"; value: ":"; },
        { type: "L_BRACE"; value: "{"; },
        { type: "R_BRACE"; value: "}"; },
        { type: "R_BRACE"; value: "}"; },
        { type: "R_S_BRACE"; value: "]"; }
      ]]>();
    });
  });

  describe('test parser', () => {
    it('test MatchToken', () => {
      type Tokens0 = [
        { type: "L_S_BRACE"; value: "["; },
        { type: 'NUMBER'; value: "1"; },
        { type: "COMMA"; value: ","; },
      ];
      expectTypeOf<MatchToken<['L_S_BRACE', 'NUMBER', 'COMMA'], Tokens0>>().toEqualTypeOf<[true, []]>();
      expectTypeOf<MatchToken<['L_S_BRACE', 'NUMBER'], Tokens0>>().toEqualTypeOf<[true, [Tokens0[2]]]>();
      expectTypeOf<MatchToken<[], Tokens0>>().toEqualTypeOf<[true, Tokens0]>();
      expectTypeOf<MatchToken<[], []>>().toEqualTypeOf<[true, []]>();
      expectTypeOf<MatchToken<['R_S_BRACE', 'NUMBER'], Tokens0>>().toEqualTypeOf<[false]>();
      expectTypeOf<MatchToken<['R_S_BRACE', 'NUMBER'], []>>().toEqualTypeOf<[false]>();
      expectTypeOf<MatchToken<['L_S_BRACE', 'NUMBER', 'COMMA', 'COMMA'], Tokens0>>().toEqualTypeOf<[false]>();
    });
  });
});
