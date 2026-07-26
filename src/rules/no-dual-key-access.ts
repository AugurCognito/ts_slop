import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/augurcognito/ts_slop/blob/main/README.md#rules',
);

function propertyName(node: TSESTree.MemberExpression): string | null {
  if (!node.computed) {
    return node.property.type === AST_NODE_TYPES.Identifier ? node.property.name : null;
  }
  return node.property.type === AST_NODE_TYPES.Literal && typeof node.property.value === 'string'
    ? node.property.value
    : null;
}

function normalize(name: string): string {
  return name.replace(/_/g, '').toLowerCase();
}

function unwrapChain(node: TSESTree.Node): TSESTree.Node {
  return node.type === AST_NODE_TYPES.ChainExpression ? node.expression : node;
}

export default createRule({
  name: 'no-dual-key-access',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow falling back between snake_case and camelCase spellings of the same field on the same object.',
    },
    messages: {
      dualKeyAccess:
        'Falling back between `{{left}}` and `{{right}}` — same field, two spellings. Normalize the object shape once instead of checking both.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;
    return {
      LogicalExpression(node) {
        if (node.operator !== '??' && node.operator !== '||') return;
        const left = unwrapChain(node.left);
        const right = unwrapChain(node.right);
        if (left.type !== AST_NODE_TYPES.MemberExpression) return;
        if (right.type !== AST_NODE_TYPES.MemberExpression) return;

        const leftName = propertyName(left);
        const rightName = propertyName(right);
        if (!leftName || !rightName || leftName === rightName) return;
        if (normalize(leftName) !== normalize(rightName)) return;

        // A call expression as the base object (e.g. `getUsage()?.input_tokens`)
        // may not be referentially the same call on both sides even when the
        // source text matches — skip rather than risk a false positive from a
        // side-effecting call being read as pure.
        if (
          left.object.type === AST_NODE_TYPES.CallExpression ||
          right.object.type === AST_NODE_TYPES.CallExpression
        ) {
          return;
        }

        if (sourceCode.getText(left.object) !== sourceCode.getText(right.object)) return;

        context.report({
          node,
          messageId: 'dualKeyAccess',
          data: { left: leftName, right: rightName },
        });
      },
    };
  },
});
