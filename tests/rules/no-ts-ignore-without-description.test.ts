import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-ts-ignore-without-description.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-ts-ignore-without-description', rule, {
  valid: [
    {
      name: 'ts-expect-error with description',
      code: '// @ts-expect-error — third-party types are wrong\nconst x = lib.call();',
    },
    {
      name: 'ts-ignore with description',
      code: '// @ts-ignore - legacy API returns untyped\nconst x = old.get();',
    },
    { name: 'normal comment', code: '// this is a normal comment\nconst x = 1;' },
  ],
  invalid: [
    {
      name: 'bare @ts-ignore',
      code: '// @ts-ignore\nconst x = bad();',
      errors: [{ messageId: 'missingDescription' }],
    },
    {
      name: 'bare @ts-expect-error',
      code: '// @ts-expect-error\nconst x = bad();',
      errors: [{ messageId: 'missingDescription' }],
    },
    {
      name: '@ts-ignore with only dash',
      code: '// @ts-ignore —\nconst x = bad();',
      errors: [{ messageId: 'missingDescription' }],
    },
  ],
});
