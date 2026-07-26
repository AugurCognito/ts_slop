import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-double-slice.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-double-slice', rule, {
  valid: [
    { name: 'single slice', code: 'arr.slice(offset, offset + limit);' },
    { name: 'slice then map', code: 'arr.slice(offset).map(f);' },
    { name: 'slice alone', code: 'arr.slice(1);' },
  ],
  invalid: [
    {
      name: 'slice(offset).slice(0, limit)',
      code: 'const page = arr.slice(offset).slice(0, limit);',
      errors: [{ messageId: 'doubleSlice' }],
    },
    {
      name: 'chained on expression result',
      code: 'getItems().slice(1).slice(-1);',
      errors: [{ messageId: 'doubleSlice' }],
    },
    {
      name: 'triple chain reports only the outer pair',
      code: 'arr.slice(1).slice(2).slice(3);',
      errors: [{ messageId: 'doubleSlice' }],
    },
  ],
});
