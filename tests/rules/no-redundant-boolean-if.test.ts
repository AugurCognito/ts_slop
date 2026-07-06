import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-redundant-boolean-if.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-redundant-boolean-if', rule, {
  valid: [
    { name: 'if without else', code: 'if (x) return true;' },
    { name: 'if returning non-boolean', code: 'if (x) return "yes"; else return "no";' },
    {
      name: 'if with logic in branches',
      code: 'if (x) { doSomething(); return true; } else { return false; }',
    },
  ],
  invalid: [
    {
      name: 'if true else false',
      code: 'if (x) return true; else return false;',
      errors: [{ messageId: 'redundant' }],
    },
    {
      name: 'if false else true (negated)',
      code: 'if (x) return false; else return true;',
      errors: [{ messageId: 'redundant' }],
    },
    {
      name: 'block bodies',
      code: 'if (x) { return true; } else { return false; }',
      errors: [{ messageId: 'redundant' }],
    },
  ],
});
