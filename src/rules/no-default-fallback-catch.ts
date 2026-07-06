import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

function isSilentDefault(node: TSESTree.Expression | null | undefined): boolean {
  if (!node) return false;

  if (node.type === AST_NODE_TYPES.Literal) {
    const val = node.value;
    return val === null || val === '' || val === 0 || val === false;
  }

  if (
    node.type === AST_NODE_TYPES.Identifier &&
    node.name === 'undefined'
  ) {
    return true;
  }

  if (node.type === AST_NODE_TYPES.ArrayExpression && node.elements.length === 0) {
    return true;
  }

  if (node.type === AST_NODE_TYPES.ObjectExpression && node.properties.length === 0) {
    return true;
  }

  if (node.type === AST_NODE_TYPES.NewExpression) {
    if (
      node.callee.type === AST_NODE_TYPES.Identifier &&
      node.callee.name === 'Map' &&
      node.arguments.length === 0
    ) {
      return true;
    }
  }

  return false;
}

export default createRule({
  name: 'no-default-fallback-catch',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow catch blocks that return a silent default value (null, undefined, "", 0, false, [], {}).',
    },
    messages: {
      silentDefault:
        'Catch returns a silent default — this hides real failures. Propagate or handle explicitly.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CatchClause(node) {
        for (const stmt of node.body.body) {
          if (
            stmt.type === AST_NODE_TYPES.ReturnStatement &&
            isSilentDefault(stmt.argument)
          ) {
            context.report({ node: stmt, messageId: 'silentDefault' });
          }
        }
      },
    };
  },
});
