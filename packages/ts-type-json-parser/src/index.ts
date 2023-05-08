type TTokenType =
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
  | 'EOF';

type SimpleTokenMap = {
  '{': 'L_BRACE';
  '}': 'R_BRACE';
  '[': 'L_S_BRACE';
  ']': 'R_S_BRACE';
  ',': 'COMMA';
  ':': 'COLON';
  'true': 'TRUE';
  'false': 'FALSE';
  'null': 'NULL';
};

interface IToken {
  type: TTokenType;
  value: string;
}

type Cast<T extends unknown, To> = T extends To ? T : never;
type StringToNumber<T extends string> = T extends `${infer N extends number}` ? N : never;
type SliceFrom<T extends unknown[], Start extends number = 0, Filtered extends unknown[] = []> = Filtered['length'] extends Start
  ? T
  : T extends [infer H, ...infer Rest]
    ? SliceFrom<Rest, Start, [...Filtered, H]>
    : [];

type StartsWith<Start extends string, S extends string> = S extends `${Start}${infer R}` ? true : boolean;
type Match<Pattern extends string, S extends string> = S extends `${infer P extends Pattern}${infer R}` ? [true, P, R] : [false, '', S];
type MatchSequence<Pattern extends string, S extends string> = S extends `${Pattern}${infer R}` ? [true, Pattern, R] : [false, '', S];

type MatchPureNumber<S extends string, Result extends string = ''> = S extends `${infer H extends number}${infer R}`
  ? MatchPureNumber<R, `${Result}${H}`>
  : Result extends ''
    ? [false, '', S]
    : [true, Result, S];

type MatchNumber<S extends string, Result extends string = ''> = MatchPureNumber<S>[0] extends true
  ? Match<'.', MatchPureNumber<S>[2]>[0] extends true
    ? MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[0] extends true
      ? Match<'e', MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[2]>[0] extends true
        ? Match<'+' | '-', Match<'e', MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[2]>[2]>[0] extends true
          ? MatchPureNumber<Match<'+' | '-', Match<'e', MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[2]>[2]>[2]>[0] extends true
            ? [true, `${MatchPureNumber<S>[1]}.${MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[1]}e${Match<'+' | '-', Match<'e', MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[2]>[2]>[1]}${MatchPureNumber<Match<'+' | '-', Match<'e', MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[2]>[2]>[2]>[1]}`, MatchPureNumber<Match<'+' | '-', Match<'e', MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[2]>[2]>[2]>[2]]
            : [false, '', S, `expect 'number' after ${MatchPureNumber<S>[1]}.${MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[1]}e${Match<'+' | '-', Match<'e', MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[2]>[2]>[1]}`]
          : MatchPureNumber<Match<'e', MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[2]>[2]>[0] extends true
            ? [true, `${MatchPureNumber<S>[1]}.${MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[1]}e${MatchPureNumber<Match<'e', MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[2]>[2]>[1]}`, MatchPureNumber<Match<'e', MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[2]>[2]>[2]]
            : [false, '', S, `expect number after ${MatchPureNumber<S>[1]}.${MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[1]}e`]
        : [true, `${MatchPureNumber<S>[1]}.${MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[1]}`, MatchPureNumber<Match<'.', MatchPureNumber<S>[2]>[2]>[2]]
      : [false, '', S, `expect number after ${MatchPureNumber<S>[1]}.`]
    : [true, `${MatchPureNumber<S>[1]}`, MatchPureNumber<S>[2]]
  : [false, '', S, `expect number at start`];


type EscapeCharMap = {
  '"': '"';
  '\\': '\\';
  '/': '/';
  'b': '\b';
  'f': '\f';
  'n': '\n';
  'r': '\r';
  't': '\t';
};

