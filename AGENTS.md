# crow-code — coding and testing rules

Project quality rules for this repo. Follow these when writing or changing
production TypeScript (`src/`) and tests (`tests/`). Pulled from the
haruspex project's rules and adapted for Hermes.

## Writing code

Apply when creating or changing production TypeScript in this repo.

### Hard rules

1. Types used in more than one location go in `src/types.ts`, not re-exported from a feature module
2. Module-level: `const foo = () => {}` — not `function foo() {}`
3. When the same data is passed between multiple functions in a module, use a class; class methods use normal `method() {}` syntax (not arrow properties)
4. No constructor parameter properties (`constructor(private x: T) {}`); create an explicit constructor with typed attributes
5. Conditionals stay flat (no nesting)
6. Ban `?:`, `??`, and `?.` — write explicit `if` / early return
7. No abbreviations in method or variables names
8. Either a full if/else flow or a guard clause for exception cases and then a return at the end of the function
9. No guard clauses except on the very first line. Setup before the guard is incorrect and can usually be converted to a private method called in the condition for the guard.
10. Prefer null object pattern over null checks
11. Do not nest functions inside functions
12. Functions/methods ≤ 7 lines of code
13. Do not throw unless the user asks or approves
14. Keep ABC complexity low: few assignments, branches, and calls per function; split work rather than stacking logic (no ABC linter — self-enforce)
15. Prefer array iterators (`map` / `filter` / `forEach` / `find` / etc.) over `while` / `for` for collection traversal
16. Use `while` for infinite loops (not `for (;;)`)
17. Split files by responsibility — one concern per module
18. No more than 100 LOC per file
19. Everything must be importable/buildable without also running side effects on import
20. CLI (and similar apps): many setup/component modules; only one `run` module pulls them in and actually executes
21. Avoid module singletons / long-lived module-level mutable state — get user approval before introducing one
22. We only write code for production real usage. Not imaginary stuff.
23. No SCREAMING_CASE names for consts (or anything else we own) — use camelCase (`goalSystemPrompt`, not `GOAL_SYSTEM_PROMPT`)
24. Omit explicit return types when TypeScript can infer them; add a return type only when inference fails or would be too wide (e.g. empty body, recursion, satisfying an interface, or narrowing a union)

### Examples

```ts
// Shared types — used by more than one module
// src/types.ts
export type Goal = { text: string }

// camelCase consts (no SCREAMING_CASE)
export const goalSystemPrompt = `You extract high-level goals...`

// Arrow vs function
const parseLine = (line: string) => {
  return line.trim()
}

// Class for shared module state — explicit constructor with typed attributes
class Session {
  private lines: string[]

  constructor(lines: string[]) {
    this.lines = lines
  }

  first() {
    if (this.lines.length === 0) {
      return ''
    }

    return this.lines[0]
  }
}

// Flat guards vs nested / ?: / ?? / ?.
const label = (goal: Goal | null) => {
  if (goal === null) {
    return ''
  }

  return goal.text
}

// Return types — infer when possible
const parseArguments = (argumentsList: string[]) => {
  return argumentsList.slice(2).join(' ').trim()
}

// No abbreviations
const parseArguments2 = (argumentsList: string[]) => {
  return argumentsList.slice(2).join(' ').trim()
}

// No nested functions; ≤ 7 lines; iterators over for/while
const trim = (s: string) => s.trim()
const parseLines = (raw: string) => {
  return raw.split('\n').map(trim)
}

// while only for infinite loops
while (true) {
  const line = readLine()
  if (line === null) {
    break
  }
  handle(line)
}
```

### Self-check

