import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-default-fallback-catch.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-default-fallback-catch', rule, {
  valid: [
    {
      name: 'catch rethrows',
      code: 'try { f(); } catch (e) { throw e; }',
    },
    {
      name: 'catch returns meaningful value',
      code: 'try { f(); } catch (e) { return { error: e.message }; }',
    },
    {
      name: 'catch with no return',
      code: 'try { f(); } catch (e) { console.error(e); }',
    },
  ],
  invalid: [
    {
      name: 'return null',
      code: 'try { f(); } catch (e) { return null; }',
      errors: [{ messageId: 'silentDefault' }],
    },
    {
      name: 'return undefined',
      code: 'try { f(); } catch (e) { return undefined; }',
      errors: [{ messageId: 'silentDefault' }],
    },
    {
      name: 'return empty string (T1.3 hole fix)',
      code: 'try { f(); } catch (e) { return ""; }',
      errors: [{ messageId: 'silentDefault' }],
    },
    {
      name: 'return 0 (T1.3 hole fix)',
      code: 'try { f(); } catch (e) { return 0; }',
      errors: [{ messageId: 'silentDefault' }],
    },
    {
      name: 'return false (T1.3 hole fix)',
      code: 'try { f(); } catch (e) { return false; }',
      errors: [{ messageId: 'silentDefault' }],
    },
    {
      name: 'return empty array',
      code: 'try { f(); } catch (e) { return []; }',
      errors: [{ messageId: 'silentDefault' }],
    },
    {
      name: 'return empty object',
      code: 'try { f(); } catch (e) { return {}; }',
      errors: [{ messageId: 'silentDefault' }],
    },
  ],
});
