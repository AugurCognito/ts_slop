import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-as-any.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-as-any', rule, {
  valid: [
    { name: 'normal type assertion', code: 'const x = value as string;' },
    { name: 'as unknown (alone is fine)', code: 'const x = value as unknown;' },
    { name: 'as const', code: 'const x = [1, 2] as const;' },
  ],
  invalid: [
    {
      name: 'as any',
      code: 'const x = value as any;',
      errors: [{ messageId: 'asAny' }],
    },
    {
      name: 'as unknown as T (double assertion)',
      code: 'const x = value as unknown as number;',
      errors: [{ messageId: 'doubleAssertion' }],
    },
    {
      name: 'as any in function argument',
      code: 'fn(data as any);',
      errors: [{ messageId: 'asAny' }],
    },
  ],
});
