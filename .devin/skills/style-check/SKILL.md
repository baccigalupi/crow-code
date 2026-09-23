---
name: style-check
description: Audit the current diff against the repo's code and test style checklists
allowed-tools:
  - read
  - grep
  - glob
  - exec
permissions:
  allow:
    - Exec(git diff)
    - Exec(git status)
triggers:
  - user
  - model
---

# Style check

Audit the current working-tree diff against the repo's style checklists.

1. Run `git status --short` to list changed files.
2. Run `git diff` and `git diff --staged` to gather the changed TypeScript.
3. For every changed file matching `src/**/*.ts`, check it against the "Writing
   code" self-check list below.
4. For every changed file matching `tests/**/*.test.ts`, check it against the
   "Writing tests" self-check list below.
5. Report each violation as a list item with a `file:line` reference and the
   rule violated. If there are no violations, say "No violations".

## Writing code self-check

- [ ] Shared types live in `src/types.ts`, not re-exported from feature modules
- [ ] Module-level functions are `const` arrows; class methods use `method() {}`
- [ ] Shared module data uses a class when passed between multiple functions
- [ ] Constructors use typed attributes + explicit assignment (no parameter
      properties)
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
- [ ] Return types omitted when inferable; explicit only when inference fails or
      would be too wide

## Writing tests self-check

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
