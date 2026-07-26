import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

export default createRule({
  name: 'no-empty-catch',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow catch blocks with no statements — silently swallows the error with no trace at all.',
    },
    messages: {
      emptyCatch:
        'Empty catch block silently swallows the error. Handle it, rethrow it, or remove the try/catch.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CatchClause(node) {
        if (node.body.body.length === 0) {
          context.report({ node, messageId: 'emptyCatch' });
        }
      },
    };
  },
});
