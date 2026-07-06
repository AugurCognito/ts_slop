import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

function isConsoleCall(node: TSESTree.Node): boolean {
  if (node.type !== AST_NODE_TYPES.ExpressionStatement) return false;
  const expr = node.expression;
  if (expr.type !== AST_NODE_TYPES.CallExpression) return false;
  const callee = expr.callee;
  if (callee.type !== AST_NODE_TYPES.MemberExpression) return false;
  return (
    callee.object.type === AST_NODE_TYPES.Identifier &&
    callee.object.name === 'console'
  );
}

function containsThrowOrReturn(statements: TSESTree.Statement[]): boolean {
  for (const stmt of statements) {
    if (
      stmt.type === AST_NODE_TYPES.ThrowStatement ||
      stmt.type === AST_NODE_TYPES.ReturnStatement
    ) {
      return true;
    }
    if (
      stmt.type === AST_NODE_TYPES.IfStatement ||
      stmt.type === AST_NODE_TYPES.BlockStatement
    ) {
      const nested =
        stmt.type === AST_NODE_TYPES.IfStatement
          ? [
              ...(stmt.consequent.type === AST_NODE_TYPES.BlockStatement
                ? stmt.consequent.body
                : [stmt.consequent]),
              ...(stmt.alternate
                ? stmt.alternate.type === AST_NODE_TYPES.BlockStatement
                  ? stmt.alternate.body
                  : [stmt.alternate]
                : []),
            ]
          : stmt.body;
      if (containsThrowOrReturn(nested)) return true;
    }
  }
  return false;
}

export default createRule({
  name: 'no-catch-log-continue',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Catch block that only logs swallows the error. Rethrow, handle meaningfully, or remove the try/catch.',
    },
    messages: {
      logOnly:
        'Catch block only logs the error. Rethrow, handle meaningfully, or remove the try/catch.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CatchClause(node) {
        const statements = node.body.body;
        if (statements.length === 0) return;
        if (containsThrowOrReturn(statements)) return;

        const hasConsoleCall = statements.some(isConsoleCall);
        if (!hasConsoleCall) return;

        const allLoggingOrEmpty = statements.every(
          (stmt) =>
            isConsoleCall(stmt) ||
            (stmt.type === AST_NODE_TYPES.ExpressionStatement &&
              stmt.expression.type === AST_NODE_TYPES.AwaitExpression),
        );

        if (allLoggingOrEmpty) {
          context.report({ node, messageId: 'logOnly' });
        }
      },
    };
  },
});
