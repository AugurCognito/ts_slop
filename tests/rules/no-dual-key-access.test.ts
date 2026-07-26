import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-dual-key-access.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-dual-key-access', rule, {
  valid: [
    { name: 'unrelated fields', code: 'const x = usage.inputTokens ?? usage.outputTokens;' },
    { name: 'different objects', code: 'const x = a.userId ?? b.user_id;' },
    { name: 'same key both sides', code: 'const x = usage.inputTokens ?? usage.inputTokens;' },
    { name: 'plain default value', code: 'const x = usage.inputTokens ?? 0;' },
    {
      name: 'call expression base — cannot assume referential equality',
      code: 'const x = getUsage().input_tokens ?? getUsage().inputTokens;',
    },
  ],
  invalid: [
    {
      name: 'snake_case then camelCase fallback with ??',
      code: 'const tokens = usage.input_tokens ?? usage.inputTokens;',
      errors: [{ messageId: 'dualKeyAccess' }],
    },
    {
      name: 'camelCase then snake_case fallback with ||',
      code: 'const tokens = usage.inputTokens || usage.input_tokens;',
      errors: [{ messageId: 'dualKeyAccess' }],
    },
    {
      name: 'bracket access variants',
      code: "const tokens = usage['input_tokens'] ?? usage['inputTokens'];",
      errors: [{ messageId: 'dualKeyAccess' }],
    },
    {
      name: 'optional chaining on both sides',
      code: 'const tokens = usage?.input_tokens ?? usage?.inputTokens;',
      errors: [{ messageId: 'dualKeyAccess' }],
    },
  ],
});
