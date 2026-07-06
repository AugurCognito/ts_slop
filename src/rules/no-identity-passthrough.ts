import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

function isIdentityArrow(node: { type: string; params?: unknown[]; body?: { type: string; name?: string } }): boolean {
  if (node.type !== AST_NODE_TYPES.ArrowFunctionExpression) return false;
  const arrow = node as { params: { type: string; name?: string }[]; body: { type: string; name?: string } };
  if (arrow.params.length !== 1) return false;
  const param = arrow.params[0];
  if (param.type !== AST_NODE_TYPES.Identifier) return false;

  if (
    arrow.body.type === AST_NODE_TYPES.Identifier &&
    arrow.body.name === param.name
  ) {
    return true;
  }

  if (arrow.body.type === AST_NODE_TYPES.BlockStatement) {
    const block = arrow.body as unknown as { body: { type: string; argument?: { type: string; name?: string } | null }[] };
    if (block.body.length === 1) {
      const stmt = block.body[0];
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
        if (isIdentityArrow(node.arguments[0] as { type: string; params?: unknown[]; body?: { type: string; name?: string } })) {
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
