import tseslint from 'typescript-eslint';
import tsSlop from './dist/index.js';

export default tseslint.config(
  {
    files: ['src/**/*.ts'],
    extends: [tseslint.configs.base],
    ...tsSlop.configs.recommended,
  },
);
