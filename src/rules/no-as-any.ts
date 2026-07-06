import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

export default createRule({
  name: 'no-as-any',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow `as any` and `as unknown as T` type assertions that bypass the type system.',
    },
    messages: {
      asAny: 'Type assertion `as any` bypasses the type system. Model the real type instead.',
      doubleAssertion:
        '`as unknown as T` is a double assertion escape hatch. Model the real type instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSAsExpression(node) {
        if (
          node.typeAnnotation.type === AST_NODE_TYPES.TSAnyKeyword
        ) {
          context.report({ node: node.typeAnnotation, messageId: 'asAny' });
          return;
        }

        if (
          node.expression.type === AST_NODE_TYPES.TSAsExpression &&
          node.expression.typeAnnotation.type === AST_NODE_TYPES.TSUnknownKeyword
        ) {
          context.report({ node, messageId: 'doubleAssertion' });
        }
      },
    };
  },
});
