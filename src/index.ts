import noCatchLogContinue from './rules/no-catch-log-continue.js';

const plugin = {
  meta: {
    name: 'ts-slop',
    version: '0.0.1',
  },
  rules: {
    'no-catch-log-continue': noCatchLogContinue,
  },
  configs: {} as Record<string, unknown>,
};

Object.assign(plugin.configs, {
  recommended: {
    plugins: {
      'ts-slop': plugin,
    },
    rules: {
      'ts-slop/no-catch-log-continue': 'warn',
    },
  },
});

export default plugin;
