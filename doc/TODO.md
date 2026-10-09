### TODO
| Status   | Subject                                                                                 |
|----------|-----------------------------------------------------------------------------------------|
| done     | add CKind fields string-struct support `uint8 a,b;`                                     |
| done     | add type `buf, buffer, bufN`, `{b: buf[10]}, {b: buf10}`, `{b: buf[i16]}, {b.i16: buf}` |
| done     | add TypeScript decorators to serialize/deserialize class object to/from binary          |
| =======  |                                                                                         |
| todo     | read/write bits/flags inside atom type                                                  |
| todo     | another way to make tangled size and array/buffer/string                                |
| =======  |                                                                                         |
| consider | default values? `=123`                                                                  |
| done     | add types as enum - `{ b: { type: 'u8', enum: { 1: 'FOO' } } }`                         |
| consider | are fields "ab cd" allowed? rather no                                                   |

