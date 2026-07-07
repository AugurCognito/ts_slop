import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

function isIdentityArrow(node: TSESTree.Node): boolean {
  if (node.type !== AST_NODE_TYPES.ArrowFunctionExpression) return false;
  if (node.params.length !== 1) return false;
  const param = node.params[0];
  if (param.type !== AST_NODE_TYPES.Identifier) return false;

  if (
    node.body.type === AST_NODE_TYPES.Identifier &&
    node.body.name === param.name
  ) {
    return true;
  }

  if (node.body.type === AST_NODE_TYPES.BlockStatement) {
    if (node.body.body.length === 1) {
      const stmt = node.body.body[0];
      if (
        stmt.type === AST_NODE_TYPES.ReturnStatement &&
        stmt.argument?.type === AST_NODE_TYPES.Identifier &&
        stmt.argument.name === param.name
      ) {
        return true;
      }
    }
  }
  return false;
}

const IDENTITY_METHODS = new Set(['map', 'flatMap', 'filter', 'forEach', 'every', 'some', 'find']);

export default createRule({
  name: 'no-identity-passthrough',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow identity callbacks in array methods like `.map(x => x)` — the call is a no-op.',
    },
    messages: {
      identity:
        '`.{{method}}(x => x)` is an identity passthrough — remove the call.',
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
        if (!IDENTITY_METHODS.has(method)) return;
        if (node.arguments.length !== 1) return;
        if (isIdentityArrow(node.arguments[0])) {
          context.report({
            node,
            messageId: 'identity',
            data: { method },
          });
        }
      },
    };
  },
});
