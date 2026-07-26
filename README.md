# ts-slop

[![npm](https://img.shields.io/npm/v/ts-slop.svg)](https://www.npmjs.com/package/ts-slop)

ESLint plugin that catches AI-generated code slop in TypeScript.

Type-aware rules for patterns that LLMs produce but experienced TypeScript
developers don't — log-and-swallow catches, `as any` escape hatches, narrator
comments, silent default returns, N+1 awaits in loops, and more.

Modeled on [ex_slop](https://github.com/elixir-vibe/ex_slop) (40 Credo checks
for Elixir). Where ex_slop integrates with Credo, ts-slop integrates with
ESLint flat config — one import, zero configuration.

## Installation

```bash
npm install ts-slop --save-dev
```

## Usage

```js
// eslint.config.js
import tsSlop from 'ts-slop';

export default [
  tsSlop.configs.recommended,
  // ... your other configs
];
```

Or cherry-pick individual rules:

```js
import tsSlop from 'ts-slop';

export default [
  {
    plugins: { 'ts-slop': tsSlop },
    rules: {
      'ts-slop/no-catch-log-continue': 'warn',
      'ts-slop/no-default-fallback-catch': 'error',
    },
  },
];
```

## Rules

### Warnings (error handling)

| Rule | What it catches | Why ESLint/Biome miss it |
|------|----------------|-------------------------|
| `no-catch-log-continue` | `catch (e) { console.error(e); }` — logs but swallows | `no-empty` only catches empty blocks, not the *illusion* of handling |
| `no-default-fallback-catch` | `catch (e) { return null; }` / `""` / `0` / `false` / `[]` / `{}` | No built-in rule checks what catch blocks *return* |
| `no-empty-catch` | `catch (e) {}` — swallows with not even a log | `no-empty` exists but ships off by default and doesn't call out *why* it's worse in a catch |
| `no-await-query-in-map` | `items.map(async x => await fetch(x))` — N+1 in disguise | No built-in; smart about `Promise.all` (doesn't fire inside it) |
| `no-dual-key-access` | `usage.input_tokens ?? usage.inputTokens` — checking two spellings of one field | No built-in; a sign the object shape was never normalized at the boundary |

### Suggestions (code quality)

| Rule | What it catches | Why ESLint/Biome miss it |
|------|----------------|-------------------------|
| `no-as-any` | `as any` and `as unknown as T` double assertions | Biome's `noExplicitAny` covers declarations, not assertion escape hatches |
| `no-narrator-comments` | `// First, we validate the input` — step-by-step narration | No linter inspects comment *content*; ERA only catches commented-out code |
| `no-boilerplate-jsdoc-params` | `@param userId - The user id` — description just restates the name | No linter checks JSDoc *content* against the parameter it documents |
| `no-ts-ignore-without-description` | Bare `@ts-ignore` / `@ts-expect-error` with no reason | `ban-ts-comment` exists but is often not configured to require descriptions |
| `no-redundant-boolean-if` | `if (x) return true; else return false;` | Biome's `noUselessElse` is different; this catches the boolean-specific pattern |
| `no-sort-then-reverse` | `.sort().reverse()` instead of a comparator | No built-in; O(n log n + n) vs O(n log n) |
| `no-sort-for-extremum` | `.sort().pop()` / `.sort()[0]` / `.sort().slice(0, 1)` instead of `Math.min`/`Math.max` | No built-in; sorts the whole array to read one element |
| `no-string-concat-in-reduce` | String building via `.reduce((acc, x) => acc + x, "")` | No built-in; O(n²) vs `.join()` which is O(n) |
| `no-identity-passthrough` | `.map(x => x)` / `.filter(x => x)` — no-op callbacks | No built-in detects identity callbacks in array methods |
| `no-useless-try-rethrow` | `try { f() } catch (e) { throw e }` — redundant wrapper | `no-useless-catch` exists in ESLint but is not in recommended sets |
| `no-flatmap-filter` | `.flatMap(x => cond ? [x] : [])` instead of `.filter(x => cond)` | No built-in detects singleton/empty-array flatMap masquerading as filter |
| `no-reduce-object-build` | `.reduce((acc, x) => { acc[x.id] = x; return acc }, {})` instead of `Object.fromEntries` | No built-in detects mutation-based object building via `.reduce` |
| `no-reduce-as-map` | `.reduce((acc, x) => { acc.push(f(x)); return acc }, [])` instead of `.map` | No built-in detects push-and-return `.reduce` calls that are really `.map` |
| `no-double-slice` | `.slice(offset).slice(0, limit)` instead of `.slice(offset, offset + limit)` | No built-in; two-pass slicing where one range would do |
| `no-non-null-assertion-chain` | `foo!.bar!.baz!` — multiple non-null assertions chained | `no-non-null-assertion` bans *all* `!`; this targets the compounding-risk chain specifically |

## License

[MIT](LICENSE)
