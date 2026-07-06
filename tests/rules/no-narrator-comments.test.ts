import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from '../../src/rules/no-narrator-comments.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('no-narrator-comments', rule, {
  valid: [
    { name: 'constraint comment', code: '// Timezone is always UTC here\nconst t = now();' },
    { name: 'TODO comment', code: '// TODO: refactor when API stabilizes\nconst x = 1;' },
    { name: 'block comment', code: '/* First, we do this */\nconst x = 1;' },
    { name: 'normal code comment', code: '// cache key format: user:{id}\nconst k = `user:${id}`;' },
  ],
  invalid: [
    {
      name: 'First, we ...',
      code: '// First, we validate the input\nvalidate(data);',
      errors: [{ messageId: 'narrator' }],
    },
    {
      name: 'Now we ...',
      code: '// Now we fetch the user\nconst u = getUser();',
      errors: [{ messageId: 'narrator' }],
    },
    {
      name: "Let's ...",
      code: "// Let's create the response\nconst r = new Response();",
      errors: [{ messageId: 'narrator' }],
    },
    {
      name: 'Step N',
      code: '// Step 1: validate input\nvalidate();',
      errors: [{ messageId: 'narrator' }],
    },
    {
      name: 'We need to',
      code: '// We need to handle this edge case\nif (edge) handle();',
      errors: [{ messageId: 'narrator' }],
    },
    {
      name: 'Here we ...',
      code: '// Here we process the data\nprocess(data);',
      errors: [{ messageId: 'narrator' }],
    },
  ],
});
