import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/augurcognito/ts_slop/blob/main/README.md#rules',
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
    // For a chain of 3+ `.slice()` calls, only the outermost pair is
    // reported; the inner call is marked handled so it isn't also flagged
    // for pairing with the one below it.
    const handled = new Set<TSESTree.Node>();

    return {
      CallExpression(node) {
        if (handled.has(node)) return;
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (node.callee.property.type !== AST_NODE_TYPES.Identifier) return;
        if (node.callee.property.name !== 'slice') return;

        const inner = node.callee.object;
        if (inner.type !== AST_NODE_TYPES.CallExpression) return;
        if (inner.callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (inner.callee.property.type !== AST_NODE_TYPES.Identifier) return;
        if (inner.callee.property.name !== 'slice') return;

        context.report({ node, messageId: 'doubleSlice' });
        handled.add(inner);
      },
    };
  },
});
