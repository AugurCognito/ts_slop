import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-identity-passthrough.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-identity-passthrough', rule, {
  valid: [
    { name: 'map with transform', code: 'items.map(x => x.name);' },
    { name: 'filter with predicate', code: 'items.filter(x => x.active);' },
    { name: 'map with index', code: 'items.map((x, i) => i);' },
    { name: 'non-array method', code: 'obj.get(x => x);' },
  ],
  invalid: [
    {
      name: '.map(x => x)',
      code: 'items.map(x => x);',
      errors: [{ messageId: 'identity' }],
    },
    {
      name: '.filter(x => x)',
      code: 'items.filter(x => x);',
      errors: [{ messageId: 'identity' }],
    },
    {
      name: '.map(x => { return x; })',
      code: 'items.map(x => { return x; });',
      errors: [{ messageId: 'identity' }],
    },
    {
      name: '.flatMap(item => item)',
      code: 'items.flatMap(item => item);',
      errors: [{ messageId: 'identity' }],
    },
  ],
});
