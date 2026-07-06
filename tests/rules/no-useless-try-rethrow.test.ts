import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-useless-try-rethrow.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-useless-try-rethrow', rule, {
  valid: [
    {
      name: 'catch with logging before rethrow',
      code: 'try { f(); } catch (e) { console.error(e); throw e; }',
    },
    {
      name: 'catch wrapping the error',
      code: 'try { f(); } catch (e) { throw new AppError("failed", { cause: e }); }',
    },
    {
      name: 'try-finally (no catch)',
      code: 'try { f(); } finally { cleanup(); }',
    },
    {
      name: 'catch with finally block',
      code: 'try { f(); } catch (e) { throw e; } finally { cleanup(); }',
    },
  ],
  invalid: [
    {
      name: 'catch only rethrows',
      code: 'try { doSomething(); } catch (e) { throw e; }',
      errors: [{ messageId: 'useless' }],
    },
    {
      name: 'catch rethrows with named error',
      code: 'try { f(); } catch (err) { throw err; }',
      errors: [{ messageId: 'useless' }],
    },
  ],
});
