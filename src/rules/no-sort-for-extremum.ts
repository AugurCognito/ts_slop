import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

function isSortCall(node: TSESTree.Node): boolean {
  if (node.type !== AST_NODE_TYPES.CallExpression) return false;
  if (node.callee.type !== AST_NODE_TYPES.MemberExpression) return false;
  if (node.callee.property.type !== AST_NODE_TYPES.Identifier) return false;
  return node.callee.property.name === 'sort';
}

function isZero(node: TSESTree.Node | null | undefined): boolean {
  return node?.type === AST_NODE_TYPES.Literal && node.value === 0;
}

function isOne(node: TSESTree.Node | null | undefined): boolean {
  return node?.type === AST_NODE_TYPES.Literal && node.value === 1;
}

export default createRule({
  name: 'no-sort-for-extremum',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow sorting a whole array just to pluck one extreme element — use `Math.min`/`Math.max` or a single pass instead.',
    },
    messages: {
      sortForExtremum:
        'Sorting the whole array to get one element is O(n log n) — use `Math.min`/`Math.max` (or a single reduce pass) instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (node.callee.property.type !== AST_NODE_TYPES.Identifier) return;
        if (!isSortCall(node.callee.object)) return;

        const method = node.callee.property.name;

        if ((method === 'pop' || method === 'shift') && node.arguments.length === 0) {
          context.report({ node, messageId: 'sortForExtremum' });
          return;
        }

        if (method === 'slice' && node.arguments.length === 2) {
          if (isZero(node.arguments[0]) && isOne(node.arguments[1])) {
            context.report({ node, messageId: 'sortForExtremum' });
          }
        }
      },
      MemberExpression(node) {
        if (!node.computed) return;
        if (node.property.type !== AST_NODE_TYPES.Literal) return;
        if (node.property.value !== 0) return;
        if (isSortCall(node.object)) {
          context.report({ node, messageId: 'sortForExtremum' });
        }
      },
    };
  },
});
