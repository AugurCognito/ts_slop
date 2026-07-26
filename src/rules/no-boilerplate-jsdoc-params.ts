import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/augurcognito/ts_slop/blob/main/docs/rules/${name}.md`,
);

const PARAM_LINE_PATTERN =
  /^\s*\*?\s*@param\s+(?:\{[^}]*\}\s+)?\[?([\w.]+)(?:=[^\]]*)?\]?\s*(?:[-:]\s*)?(.*)$/;

function humanize(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[._]/g, ' ')
    .toLowerCase()
    .trim();
}

function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .trim()
    .replace(/^(the|a|an)\s+/, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default createRule({
  name: 'no-boilerplate-jsdoc-params',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow JSDoc @param descriptions that just restate the parameter name.',
    },
    messages: {
      boilerplateParam:
        'JSDoc `@param {{name}}` description just restates the name — explain a constraint or shape instead, or remove it.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (comment.type !== 'Block') continue;
          if (!comment.value.startsWith('*')) continue;

          for (const line of comment.value.split('\n')) {
            const match = PARAM_LINE_PATTERN.exec(line);
            if (!match) continue;

            const [, name, description] = match;
            if (!description.trim()) continue;

            if (normalizeDescription(description) === humanize(name)) {
              context.report({ loc: comment.loc, messageId: 'boilerplateParam', data: { name } });
            }
          }
        }
      },
    };
  },
});
