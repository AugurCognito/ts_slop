import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-sort-then-reverse.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-sort-then-reverse', rule, {
  valid: [
    { name: 'sort with comparator', code: 'arr.sort((a, b) => b - a);' },
    { name: 'reverse alone', code: 'arr.reverse();' },
    { name: 'sort alone', code: 'arr.sort();' },
  ],
  invalid: [
    {
      name: 'sort().reverse()',
      code: 'const result = arr.sort().reverse();',
      errors: [{ messageId: 'sortReverse' }],
    },
    {
      name: 'sort with comparator then reverse',
      code: 'arr.sort((a, b) => a - b).reverse();',
      errors: [{ messageId: 'sortReverse' }],
    },
    {
      name: 'chained on expression',
      code: 'getItems().sort().reverse();',
      errors: [{ messageId: 'sortReverse' }],
    },
  ],
});
