import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

function isEmptyObject(node: TSESTree.Node | undefined): boolean {
  return node?.type === AST_NODE_TYPES.ObjectExpression && node.properties.length === 0;
}

function assignsToAccMember(stmt: TSESTree.Statement, accName: string): boolean {
  if (stmt.type !== AST_NODE_TYPES.ExpressionStatement) return false;
  const expr = stmt.expression;
  if (expr.type !== AST_NODE_TYPES.AssignmentExpression) return false;
  if (expr.operator !== '=') return false;
  if (expr.left.type !== AST_NODE_TYPES.MemberExpression) return false;
  return expr.left.object.type === AST_NODE_TYPES.Identifier && expr.left.object.name === accName;
}

function returnsIdentifier(stmt: TSESTree.Statement, name: string): boolean {
  return (
    stmt.type === AST_NODE_TYPES.ReturnStatement &&
    stmt.argument?.type === AST_NODE_TYPES.Identifier &&
    stmt.argument.name === name
  );
}

function buildsObjectViaMutation(fn: TSESTree.Node): boolean {
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

  return statements.slice(0, -1).some((stmt) => assignsToAccMember(stmt, accName));
}

export default createRule({
  name: 'no-reduce-object-build',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow building an object via `.reduce()` mutation — use `Object.fromEntries` or a `Map` instead.',
    },
    messages: {
      reduceObjectBuild:
        'Building an object via `.reduce()` — use `Object.fromEntries(...)` (or a `Map`) instead.',
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
        if (!isEmptyObject(node.arguments[1])) return;

        if (buildsObjectViaMutation(node.arguments[0])) {
          context.report({ node, messageId: 'reduceObjectBuild' });
        }
      },
    };
  },
});
