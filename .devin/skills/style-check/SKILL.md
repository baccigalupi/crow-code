---
name: style-check
description: Run the automated style-check gate
allowed-tools:
  - exec
permissions:
  allow:
    - Exec(agents/style-check)
    - Exec(agents/style-check code)
    - Exec(agents/style-check tests)
    - Exec(agents/style-check code all)
    - Exec(agents/style-check tests all)
    - Exec(agents/style-check both all)
triggers:
  - user
  - model
---

Run `agents/style-check` to enforce the mechanical style and test conventions on
changed files.

Use `agents/style-check [code|tests|both] all` to audit every tracked file.
