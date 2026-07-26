import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/augurcognito/ts_slop/blob/main/README.md#rules',
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
        const meaningful = node.body.body.filter(
          (stmt) => stmt.type !== AST_NODE_TYPES.EmptyStatement,
        );
        if (meaningful.length === 0) {
          context.report({ node, messageId: 'emptyCatch' });
        }
      },
    };
  },
});
