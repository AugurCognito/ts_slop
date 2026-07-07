import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

function bodyUsesConcatOrTemplate(
  body: TSESTree.Node,
  accName: string,
): boolean {
  if (body.type === AST_NODE_TYPES.BinaryExpression && body.operator === '+') {
    if (
      (body.left.type === AST_NODE_TYPES.Identifier && body.left.name === accName) ||
      (body.right.type === AST_NODE_TYPES.Identifier && body.right.name === accName)
    ) {
      return true;
    }
  }
  if (body.type === AST_NODE_TYPES.TemplateLiteral) {
    return body.expressions.some(
      (e) => e.type === AST_NODE_TYPES.Identifier && e.name === accName,
    );
  }
  return false;
}

export default createRule({
  name: 'no-string-concat-in-reduce',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow string concatenation inside `.reduce()` — use `.join()` or build an array instead.',
    },
    messages: {
      stringConcat:
        'String concatenation in `.reduce()` is O(n²). Use `.map().join()` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (node.callee.property.type !== AST_NODE_TYPES.Identifier) return;
        if (node.callee.property.name !== 'reduce') return;
        if (node.arguments.length < 2) return;

        const init = node.arguments[1];
        const isStringInit =
          (init.type === AST_NODE_TYPES.Literal && typeof init.value === 'string') ||
          init.type === AST_NODE_TYPES.TemplateLiteral;
        if (!isStringInit) return;

        const callback = node.arguments[0];
        if (
          callback.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
          callback.type !== AST_NODE_TYPES.FunctionExpression
        ) {
          return;
        }

        const params = callback.params;
        if (params.length < 2) return;

        const accParam = params[0];
        if (accParam.type !== AST_NODE_TYPES.Identifier) return;

        if (bodyUsesConcatOrTemplate(callback.body, accParam.name)) {
          context.report({ node, messageId: 'stringConcat' });
          return;
        }

        if (callback.body.type === AST_NODE_TYPES.BlockStatement) {
          for (const stmt of callback.body.body) {
            if (
              stmt.type === AST_NODE_TYPES.ReturnStatement &&
              stmt.argument &&
              bodyUsesConcatOrTemplate(stmt.argument, accParam.name)
            ) {
              context.report({ node, messageId: 'stringConcat' });
              return;
            }
          }
        }
      },
    };
  },
});
