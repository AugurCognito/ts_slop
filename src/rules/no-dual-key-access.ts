import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
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
        if (node.left.type !== AST_NODE_TYPES.MemberExpression) return;
        if (node.right.type !== AST_NODE_TYPES.MemberExpression) return;

        const leftName = propertyName(node.left);
        const rightName = propertyName(node.right);
        if (!leftName || !rightName || leftName === rightName) return;
        if (normalize(leftName) !== normalize(rightName)) return;

        if (sourceCode.getText(node.left.object) !== sourceCode.getText(node.right.object)) return;

        context.report({
          node,
          messageId: 'dualKeyAccess',
          data: { left: leftName, right: rightName },
        });
      },
    };
  },
});
