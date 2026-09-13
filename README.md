# crow-code

Task oriented coding agent.

## Setup

```bash
npm install
npm test
```

## TDD

This repo follows strict test-driven development: write the failing test first, watch it fail, write minimal code to pass, then refactor.

```bash
# New feature workflow
1. Write the failing test in tests/
2. npm test   # watch it fail (RED)
3. Implement in src/
4. npm test   # watch it pass (GREEN)
5. Refactor, keep tests green
```
