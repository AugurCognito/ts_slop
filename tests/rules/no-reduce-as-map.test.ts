import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-reduce-as-map.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-reduce-as-map', rule, {
  valid: [
    { name: 'plain map', code: 'items.map(x => f(x));' },
    { name: 'reduce summing', code: 'items.reduce((acc, x) => acc + x, 0);' },
    { name: 'reduce building an object', code: 'items.reduce((acc, x) => { acc[x.id] = x; return acc; }, {});' },
    {
      name: 'conditional push is filtering, not mapping',
      code: 'items.reduce((acc, x) => { if (x.active) acc.push(x); return acc; }, []);',
    },
    { name: 'reduce with non-empty initial array', code: 'items.reduce((acc, x) => { acc.push(x); return acc; }, seed);' },
  ],
  invalid: [
    {
      name: 'push then return acc',
      code: 'const mapped = items.reduce((acc, x) => { acc.push(f(x)); return acc; }, []);',
      errors: [{ messageId: 'reduceAsMap' }],
    },
    {
      name: 'multiple unconditional pushes',
      code: 'const mapped = items.reduce((acc, x) => { acc.push(f(x)); acc.push(g(x)); return acc; }, []);',
      errors: [{ messageId: 'reduceAsMap' }],
    },
  ],
});
