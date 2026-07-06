import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-catch-log-continue.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-catch-log-continue', rule, {
  valid: [
    {
      name: 'catch rethrows after logging',
      code: `
        try { doSomething(); }
        catch (e) { console.error(e); throw e; }
      `,
    },
    {
      name: 'catch returns a value after logging',
      code: `
        try { return doSomething(); }
        catch (e) { console.error(e); return null; }
      `,
    },
    {
      name: 'catch does meaningful work (no console call)',
      code: `
        try { doSomething(); }
        catch (e) { fallback(); }
      `,
    },
    {
      name: 'empty catch (intentional swallow — different smell)',
      code: `
        try { doSomething(); }
        catch (e) {}
      `,
    },
    {
      name: 'catch with conditional rethrow',
      code: `
        try { doSomething(); }
        catch (e) {
          console.error(e);
          if (e instanceof TypeError) { throw e; }
        }
      `,
    },
  ],

  invalid: [
    {
      name: 'catch only logs with console.error',
      code: `
        try { doSomething(); }
        catch (e) { console.error(e); }
      `,
      errors: [{ messageId: 'logOnly' }],
    },
    {
      name: 'catch only logs with console.log',
      code: `
        try { doSomething(); }
        catch (e) { console.log('failed', e); }
      `,
      errors: [{ messageId: 'logOnly' }],
    },
    {
      name: 'catch logs with multiple console calls',
      code: `
        try { doSomething(); }
        catch (e) {
          console.warn('operation failed');
          console.error(e);
        }
      `,
      errors: [{ messageId: 'logOnly' }],
    },
  ],
});
