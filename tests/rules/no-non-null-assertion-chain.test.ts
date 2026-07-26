import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-non-null-assertion-chain.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-non-null-assertion-chain', rule, {
  valid: [
    { name: 'single non-null assertion', code: 'const x = foo!.bar;' },
    { name: 'no assertions', code: 'const x = foo.bar.baz;' },
    { name: 'two separate single assertions in different expressions', code: 'const x = foo!.bar; const y = baz!.qux;' },
  ],
  invalid: [
    {
      name: 'two chained assertions',
      code: 'const x = foo!.bar!.baz;',
      errors: [{ messageId: 'chain' }],
    },
    {
      name: 'three chained assertions',
      code: 'const x = foo!.bar!.baz!;',
      errors: [{ messageId: 'chain' }],
    },
    {
      name: 'four chained assertions with computed access',
      code: 'const x = foo!.bar!.baz!.qux!;',
      errors: [{ messageId: 'chain' }],
    },
  ],
});
