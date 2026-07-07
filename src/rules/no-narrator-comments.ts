import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

const NARRATOR_PATTERN =
  /^\/\/\s*(?:First,?|Now,?|Next,?|Then,?|Finally,?|Here we|Let's|We (?:now|then|first|need to|want to|have to|should|will|can|must)|Step \d)\b/i;

export default createRule({
  name: 'no-narrator-comments',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow narrator-style comments that narrate code step-by-step instead of stating constraints.',
    },
    messages: {
      narrator:
        'Narrator comment — delete it. Comments earn their place by stating constraints the code cannot express.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (comment.type === 'Line' && NARRATOR_PATTERN.test(`//${comment.value}`)) {
            context.report({ loc: comment.loc, messageId: 'narrator' });
          }
        }
      },
    };
  },
});
