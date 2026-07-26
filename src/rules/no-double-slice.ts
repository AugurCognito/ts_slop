import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

export default createRule({
  name: 'no-double-slice',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow chained `.slice().slice()` calls — collapse into a single `.slice(start, end)`.',
    },
    messages: {
      doubleSlice: 'Chained `.slice().slice()` calls — collapse into a single `.slice(start, end)`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (node.callee.property.type !== AST_NODE_TYPES.Identifier) return;
        if (node.callee.property.name !== 'slice') return;

        const inner = node.callee.object;
        if (inner.type !== AST_NODE_TYPES.CallExpression) return;
        if (inner.callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (inner.callee.property.type !== AST_NODE_TYPES.Identifier) return;
        if (inner.callee.property.name !== 'slice') return;

        context.report({ node, messageId: 'doubleSlice' });
      },
    };
  },
});
