# ts-slop

ESLint plugin that catches AI-generated code slop in TypeScript.

Type-aware rules for patterns that LLMs produce but experienced TypeScript
developers don't — log-and-swallow catches, `as any` escape hatches, narrator
comments, silent default returns, N+1 awaits in loops, and more.

Modeled on [ex_slop](https://github.com/elixir-vibe/ex_slop) (40 Credo checks
for Elixir). Where ex_slop integrates with Credo, ts-slop integrates with
ESLint flat config — one import, zero configuration.

## Status

**v0.0.x** — name-establishing release, API unstable. One working rule ships
today; 10–12 type-aware rules are coming in v0.1.0. See the roadmap below.

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

## Rules

| Rule | What it catches | Why ESLint/Biome miss it |
|------|----------------|-------------------------|
| `no-catch-log-continue` | `catch (e) { console.error(e); }` — logs but swallows | Built-in `no-empty` only catches empty blocks; this catches the *illusion* of handling |

## Roadmap (v0.1.0)

- `no-as-any` — `as any` type assertions without justification
- `no-await-query-in-map` — N+1 awaits inside `.map()` / `.forEach()` (smart about `Promise.all`)
- `no-default-fallback-catch` — catch returns a silent default (`""`, `0`, `false`, `null`)
- `no-narrator-comments` — "First, we validate the input" / "Here we fetch the user"
- `no-identity-passthrough` — `.map(x => x)`, `.filter(() => true)`
- `no-redundant-boolean-if` — `if (x) return true; else return false;`
- `no-sort-then-reverse` — `arr.sort().reverse()` instead of a comparator
- `no-string-concat-in-reduce` — string building via reduce instead of `.join()`
- `no-useless-try-rethrow` — `try { f() } catch (e) { throw e }`
- `no-ts-ignore-without-description` — bare `@ts-ignore` / `@ts-expect-error`

Each rule will ship with documented overlap analysis against
typescript-eslint and Biome recommended sets.

## License

[MIT](LICENSE)
