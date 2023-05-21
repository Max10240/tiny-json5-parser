import { describe, it, expectTypeOf } from 'vitest';
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
  SliceFrom,
  SliceStrFrom,
  JsonNumber,
  Parser,
} from '@/index';

describe('test ts type parser', () => {
  describe('test utils', () => {
    it('test SliceStart', () => {
      expectTypeOf<SliceFrom<[1, 3, 4, 5]>>().toEqualTypeOf<[1, 3, 4, 5]>();
      expectTypeOf<SliceFrom<[1, 3, 4, 5], 0>>().toEqualTypeOf<[1, 3, 4, 5]>();
      expectTypeOf<SliceFrom<[1, 3, 4, 5], 2>>().toEqualTypeOf<[4, 5]>();
      expectTypeOf<SliceFrom<[1, 3, 4, 5], 4>>().toEqualTypeOf<[]>();
      expectTypeOf<SliceFrom<[1, 3, 4, 5], 5>>().toEqualTypeOf<[]>();
    });

    it('test SliceStart', () => {
      expectTypeOf<SliceStrFrom<'1345'>>().toEqualTypeOf<'1345'>();
      expectTypeOf<SliceStrFrom<'1345', 0>>().toEqualTypeOf<'1345'>();
      expectTypeOf<SliceStrFrom<'1345', 1>>().toEqualTypeOf<'345'>();
      expectTypeOf<SliceStrFrom<'1345', 4>>().toEqualTypeOf<''>();
      expectTypeOf<SliceStrFrom<'1345', 5>>().toEqualTypeOf<''>();
    });
  });

  describe('test lexer', () => {
    it('test MatchNumber', () => {
      expectTypeOf<MatchNumber<'12.456e-43==='>>().toEqualTypeOf<[true, "12.456e-43", "==="]>();
      expectTypeOf<MatchNumber<'12.456e-XXX43==='>>().toMatchTypeOf<[false, "", "12.456e-XXX43===", string]>();
      expectTypeOf<MatchNumber<'12.456e43==='>>().toEqualTypeOf<[true, "12.456e43", "==="]>();
      expectTypeOf<MatchNumber<'12.456eXXX43==='>>().toMatchTypeOf<[false, "", "12.456eXXX43===", string]>();
      expectTypeOf<MatchNumber<'12.456===e43'>>().toEqualTypeOf<[true, "12.456", "===e43"]>();
      expectTypeOf<MatchNumber<'12.XXX456===e43'>>().toMatchTypeOf<[false, "", "12.XXX456===e43", string]>();
      expectTypeOf<MatchNumber<'12===.456ke43--='>>().toEqualTypeOf<[true, "12", "===.456ke43--="]>();
      expectTypeOf<MatchNumber<'XXX12===.456ke43--='>>().toMatchTypeOf<[false, "", "XXX12===.456ke43--=", string]>();
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

    it('test Parser', () => {
      expectTypeOf<Parser<Lexer<'{"x": {"a": ["\\n\\r123", 123.4567, 123.456e-78, { "90": [false, true, null] }]}}'>[1]>[1]>().toEqualTypeOf<{
        x: {
          a: ['\n\r123', 123.4567, JsonNumber<'123.456e-78'>, { '90': [false, true, null] }]
        }
      }>();
      expectTypeOf<Parser<Lexer<'{"x": {"a": 2}}'>[1]>[1]>().toEqualTypeOf<{ x: { a: 2 } }>();

      type Pkg = {
        "name": "tiny-json5-parser",
        "version": "1.0.0",
        "description": "",
        "type": "module",
        "scripts": {
          "test": "vitest",
          "dev:tsc": "TSCONFIG_PATH=tsconfig.emit.json; tsc -w -p $TSCONFIG_PATH & tsc-alias -w -p $TSCONFIG_PATH",
          "build": "TSCONFIG_PATH=tsconfig.emit.json; tsc -p $TSCONFIG_PATH && tsc-alias -p $TSCONFIG_PATH"
        },
        "keywords": ["json5", "parser", "typescript"],
        "author": "Baolong Wang <wangbaolong36@gmail.com>",
        "license": "MIT",
        "devDependencies": {
          "json5": "^2.2.3"
        }
      };
      type PkgStr = `{
        "name": "tiny-json5-parser",
        "version": "1.0.0",
        "description": "",
        "type": "module",
        "scripts": {
          "test": "vitest",
          "dev:tsc": "TSCONFIG_PATH=tsconfig.emit.json; tsc -w -p $TSCONFIG_PATH & tsc-alias -w -p $TSCONFIG_PATH",
          "build": "TSCONFIG_PATH=tsconfig.emit.json; tsc -p $TSCONFIG_PATH && tsc-alias -p $TSCONFIG_PATH"
        },
        "keywords": ["json5", "parser", "typescript"],
        "author": "Baolong Wang <wangbaolong36@gmail.com>",
        "license": "MIT",
        "devDependencies": {
          "json5": "^2.2.3"
        }
      }`;
      expectTypeOf<Parser<Lexer<PkgStr>[1]>[1]>().toEqualTypeOf<Pkg>();

      type TestData1 = {
        "problems": [{
          "Diabetes": [{
            "medications": [{
              "medicationsClasses": [{
                "className": [{
                  "associatedDrug": [{
                    "name": "asprin",
                    "dose": "",
                    "strength": "500 mg"
                  }],
                  "associatedDrug#2": [{
                    "name": "somethingElse",
                    "dose": "",
                    "strength": "500 mg"
                  }]
                }]
              }]
            }],
            "labs": [{
              "missing_field": "missing_value"
            }]
          }],
          "Asthma": [{}]
        }]
      };
      type TestDataStr1 = `{
        "problems": [{
            "Diabetes":[{
                "medications":[{
                    "medicationsClasses":[{
                        "className":[{
                            "associatedDrug":[{
                                "name":"asprin",
                                "dose":"",
                                "strength":"500 mg"
                            }],
                            "associatedDrug#2":[{
                                "name":"somethingElse",
                                "dose":"",
                                "strength":"500 mg"
                            }]
                        }]
                    }]
                }],
                "labs":[{
                    "missing_field": "missing_value"
                }]
            }],
            "Asthma":[{}]
        }]}`;
      expectTypeOf<Parser<Lexer<TestDataStr1>[1]>[1]>().toEqualTypeOf<TestData1>();
    });
  });
});
