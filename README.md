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
| `no-await-query-in-map` | `items.map(async x => await fetch(x))` — N+1 in disguise | No built-in; smart about `Promise.all` (doesn't fire inside it) |

### Suggestions (code quality)

| Rule | What it catches | Why ESLint/Biome miss it |
|------|----------------|-------------------------|
| `no-as-any` | `as any` and `as unknown as T` double assertions | Biome's `noExplicitAny` covers declarations, not assertion escape hatches |
| `no-narrator-comments` | `// First, we validate the input` — step-by-step narration | No linter inspects comment *content*; ERA only catches commented-out code |
| `no-ts-ignore-without-description` | Bare `@ts-ignore` / `@ts-expect-error` with no reason | `ban-ts-comment` exists but is often not configured to require descriptions |
| `no-redundant-boolean-if` | `if (x) return true; else return false;` | Biome's `noUselessElse` is different; this catches the boolean-specific pattern |
| `no-sort-then-reverse` | `.sort().reverse()` instead of a comparator | No built-in; O(n log n + n) vs O(n log n) |
| `no-string-concat-in-reduce` | String building via `.reduce((acc, x) => acc + x, "")` | No built-in; O(n²) vs `.join()` which is O(n) |
| `no-identity-passthrough` | `.map(x => x)` / `.filter(x => x)` — no-op callbacks | No built-in detects identity callbacks in array methods |
| `no-useless-try-rethrow` | `try { f() } catch (e) { throw e }` — redundant wrapper | `no-useless-catch` exists in ESLint but is not in recommended sets |

## License

[MIT](LICENSE)
