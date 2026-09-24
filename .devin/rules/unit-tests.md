---
trigger: glob
globs: 'tests/**/*.test.ts'
description: 'Unit test conventions'
---

# Writing tests

Apply when creating or changing tests in this repo.

## Hard rules

1. When finished touching TypeScript files, run `agents/typecheck` and report
   the actual output. Do not claim TS is clean without running the typecheck
   gate.
2. Source-to-test placement is one-to-one: `src/<path>.ts` ↔
   `tests/<path>.test.ts` (same relative path under `src/` and `tests/`). One
   source file, one test file — no combining modules or splitting one module
   across multiple test files.
3. Only one top level describe per test file
4. When there is only one export for the module tested, use that for the top
   level describe name
5. When there are multiple exports, name the top level describe after the file
   name, not any one import
6. Use AAA formatting without comments. There should be a space between each of
   the A's to produce groupings
7. Only when there are three or more tests for the same heading should you
   create a nested describe.
8. Most test descriptions should be "when X, Y happens"
9. Don't extract Arrange into helpers without first getting user permissions.
   That bans helpers in a test/support or helpers in the test file itself.
10. Avoid putting arrange in beforeEach. Clearing fixture directories is the one
    exception.
11. Only mock dependents when it makes the tests clearer
12. Only test what logic is in the module, not what's in the dependencies.

## Examples

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
