import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

function isStringLiteral(node: { type: string; value?: unknown }): boolean {
  return node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string';
}

function isTemplateLiteral(node: { type: string }): boolean {
  return node.type === AST_NODE_TYPES.TemplateLiteral;
}

function bodyUsesConcatOrTemplate(
  body: { type: string; [key: string]: unknown },
  accName: string,
): boolean {
  if (body.type === AST_NODE_TYPES.BinaryExpression) {
    const bin = body as { type: string; operator: string; left: { type: string; name?: string }; right: { type: string; name?: string } };
    if (bin.operator === '+') {
      if (
        (bin.left.type === AST_NODE_TYPES.Identifier && bin.left.name === accName) ||
        (bin.right.type === AST_NODE_TYPES.Identifier && bin.right.name === accName)
      ) {
        return true;
      }
    }
  }
  if (body.type === AST_NODE_TYPES.TemplateLiteral) {
    const tl = body as { type: string; expressions: { type: string; name?: string }[] };
    return tl.expressions.some(
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
        if (!isStringLiteral(init) && !isTemplateLiteral(init)) return;

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

        const body = callback.body as unknown as { type: string; [key: string]: unknown };
        if (bodyUsesConcatOrTemplate(body, accParam.name)) {
          context.report({ node, messageId: 'stringConcat' });
          return;
        }

        if (body.type === AST_NODE_TYPES.BlockStatement) {
          const block = body as { type: string; body: { type: string; argument?: { type: string; [key: string]: unknown } }[] };
          for (const stmt of block.body) {
            if (
              stmt.type === AST_NODE_TYPES.ReturnStatement &&
              stmt.argument &&
              bodyUsesConcatOrTemplate(stmt.argument as { type: string; [key: string]: unknown }, accParam.name)
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
