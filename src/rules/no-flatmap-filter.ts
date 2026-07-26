import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

type ArrayShape = 'empty' | 'singleton' | null;

function shapeOf(node: TSESTree.Node): ArrayShape {
  if (node.type !== AST_NODE_TYPES.ArrayExpression) return null;
  if (node.elements.length === 0) return 'empty';
  if (node.elements.length === 1 && node.elements[0]?.type !== AST_NODE_TYPES.SpreadElement) {
    return 'singleton';
  }
  return null;
}

function isEmptySingletonPair(a: TSESTree.Node, b: TSESTree.Node): boolean {
  const shapeA = shapeOf(a);
  const shapeB = shapeOf(b);
  return (shapeA === 'empty' && shapeB === 'singleton') || (shapeA === 'singleton' && shapeB === 'empty');
}

function returnArgument(stmt: TSESTree.Statement): TSESTree.Expression | null {
  if (stmt.type === AST_NODE_TYPES.ReturnStatement) return stmt.argument ?? null;
  if (stmt.type === AST_NODE_TYPES.BlockStatement && stmt.body.length === 1) {
    return returnArgument(stmt.body[0]);
  }
  return null;
}

function bodyIsFilterInDisguise(fn: TSESTree.Node): boolean {
  if (
    fn.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
    fn.type !== AST_NODE_TYPES.FunctionExpression
  ) {
    return false;
  }

  if (fn.body.type !== AST_NODE_TYPES.BlockStatement) {
    return (
      fn.body.type === AST_NODE_TYPES.ConditionalExpression &&
      isEmptySingletonPair(fn.body.consequent, fn.body.alternate)
    );
  }

  const statements = fn.body.body;

  if (statements.length === 1 && statements[0].type === AST_NODE_TYPES.IfStatement) {
    const ifStmt = statements[0];
    if (!ifStmt.alternate) return false;
    const consequent = returnArgument(ifStmt.consequent);
    const alternate = returnArgument(ifStmt.alternate);
    if (!consequent || !alternate) return false;
    return isEmptySingletonPair(consequent, alternate);
  }

  if (statements.length === 2) {
    const [first, second] = statements;
    if (first.type !== AST_NODE_TYPES.IfStatement || first.alternate) return false;
    const alternate = returnArgument(second);
    if (!alternate) return false;
    const consequent = returnArgument(first.consequent);
    if (!consequent) return false;
    return isEmptySingletonPair(consequent, alternate);
  }

  return false;
}

export default createRule({
  name: 'no-flatmap-filter',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `.flatMap()` returning singleton/empty arrays to simulate filtering — use `.filter()` instead.',
    },
    messages: {
      flatMapFilter:
        '`.flatMap()` returning `[x]`/`[]` is `.filter()` in disguise — use `.filter(...)` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) return;
        if (node.callee.property.type !== AST_NODE_TYPES.Identifier) return;
        if (node.callee.property.name !== 'flatMap') return;
        if (node.arguments.length !== 1) return;

        if (bodyIsFilterInDisguise(node.arguments[0])) {
          context.report({ node, messageId: 'flatMapFilter' });
        }
      },
    };
  },
});
