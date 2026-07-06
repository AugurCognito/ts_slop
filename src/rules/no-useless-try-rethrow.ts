import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

export default createRule({
  name: 'no-useless-try-rethrow',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow try/catch that only rethrows the caught error — the try/catch is redundant.',
    },
    messages: {
      useless:
        'This try/catch only rethrows — remove it and let the error propagate naturally.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TryStatement(node) {
        if (!node.handler) return;
        if (node.finalizer) return;

        const handler = node.handler;
        const body = handler.body.body;
        if (body.length !== 1) return;

        const stmt = body[0];
        if (stmt.type !== AST_NODE_TYPES.ThrowStatement) return;
        if (!stmt.argument) return;

        if (
          handler.param &&
          handler.param.type === AST_NODE_TYPES.Identifier &&
          stmt.argument.type === AST_NODE_TYPES.Identifier &&
          stmt.argument.name === handler.param.name
        ) {
          context.report({ node, messageId: 'useless' });
        }
      },
    };
  },
});
