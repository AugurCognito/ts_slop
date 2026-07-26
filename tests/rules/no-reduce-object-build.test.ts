import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-reduce-object-build.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-reduce-object-build', rule, {
  valid: [
    { name: 'Object.fromEntries', code: 'Object.fromEntries(items.map(x => [x.id, x]));' },
    { name: 'reduce summing numbers', code: 'items.reduce((acc, x) => acc + x.value, 0);' },
    { name: 'reduce building an array', code: 'items.reduce((acc, x) => { acc.push(x); return acc; }, []);' },
    { name: 'reduce with non-empty initial object', code: 'items.reduce((acc, x) => { acc[x.id] = x; return acc; }, seed);' },
  ],
  invalid: [
    {
      name: 'bracket assignment building an object',
      code: 'const byId = items.reduce((acc, x) => { acc[x.id] = x; return acc; }, {});',
      errors: [{ messageId: 'reduceObjectBuild' }],
    },
    {
      name: 'dot assignment building an object',
      code: 'const byId = items.reduce((acc, x) => { acc.total = x.value; return acc; }, {});',
      errors: [{ messageId: 'reduceObjectBuild' }],
    },
  ],
});
