# tiny-json5-parser

A parser for json5.

## Installation and Usage
### Node.js
```sh
npm install tiny-json5-parser
```

#### CommonJS
```js
const JSON5 = require('tiny-json5-parser');

const content = `
{
  // comments
  unquoted: 'and you can quote me on that',
  singleQuotes: 'I can use "double quotes" here',
  lineBreaks: "Look, Mom! \
No \\n's!",
  hexadecimal: 0xdecaf,
  leadingDecimalPoint: .8675309, andTrailing: 8675309.,
  positiveSign: +1,
  trailingComma: 'in objects', andIn: ['arrays',],
  "backwardsCompatible": "with JSON",
}
`;
const result = JSON5.parse(content);
console.log(result);
// {
//     unquoted: 'and you can quote me on that',
//         singleQuotes: 'I can use "double quotes" here',
//     lineBreaks: "Look, Mom! No \n's!",
//     hexadecimal: 912559,
//     leadingDecimalPoint: 0.8675309,
//     andTrailing: 8675309,
//     positiveSign: 1,
//     trailingComma: 'in objects',
//     andIn: [ 'arrays' ],
//     backwardsCompatible: 'with JSON'
// }

```

#### Modules
```js
import * as JSON5 from 'tiny-json5-parser';

const content = `
{
  // comments
  unquoted: 'and you can quote me on that',
  singleQuotes: 'I can use "double quotes" here',
  lineBreaks: "Look, Mom! \
No \\n's!",
  hexadecimal: 0xdecaf,
  leadingDecimalPoint: .8675309, andTrailing: 8675309.,
  positiveSign: +1,
  trailingComma: 'in objects', andIn: ['arrays',],
  "backwardsCompatible": "with JSON",
}
`;
const result = JSON5.parse(content);
console.log(result);
// {
//     unquoted: 'and you can quote me on that',
//         singleQuotes: 'I can use "double quotes" here',
//     lineBreaks: "Look, Mom! No \n's!",
//     hexadecimal: 912559,
//     leadingDecimalPoint: 0.8675309,
//     andTrailing: 8675309,
//     positiveSign: 1,
//     trailingComma: 'in objects',
//     andIn: [ 'arrays' ],
//     backwardsCompatible: 'with JSON'
// }
```