type MatchStringContent<S extends string, Result extends string = ''> = Match<'"', S>[0] extends true
  ? [true, Result, S]
  : Match<'\r' | '\n', S>[0] extends true
    ? [false, '', `${Result}${S}`, `unexpected token after ${Result}`]
    : Match<'\\', S>[0] extends true
      ? Match<string, Match<'\\', S>[2]>[1] extends keyof EscapeCharMap
        ? MatchStringContent<Match<string, Match<'\\', S>[2]>[2], `${Result}${EscapeCharMap[Match<string, Match<'\\', S>[2]>[1]]}`>
        : [false, '', `${Result}${S}`, `unexpected escape char after ${Result}`]
      : Match<string, S>[0] extends true
        ? MatchStringContent<Match<string, S>[2], `${Result}${Match<string, S>[1]}`>
        : [false, '', `${Result}${S}`, `unexpected EOF after ${Result}`];

type MatchString<S extends string> = Match<'"', S>[0] extends true
  ? MatchStringContent<Match<'"', S>[2]> extends infer MatchStringContentResult extends [boolean, string, string, string?]
    ? MatchStringContentResult[0] extends true
      ? [true, MatchStringContentResult[1], Match<string, MatchStringContentResult[2]>[2]]
      : [false, '', S, MatchStringContentResult[3]]
    : 1
  : [false, '', S, `expect '"' at start`];

type MatchSimpleToken<S extends string, MatchOptions extends keyof SimpleTokenMap = keyof SimpleTokenMap> = (MatchOptions extends unknown
  ? MatchSequence<MatchOptions, S> extends infer MatchResult extends [boolean, string, string, string?]
    ? MatchResult[0] extends true
      ? [true, { type: SimpleTokenMap[MatchOptions], value: MatchOptions }, MatchResult[2]]
      : never
    : never
  : never) extends infer R
  ? [R] extends [never]
    ? [false, never, S]
    : R
  : never;

type Lexer<S extends string, R extends IToken[] = []> = S extends ''
  ? [true, R]
  : Match<' ' | '\t' | '\r' | '\n', S> extends infer MatchWSResult extends [boolean, string, string]
    ? MatchWSResult[0] extends true
      ? Lexer<MatchWSResult[2], R>
      : MatchSimpleToken<S> extends infer MatchSTResult extends [boolean, IToken, string]
        ? MatchSTResult[0] extends true
          ? Lexer<MatchSTResult[2], [...R, MatchSTResult[1]]>
          : MatchNumber<S> extends infer MatchNumResult extends [boolean, string, string, string?]
            ? MatchNumResult[0] extends true
              ? Lexer<MatchNumResult[2], [...R, { type: 'NUMBER', value: MatchNumResult[1] }]>
              : MatchString<S> extends infer MatchStrResult extends [boolean, string, string, string?]
                ? MatchStrResult[0] extends true
                  ? Lexer<MatchStrResult[2], [...R, { type: 'STRING', value: MatchStrResult[1] }]>
                  : [false, R, `unexpected token at '${S}'`]
                : never
            : never
        : never
    : never;

type MatchToken<Types extends TTokenType[], T extends IToken[]> = Types extends [infer H extends TTokenType, ...infer Rest extends TTokenType[]]
  ? T extends [infer HT extends IToken, ...infer RestT extends IToken[]]
    ? HT['type'] extends H
      ? MatchToken<Rest, RestT>
      : [false]
    : [false]
  : [true, T];

type MatchAnyToken<Type extends TTokenType, T extends IToken[]> = (Type extends unknown
  ? MatchToken<[Type], T>[0] extends true
    ? [true, T[0], MatchToken<[Type], T>[1]]
    : never
  : 2) extends infer Result
  ? [Result] extends [never]
    ? [false, T]
    : Result
  : never;

type MatchKVPair<T extends IToken[], Result extends Record<string, unknown> = {}> = MatchToken<['STRING', 'COLON'], T> extends infer KeyColonResult extends ([true, IToken[]] | [false])
  ? KeyColonResult[0] extends true
    ? Parser<SliceFrom<T, 2>> extends infer ValueResult extends [boolean, unknown, IToken[], string?]
      ? ValueResult[0] extends true
        ? MatchToken<['COMMA'], ValueResult[2]>[0] extends true
          ? MatchKVPair<SliceFrom<ValueResult[2], 1>, Result & { [P in T[0]['value']]: ValueResult[1] }>
          : [true, Result & { [P in T[0]['value']]: ValueResult[1] }, ValueResult[2]]
        : [false, Result, [], `error while parsing value of KV pair, current: ${T[0]['value']}:`]
      : never
    : [false, Result, [], `error while parsing key of KV pair, current: ${T[0]['value']}:`]
  : never;

