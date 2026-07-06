import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

const DIRECTIVE_PATTERN = /^\/\/\s*@ts-(?:ignore|expect-error)(\s.*)?$/;

export default createRule({
  name: 'no-ts-ignore-without-description',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require a description after @ts-ignore and @ts-expect-error directives.',
    },
    messages: {
      missingDescription:
        'Add a description explaining WHY this directive is needed: `@ts-{{directive}} — reason`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (comment.type !== 'Line') continue;
          const text = `//${comment.value}`;
          const match = DIRECTIVE_PATTERN.exec(text);
          if (!match) continue;

          const tail = match[1]?.trim() ?? '';
          if (tail === '' || tail === '—' || tail === '-') {
            const directive = text.includes('@ts-ignore') ? 'ignore' : 'expect-error';
            context.report({
              node: comment as unknown as TSESTree.Node,
              messageId: 'missingDescription',
              data: { directive },
            });
          }
        }
      },
    };
  },
});
