import noAsAny from './rules/no-as-any.js';
import noAwaitQueryInMap from './rules/no-await-query-in-map.js';
import noBoilerplateJsdocParams from './rules/no-boilerplate-jsdoc-params.js';
import noCatchLogContinue from './rules/no-catch-log-continue.js';
import noDefaultFallbackCatch from './rules/no-default-fallback-catch.js';
import noDoubleSlice from './rules/no-double-slice.js';
import noDualKeyAccess from './rules/no-dual-key-access.js';
import noEmptyCatch from './rules/no-empty-catch.js';
import noFlatmapFilter from './rules/no-flatmap-filter.js';
import noIdentityPassthrough from './rules/no-identity-passthrough.js';
import noNarratorComments from './rules/no-narrator-comments.js';
import noNonNullAssertionChain from './rules/no-non-null-assertion-chain.js';
import noReduceAsMap from './rules/no-reduce-as-map.js';
import noReduceObjectBuild from './rules/no-reduce-object-build.js';
import noRedundantBooleanIf from './rules/no-redundant-boolean-if.js';
import noSortForExtremum from './rules/no-sort-for-extremum.js';
import noSortThenReverse from './rules/no-sort-then-reverse.js';
import noStringConcatInReduce from './rules/no-string-concat-in-reduce.js';
import noTsIgnoreWithoutDescription from './rules/no-ts-ignore-without-description.js';
import noUselessTryRethrow from './rules/no-useless-try-rethrow.js';

const rules = {
  'no-as-any': noAsAny,
  'no-await-query-in-map': noAwaitQueryInMap,
  'no-boilerplate-jsdoc-params': noBoilerplateJsdocParams,
  'no-catch-log-continue': noCatchLogContinue,
  'no-default-fallback-catch': noDefaultFallbackCatch,
  'no-double-slice': noDoubleSlice,
  'no-dual-key-access': noDualKeyAccess,
  'no-empty-catch': noEmptyCatch,
  'no-flatmap-filter': noFlatmapFilter,
  'no-identity-passthrough': noIdentityPassthrough,
  'no-narrator-comments': noNarratorComments,
  'no-non-null-assertion-chain': noNonNullAssertionChain,
  'no-reduce-as-map': noReduceAsMap,
  'no-reduce-object-build': noReduceObjectBuild,
  'no-redundant-boolean-if': noRedundantBooleanIf,
  'no-sort-for-extremum': noSortForExtremum,
  'no-sort-then-reverse': noSortThenReverse,
  'no-string-concat-in-reduce': noStringConcatInReduce,
  'no-ts-ignore-without-description': noTsIgnoreWithoutDescription,
  'no-useless-try-rethrow': noUselessTryRethrow,
};

const plugin = {
  meta: {
    name: 'ts-slop',
    version: '0.1.2',
  },
  rules,
  configs: {} as Record<string, unknown>,
};

const recommended = {
  plugins: {
    'ts-slop': plugin,
  },
  rules: {
    'ts-slop/no-as-any': 'error',
    'ts-slop/no-await-query-in-map': 'warn',
    'ts-slop/no-boilerplate-jsdoc-params': 'warn',
    'ts-slop/no-catch-log-continue': 'warn',
    'ts-slop/no-default-fallback-catch': 'warn',
    'ts-slop/no-double-slice': 'warn',
    'ts-slop/no-dual-key-access': 'warn',
    'ts-slop/no-empty-catch': 'warn',
    'ts-slop/no-flatmap-filter': 'warn',
    'ts-slop/no-identity-passthrough': 'warn',
    'ts-slop/no-narrator-comments': 'warn',
    'ts-slop/no-non-null-assertion-chain': 'warn',
    'ts-slop/no-reduce-as-map': 'warn',
    'ts-slop/no-reduce-object-build': 'warn',
    'ts-slop/no-redundant-boolean-if': 'warn',
    'ts-slop/no-sort-for-extremum': 'warn',
    'ts-slop/no-sort-then-reverse': 'warn',
    'ts-slop/no-string-concat-in-reduce': 'warn',
    'ts-slop/no-ts-ignore-without-description': 'warn',
    'ts-slop/no-useless-try-rethrow': 'warn',
  },
};

Object.assign(plugin.configs, { recommended });

export default plugin;