- [ ] Shared types live in `src/types.ts`, not re-exported from feature modules
- [ ] Module-level functions are `const` arrows; class methods use `method() {}`
- [ ] Shared module data uses a class when passed between multiple functions
- [ ] Constructors use typed attributes + explicit assignment (no parameter properties)
- [ ] Conditionals are flat; no `?:` / `??` / `?.`
- [ ] No abbreviations in method or variable names
- [ ] Full if/else, or guard on the very first line then return at the end
- [ ] Null object preferred over null checks
- [ ] No nested functions; each function/method ≤ 7 lines
- [ ] No throws unless user asked or approved
- [ ] ABC kept low (few assignments, branches, calls)
- [ ] Collections use iterators; `while` only for infinite loops
- [ ] Files split by responsibility; each file ≤ 100 LOC
- [ ] Imports have no run side effects; only a `run` module executes
- [ ] No module singletons / long-lived module state without user approval
- [ ] Only production-real paths (no imaginary / unreachable defensive code)
- [ ] No SCREAMING_CASE names — camelCase for consts we own
- [ ] Return types omitted when inferable; explicit only when inference fails or would be too wide

## Writing tests

Apply when creating or changing tests in this repo.

### Hard rules

1. Source-to-test placement is one-to-one: `src/<path>.ts` ↔ `tests/<path>.test.ts` (same relative path under `src/` and `tests/`). One source file, one test file — no combining modules or splitting one module across multiple test files.
2. Only one top level describe per test file
3. When there is only one export for the module tested, use that for the top level describe name
4. When there are multiple exports, name the top level describe after the file name, not any one import
5. Use AAA formatting without comments. There should be a space between each of the A's to produce groupings
6. Only when there are three or more tests for the same heading should you create a nested describe.
7. Most test descriptions should be "when X, Y happens"
8. Don't extract Arrange into helpers without first getting user permissions. That bans helpers in a test/support or helpers in the test file itself.
9. Avoid putting arrange in beforeEach
10. Only mock dependents when it makes the tests clearer
11. Only test what logic is in the module, not what's in the dependencies.

### Examples

```ts
// File placement
// Good
src/cli.ts          → tests/cli.test.ts
src/foo/bar.ts      → tests/foo/bar.test.ts

// Top-level describe name
describe('extractGoals', () => { ... }) // single export
describe('cli', () => { ... })          // multiple exports (cli.test.ts → "cli")

// AAA (blank lines, no labels)
it('when input is empty, returns []', () => {
  const input = ''

  const result = extractGoals(input)

  expect(result).toEqual([])
})

// Nested describe only at ≥3
describe('cli', () => {
  describe('when --json', () => {
    it('prints an array', () => { ... })
    it('omits prose', () => { ... })
    it('exits 0', () => { ... })
  })
})
```

### Self-check

- [ ] Test path mirrors source: `src/<path>.ts` ↔ `tests/<path>.test.ts`
- [ ] Exactly one top-level `describe`
- [ ] Describe name follows single-export vs file-stem rule
- [ ] Blank line between Arrange / Act / Assert; no `// Arrange` comments
- [ ] Nested `describe` only when ≥3 `it`s share a heading
- [ ] Descriptions prefer `when X, Y happens`
- [ ] No Arrange helpers without user permission
- [ ] No arrange-in-`beforeEach`
- [ ] Mock only when it makes tests clearer
- [ ] Assert module logic only, not dependency internals

## E2e tests

Applies to specs under `tests/e2e/**/*`.

### Shape (not AAA)

E2e specs do **not** use the unit-test AAA layout. Each `it` is three blocks separated by blank lines:

1. **Setup** — start mocks and spawn the session
2. **Drive** — `write` / `waitFor` (and `expect` only when asserting something `waitFor` cannot express)
3. **Teardown** — kill the session, close the mock

- No `try` / `catch` / `finally`
- Keep mock replies visible in the test; do not bury mock start inside the spawn helper
- Prefer `waitFor` for positive UI presence; reserve `expect` for absences or regex checks

### Timeouts

- Never pass a third-argument timeout to `it` / `test`.
- Rely on Vitest's default test timeout and on `waitFor`'s own per-call timeout.
- Do not raise timeouts "because e2e is slow" or "to be safe."
- Only change a timeout when a real failure shows the default is too low, and then raise the specific `waitFor` that timed out — not the whole test — with a one-line comment citing the failure evidence.
