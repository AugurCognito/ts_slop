import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-sort-for-extremum.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-sort-for-extremum', rule, {
  valid: [
    { name: 'plain sort', code: 'arr.sort((a, b) => a - b);' },
    { name: 'Math.min', code: 'Math.min(...arr);' },
    { name: 'sort then slice a real range', code: 'arr.sort((a, b) => a - b).slice(0, 5);' },
    { name: 'unrelated pop', code: 'arr.pop();' },
    { name: 'unrelated index access', code: 'arr[0];' },
  ],
  invalid: [
    {
      name: 'sort()[0]',
      code: 'const min = arr.sort((a, b) => a - b)[0];',
      errors: [{ messageId: 'sortForExtremum' }],
    },
    {
      name: 'sort().pop()',
      code: 'const max = arr.sort((a, b) => a - b).pop();',
      errors: [{ messageId: 'sortForExtremum' }],
    },
    {
      name: 'sort().shift()',
      code: 'const min = arr.sort((a, b) => a - b).shift();',
      errors: [{ messageId: 'sortForExtremum' }],
    },
    {
      name: 'sort().slice(0, 1)',
      code: 'const top = arr.sort((a, b) => b - a).slice(0, 1);',
      errors: [{ messageId: 'sortForExtremum' }],
    },
  ],
});
