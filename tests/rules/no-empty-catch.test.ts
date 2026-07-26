import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-empty-catch.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-empty-catch', rule, {
  valid: [
    { name: 'logs the error', code: 'try { f(); } catch (e) { console.error(e); }' },
    { name: 'rethrows', code: 'try { f(); } catch (e) { throw e; }' },
    { name: 'no catch clause', code: 'try { f(); } finally { cleanup(); }' },
  ],
  invalid: [
    {
      name: 'empty catch with binding',
      code: 'try { f(); } catch (e) {}',
      errors: [{ messageId: 'emptyCatch' }],
    },
    {
      name: 'empty catch without binding',
      code: 'try { f(); } catch {}',
      errors: [{ messageId: 'emptyCatch' }],
    },
    {
      name: 'catch with only a comment',
      code: 'try { f(); } catch (e) { /* ignore */ }',
      errors: [{ messageId: 'emptyCatch' }],
    },
    {
      name: 'catch with only an empty statement',
      code: 'try { f(); } catch (e) { ; }',
      errors: [{ messageId: 'emptyCatch' }],
    },
    {
      name: 'catch with only multiple empty statements',
      code: 'try { f(); } catch (e) { ;; }',
      errors: [{ messageId: 'emptyCatch' }],
    },
  ],
});
