---
trigger: glob
globs: 'src/**/*.ts'
description: 'Production TypeScript coding rules'
---

# Writing code

Apply when creating or changing production TypeScript in this repo.

## Hard rules

1. Types used in more than one location go in `src/types.ts`, not re-exported
   from a feature module
2. Module-level: `const foo = () => {}` — not `function foo() {}`
3. When the same data is passed between multiple functions in a module, use a
   class; class methods use normal `method() {}` syntax (not arrow properties)
4. No constructor parameter properties (`constructor(private x: T) {}`); create
   an explicit constructor with typed attributes
5. Conditionals stay flat (no nesting)
6. Ban `?:`, `??`, and `?.` — write explicit `if` / early return
7. No abbreviations in method or variables names
8. Either a full if/else flow or a guard clause for exception cases and then a
   return at the end of the function
9. No guard clauses except on the very first line. Setup before the guard is
   incorrect and can usually be converted to a private method called in the
   condition for the guard.
10. Prefer null object pattern over null checks
11. Do not nest functions inside functions
12. Functions/methods ≤ 7 lines of code
13. Do not throw unless the user asks or approves
14. Keep ABC complexity low: few assignments, branches, and calls per function;
    split work rather than stacking logic (no ABC linter — self-enforce)
15. Prefer array iterators (`map` / `filter` / `forEach` / `find` / etc.) over
    `while` / `for` for collection traversal
16. Use `while` for infinite loops (not `for (;;)`)
17. Split files by responsibility — one concern per module
18. No more than 100 LOC per file
19. Everything must be importable/buildable without also running side effects on
    import
20. CLI (and similar apps): many setup/component modules; only one `run` module
    pulls them in and actually executes
21. Avoid module singletons / long-lived module-level mutable state — get user
    approval before introducing one
22. We only write code for production real usage. Not imaginary stuff.
23. No SCREAMING_CASE names for consts (or anything else we own) — use camelCase
    (`goalSystemPrompt`, not `GOAL_SYSTEM_PROMPT`)
24. Omit explicit return types when TypeScript can infer them; add a return type
    only when inference fails or would be too wide (e.g. empty body, recursion,
    satisfying an interface, or narrowing a union)

## Examples

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
