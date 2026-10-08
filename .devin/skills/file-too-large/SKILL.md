---
name: file-too-large
description: Refactor a file or function that exceeds a size limit into clearer structure — the limit is a detector, not the goal
allowed-tools:
  - read
  - grep
  - glob
  - edit
  - exec
triggers:
  - user
  - model
---

# File too large

Use when `max-file-lines` or `max-function-lines` fires, or a file/method is
clearly doing too much.

## The real goal

Size limits exist to catch unclear structure. The file being too long is a
symptom; the disease is that it holds more than one idea, or that a concept is
unnamed. The goal of this work is **clarity and maintainability** — passing the
gate is a side effect of getting the structure right, not the objective.

A change that makes the gate green without improving the structure is a failure.

## Never do

- Removing line breaks, joining statements, or shortening names to save lines.
- Extracting arbitrary statement runs that share no responsibility or data —
  that produces functions named `doFirstHalf`/`doSecondHalf`, which is worse
  than the original.
- Moving code into a grab-bag `utils`/`helpers` module.
- Deleting blank lines, comments that explain behavior, or tests.

## How to find the extraction

Work through these in order; stop when a clean structure emerges.

1. **Inventory responsibilities.** List what the file/class actually does.
   Anything independent of the rest is an extraction candidate — move it to its
   own module with a name that says what it is, not where it came from.
2. **Find shared state and arguments.** Data passed between several methods, or
   fields that only a subset of methods touch, usually describes a missing
   class. Extract the cluster of data plus the methods that operate on it.
3. **Rename for clarity first.** Rename each method to honestly describe what it
   does before moving anything. Naming patterns then reveal the extraction: a
   group of methods all about the same concern wants to become that thing (a
   module or class); a method named `doAAndB` is two methods.
4. **Check the result reads better.** Each extracted unit should have a one-line
   purpose you can state without referring to the call site. If you cannot name
   it honestly, the cut is wrong — pick a different seam.

## Repo constraints

Extractions must satisfy the same style rules as everything else — run
`agents/style-check code changed` after editing. Notably:

- ≤ 7 non-blank lines per function/method body; guard clause on the first line.
- No module-level function declarations — use exported `const` arrows or
  classes.
- Types live only in `types.ts` files.
- New source files need a mirrored test file (`tests/<path>.test.ts`).

## Verification

- Behavior unchanged: `dev/test` passes.
- `agents/typecheck` passes.
- `agents/style-check code changed` passes.
- Self-check: is the result easier to understand than before? If the honest
  answer is "no, but it's under the limit," the work is not done.
