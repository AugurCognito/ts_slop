import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/augurcognito/ts_slop/blob/main/README.md#rules',
);

function countChain(node: TSESTree.TSNonNullExpression): number {
  let count = 1;
  let current: TSESTree.Node = node.expression;

  for (;;) {
    if (current.type === AST_NODE_TYPES.MemberExpression) {
      current = current.object;
      continue;
    }
    if (current.type === AST_NODE_TYPES.TSNonNullExpression) {
      count += 1;
      current = current.expression;
      continue;
    }
    break;
  }

  return count;
}

export default createRule({
  name: 'no-non-null-assertion-chain',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow chaining multiple non-null assertions (`!`) — narrow the type or guard once instead.',
    },
    messages: {
      chain:
        'Chained non-null assertions (`!`) hide multiple possible null/undefined points — narrow the type or guard once instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const handled = new Set<TSESTree.Node>();

    return {
      TSNonNullExpression(node) {
        if (handled.has(node)) return;

        const count = countChain(node);
        if (count < 2) return;

        context.report({ node, messageId: 'chain' });

        let current: TSESTree.Node = node.expression;
        for (;;) {
          if (current.type === AST_NODE_TYPES.MemberExpression) {
            current = current.object;
            continue;
          }
          if (current.type === AST_NODE_TYPES.TSNonNullExpression) {
            handled.add(current);
            current = current.expression;
            continue;
          }
          break;
        }
      },
    };
  },
});
