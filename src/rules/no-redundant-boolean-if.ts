import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

function isReturnBoolean(node: TSESTree.Statement): boolean {
  return (
    node.type === AST_NODE_TYPES.ReturnStatement &&
    node.argument != null &&
    node.argument.type === AST_NODE_TYPES.Literal &&
    typeof node.argument.value === 'boolean'
  );
}

function unwrapBlock(node: TSESTree.Statement): TSESTree.Statement | undefined {
  if (node.type === AST_NODE_TYPES.BlockStatement) {
    return node.body.length === 1 ? node.body[0] : undefined;
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
        if (isReturnBoolean(consequent) && isReturnBoolean(alternate)) {
          context.report({ node, messageId: 'redundant' });
        }
      },
    };
  },
});
