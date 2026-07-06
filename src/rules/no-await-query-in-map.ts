import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

const ITERATION_METHODS = new Set(['map', 'flatMap', 'forEach', 'filter', 'some', 'every', 'find']);
const BATCHING_METHODS = new Set(['all', 'allSettled', 'race', 'any']);

function isInsidePromiseBatch(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node.parent;
  while (current) {
    if (
      current.type === AST_NODE_TYPES.CallExpression &&
      current.callee.type === AST_NODE_TYPES.MemberExpression &&
      current.callee.object.type === AST_NODE_TYPES.Identifier &&
      current.callee.object.name === 'Promise' &&
      current.callee.property.type === AST_NODE_TYPES.Identifier &&
      BATCHING_METHODS.has(current.callee.property.name)
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function containsAwait(node: TSESTree.Node): boolean {
  if (node.type === AST_NODE_TYPES.AwaitExpression) return true;

  for (const key of Object.keys(node)) {
    if (key === 'parent') continue;
    const child = (node as unknown as Record<string, unknown>)[key];
    if (child && typeof child === 'object') {
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === 'object' && 'type' in item && containsAwait(item as TSESTree.Node)) {
            return true;
          }
        }
      } else if ('type' in child) {
        const childNode = child as TSESTree.Node;
        if (
          childNode.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          childNode.type === AST_NODE_TYPES.FunctionExpression ||
          childNode.type === AST_NODE_TYPES.FunctionDeclaration
        ) {
          continue;
        }
        if (containsAwait(childNode)) return true;
      }
    }
  }
  return false;
}

export default createRule({
  name: 'no-await-query-in-map',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow awaited calls inside array iteration methods — batch with Promise.all or use a for-loop.',
    },
    messages: {
      awaitInMap:
        'Awaited call inside `.{{method}}()` is an N+1 in disguise. Batch with `Promise.all` or use a sequential loop.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (node.callee.property.type !== AST_NODE_TYPES.Identifier) return;
        const method = node.callee.property.name;
        if (!ITERATION_METHODS.has(method)) return;
        if (node.arguments.length === 0) return;

        const callback = node.arguments[0];
        if (
          callback.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
          callback.type !== AST_NODE_TYPES.FunctionExpression
        ) {
          return;
        }

        if (!callback.async) return;
        if (!containsAwait(callback.body)) return;
        if (isInsidePromiseBatch(node)) return;

        context.report({
          node,
          messageId: 'awaitInMap',
          data: { method },
        });
      },
    };
  },
});
