import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

export default createRule({
  name: 'no-sort-then-reverse',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `.sort().reverse()` — pass a descending comparator to `.sort()` instead.',
    },
    messages: {
      sortReverse:
        '`.sort().reverse()` is O(n log n + n) — use a descending comparator in `.sort()` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (node.callee.property.type !== AST_NODE_TYPES.Identifier) return;
        if (node.callee.property.name !== 'reverse') return;
        if (node.arguments.length !== 0) return;

        const inner = node.callee.object;
        if (inner.type !== AST_NODE_TYPES.CallExpression) return;
        if (inner.callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (inner.callee.property.type !== AST_NODE_TYPES.Identifier) return;
        if (inner.callee.property.name !== 'sort') return;

        context.report({ node, messageId: 'sortReverse' });
      },
    };
  },
});