type ParseObject<T extends IToken[]> = MatchToken<['L_BRACE'], T>[0] extends true
  ? MatchToken<['L_BRACE', 'R_BRACE'], T>[0] extends true
    ? [true, {}, SliceFrom<T, 2>]
    : MatchKVPair<SliceFrom<T, 1>> extends infer KVPairResult extends [boolean, unknown, IToken[], string?]
      ? KVPairResult[0] extends true
        ? MatchToken<['R_BRACE'], KVPairResult[2]>[0] extends true
          ? [true, KVPairResult[1], SliceFrom<KVPairResult[2], 1>]
          : [false, `expected '}' at ${KVPairResult[2][0]['value']}`]
        : [false, T]
      : never
  : [false, `expected '{' at ${T[0]['value']}`];

type ParseArrayElems<T extends IToken[], Result extends unknown[] = []> =
  Parser<T> extends infer ElemR extends [boolean, unknown, IToken[], string?]
    ? ElemR[0] extends true
      ? MatchToken<['COMMA'], ElemR[2]>[0] extends true
        ? ParseArrayElems<SliceFrom<ElemR[2], 1>, [...Result, ElemR[1]]>
        : [true, [...Result, ElemR[1]], ElemR[2]]
      : [false, Result, [], `error while parsing array elem, current: ${T[0]['value']}:`]
    : never;

type ParseArray<T extends IToken[]> = MatchToken<['L_S_BRACE'], T>[0] extends true
  ? MatchToken<['L_S_BRACE', 'R_S_BRACE'], T>[0] extends true
    ? [true, [], SliceFrom<T, 2>]
    : ParseArrayElems<SliceFrom<T, 1>> extends infer ArrElemsR extends [boolean, unknown[], IToken[], string?]
      ? ArrElemsR[0] extends true
        ? MatchToken<['R_S_BRACE'], ArrElemsR[2]>[0] extends true
          ? [true, ArrElemsR[1], SliceFrom<ArrElemsR[2], 1>]
          : [false, never, T, `expected ']' behind elems`]
        : [false, never, T, ArrElemsR[3]]
      : never
  : [false, never, T, `expected '[' at start`];

type SimpleLiteralValueMap = {
  TRUE: true;
  FALSE: false;
  NULL: null;
};
type GetSimpleLiteralValue<T extends IToken> = T['type'] extends 'STRING'
  ? T['value']
  : T['type'] extends 'NUMBER'
    ? number extends StringToNumber<T['value']>
      ? number & { value: T['value'] }
      : StringToNumber<T['value']>
    : SimpleLiteralValueMap[Cast<T['type'], keyof SimpleLiteralValueMap>];

type Parser<T extends IToken[]> = MatchAnyToken<'STRING' | 'NUMBER' | 'NULL' | 'TRUE' | 'FALSE', T> extends infer SimpleLiteralResult extends unknown[]
  ? SimpleLiteralResult[0] extends true
    ? [true, GetSimpleLiteralValue<T[0]>, SimpleLiteralResult[2]]
    : ParseObject<T> extends infer ObjectResult extends unknown[]
      ? ObjectResult[0] extends true
        ? [true, ObjectResult[1], ObjectResult[2]]
        : ParseArray<T> extends infer ArrayResult extends unknown[]
          ? ArrayResult[0] extends true
            ? [true, ArrayResult[1], ArrayResult[2]]
            : [false, never, T, `unexpected token: ${T[0]['value']}`]
          : never
      : never
  : never;

type X = Parser<Lexer<'{"x": {"a": 2}}'>[1]>;

export type {
  StartsWith,
  Match,
  MatchSequence,
  MatchPureNumber,
  MatchNumber,
  MatchStringContent,
  MatchString,
  MatchSimpleToken,
  Lexer,
  MatchToken,
  SliceFrom,
  Parser,
};
