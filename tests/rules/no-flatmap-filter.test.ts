import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-flatmap-filter.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-flatmap-filter', rule, {
  valid: [
    { name: 'real flatMap flattening nested arrays', code: 'items.flatMap(x => x.children);' },
    { name: 'flatMap returning variable-length arrays', code: 'items.flatMap(x => [x, x]);' },
    { name: 'plain filter', code: 'items.filter(x => x.active);' },
    {
      name: 'flatMap with unrelated block body',
      code: 'items.flatMap(x => { const y = f(x); return [y, y]; });',
    },
  ],
  invalid: [
    {
      name: 'ternary singleton/empty',
      code: 'items.flatMap(item => item.active ? [item] : []);',
      errors: [{ messageId: 'flatMapFilter' }],
    },
    {
      name: 'ternary reversed',
      code: 'items.flatMap(item => item.active ? [] : [item]);',
      errors: [{ messageId: 'flatMapFilter' }],
    },
    {
      name: 'if/else block form',
      code: 'items.flatMap(item => { if (item.active) { return [item]; } else { return []; } });',
      errors: [{ messageId: 'flatMapFilter' }],
    },
    {
      name: 'if then trailing return form',
      code: 'items.flatMap(item => { if (item.active) return [item]; return []; });',
      errors: [{ messageId: 'flatMapFilter' }],
    },
  ],
});
