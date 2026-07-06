import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-await-query-in-map.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-await-query-in-map', rule, {
  valid: [
    {
      name: 'sync map',
      code: 'items.map(x => x.name);',
    },
    {
      name: 'inside Promise.all (T1.3 hole fix)',
      code: 'await Promise.all(items.map(async (x) => await fetch(x)));',
    },
    {
      name: 'inside Promise.allSettled',
      code: 'await Promise.allSettled(items.map(async (x) => await fetch(x)));',
    },
    {
      name: 'for-of loop with await (sequential is intentional)',
      code: 'for (const x of items) { await fetch(x); }',
    },
  ],
  invalid: [
    {
      name: 'async map with await',
      code: 'items.map(async (x) => await fetch(x));',
      errors: [{ messageId: 'awaitInMap' }],
    },
    {
      name: 'async forEach with await',
      code: 'items.forEach(async (item) => { await db.save(item); });',
      errors: [{ messageId: 'awaitInMap' }],
    },
    {
      name: 'async flatMap with await',
      code: 'items.flatMap(async (x) => await getChildren(x));',
      errors: [{ messageId: 'awaitInMap' }],
    },
  ],
});
