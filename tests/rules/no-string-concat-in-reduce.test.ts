import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-string-concat-in-reduce.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-string-concat-in-reduce', rule, {
  valid: [
    { name: 'join()', code: 'items.join(", ");' },
    { name: 'reduce with number', code: 'nums.reduce((acc, n) => acc + n, 0);' },
    { name: 'map then join', code: 'items.map(x => x.name).join(", ");' },
  ],
  invalid: [
    {
      name: 'string concat with +',
      code: 'items.reduce((acc, x) => acc + x, "");',
      errors: [{ messageId: 'stringConcat' }],
    },
    {
      name: 'template literal concat',
      code: 'items.reduce((acc, x) => `${acc}${x}`, "");',
      errors: [{ messageId: 'stringConcat' }],
    },
    {
      name: 'block body with return',
      code: 'items.reduce((acc, x) => { return acc + x; }, "");',
      errors: [{ messageId: 'stringConcat' }],
    },
  ],
});
