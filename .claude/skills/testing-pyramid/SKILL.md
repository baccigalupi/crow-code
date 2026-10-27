---
name: testing-pyramid
description: >-
  Decide which layer a test belongs in (unit, integration, e2e). Use when
  writing, moving, deleting, or planning tests, and before treating a removed
  test as a regression.
---

# Testing pyramid

Sources: Martin Fowler,
[TestPyramid](https://martinfowler.com/bliki/TestPyramid.html); Ham Vocke,
[The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html).

## The pyramid

Tests are grouped by granularity: many small, fast tests at the bottom and
progressively fewer broad tests above.

- **Unit tests:** one unit tested through its public interface. Slow or
  side-effecting dependencies are replaced with doubles. Tests check observable
  behavior, not implementation.
- **Middle layer (integration):** proves the parts work together. It covers
  only what lower levels can't.
- **End-to-end tests:** exercise the whole system. They give the most
  confidence but are slow and brittle, so keep only a few covering critical
  paths.

Rules:

1. **Push every test as low as possible.** Higher levels must not repeat
   lower-level edge cases.
2. **Delete high-level tests that duplicate lower-level coverage**, even costly
   ones.
3. **When a high-level test catches a bug,** write the missing unit test first.
4. **The ice-cream cone is the anti-pattern:** many broad tests and few unit
   tests.

## Layers in this repo

- **Unit:** a module whose dependencies are injected, so IO-related
  dependencies are mocked through `mockApplicationData`
  (`tests/support/mock-application-data.ts`: `command`, `fetch`, `chatClient`,
  `logger`, database). Detailed behavior lives here, including every parser and
  flag edge case.
- **Integration:** a class that coordinates other classes, tested with its
  collaborators left real.
  `tests/tools/git/read-only.test.ts` builds a real
  `GitReadOnly` with real subcommands and parsers; only `runCommand`
  is mocked. It proves coordination (dispatch, refusals, permissions, safe
  prefix), not parser detail.
- **E2E:** as close to end-to-end as bun:test allows, with real IO.
  `tests/tools/git/read-only.e2e.test.ts` runs real git against
  the fixture repo and asserts one system property: the repository is
  unchanged. It does not grow with each subcommand or parser feature.

## Placement

- A parse or format detail is a unit test.
- Collaborators running together for real is an integration test.
- Real IO proving a system property is an e2e test.

## Deletion

Removing a test that duplicates a lower layer or sits in the wrong layer is
correct pyramid maintenance. Tests the user deletes are final: they are never a
regression, never a reason to block a story, and never restored.
