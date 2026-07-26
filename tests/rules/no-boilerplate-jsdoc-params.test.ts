import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-boilerplate-jsdoc-params.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-boilerplate-jsdoc-params', rule, {
  valid: [
    {
      name: 'description explains a constraint',
      code: '/**\n * @param userId - Must be a UUID v4, not the legacy numeric id\n */\nfunction f(userId) {}',
    },
    {
      name: 'no description at all',
      code: '/**\n * @param userId\n */\nfunction f(userId) {}',
    },
    {
      name: 'non-JSDoc block comment',
      code: '/* @param userId - The user id */\nfunction f(userId) {}',
    },
  ],
  invalid: [
    {
      name: 'description restates camelCase name',
      code: '/**\n * @param userId - The user id\n */\nfunction f(userId) {}',
      errors: [{ messageId: 'boilerplateParam' }],
    },
    {
      name: 'description restates snake_case name',
      code: '/**\n * @param user_id - user id\n */\nfunction f(userId) {}',
      errors: [{ messageId: 'boilerplateParam' }],
    },
    {
      name: 'typed param restating name',
      code: '/**\n * @param {string} userId - The user ID\n */\nfunction f(userId) {}',
      errors: [{ messageId: 'boilerplateParam' }],
    },
    {
      name: 'reports only the offending @param line, not the whole block',
      code: '/**\n * @param goodParam - Must be positive and even\n * @param userId - The user id\n */\nfunction f(goodParam, userId) {}',
      errors: [{ messageId: 'boilerplateParam', line: 3, endLine: 3 }],
    },
  ],
});
