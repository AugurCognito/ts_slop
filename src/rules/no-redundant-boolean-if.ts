import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

function isBooleanLiteral(node: { type: string; value?: unknown }): node is { type: string; value: boolean } {
  return node.type === AST_NODE_TYPES.Literal && typeof node.value === 'boolean';
}

function isReturnBoolean(node: { type: string; argument?: { type: string; value?: unknown } | null }): boolean {
  return (
    node.type === AST_NODE_TYPES.ReturnStatement &&
    node.argument != null &&
    isBooleanLiteral(node.argument)
  );
}

function unwrapBlock(node: { type: string }): unknown | undefined {
  if (node.type === AST_NODE_TYPES.BlockStatement) {
    const body = (node as unknown as { body: { type: string }[] }).body;
    return body.length === 1 ? body[0] : undefined;
  }
  return node;
}

export default createRule({
  name: 'no-redundant-boolean-if',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `if (x) return true; else return false;` — use the condition directly.',
    },
    messages: {
      redundant:
        'Redundant boolean if — return the condition directly (or its negation).',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      IfStatement(node) {
        if (!node.alternate) return;
        const consequent = unwrapBlock(node.consequent);
        const alternate = unwrapBlock(node.alternate);
        if (!consequent || !alternate) return;
        const c = consequent as { type: string; argument?: { type: string; value?: unknown } | null };
        const a = alternate as { type: string; argument?: { type: string; value?: unknown } | null };
        if (isReturnBoolean(c) && isReturnBoolean(a)) {
          context.report({ node, messageId: 'redundant' });
        }
      },
    };
  },
});
