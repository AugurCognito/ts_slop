import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

function isEmptyArray(node: TSESTree.Node | undefined): boolean {
  return node?.type === AST_NODE_TYPES.ArrayExpression && node.elements.length === 0;
}

function pushesToAcc(stmt: TSESTree.Statement, accName: string): boolean {
  if (stmt.type !== AST_NODE_TYPES.ExpressionStatement) return false;
  const expr = stmt.expression;
  if (expr.type !== AST_NODE_TYPES.CallExpression) return false;
  if (expr.callee.type !== AST_NODE_TYPES.MemberExpression) return false;
  if (expr.callee.property.type !== AST_NODE_TYPES.Identifier) return false;
  if (expr.callee.property.name !== 'push') return false;
  return expr.callee.object.type === AST_NODE_TYPES.Identifier && expr.callee.object.name === accName;
}

function returnsIdentifier(stmt: TSESTree.Statement, name: string): boolean {
  return (
    stmt.type === AST_NODE_TYPES.ReturnStatement &&
    stmt.argument?.type === AST_NODE_TYPES.Identifier &&
    stmt.argument.name === name
  );
}

function buildsArrayViaPush(fn: TSESTree.Node): boolean {
  if (
    fn.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
    fn.type !== AST_NODE_TYPES.FunctionExpression
  ) {
    return false;
  }
  if (fn.body.type !== AST_NODE_TYPES.BlockStatement) return false;
  if (fn.params.length === 0 || fn.params[0].type !== AST_NODE_TYPES.Identifier) return false;

  const accName = fn.params[0].name;
  const statements = fn.body.body;
  if (statements.length === 0) return false;

  const last = statements[statements.length - 1];
  if (!returnsIdentifier(last, accName)) return false;

  const body = statements.slice(0, -1);
  if (body.length === 0) return false;

  // Every remaining statement must be an unconditional push — a conditional
  // push is filtering, not mapping, and belongs to a different rule.
  return body.every((stmt) => pushesToAcc(stmt, accName));
}

export default createRule({
  name: 'no-reduce-as-map',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow building an array via `.reduce()` push-and-return — use `.map()` instead.',
    },
    messages: {
      reduceAsMap: 'Building an array via `.reduce()` — use `.map(...)` instead.',
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
        if (node.arguments.length !== 2) return;
        if (!isEmptyArray(node.arguments[1])) return;

        if (buildsArrayViaPush(node.arguments[0])) {
          context.report({ node, messageId: 'reduceAsMap' });
        }
      },
    };
  },
});
