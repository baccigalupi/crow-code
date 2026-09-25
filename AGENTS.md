# crow-code

This is a CLI based coding agent.

To understand the code use the MCP server: `codebase-memory-mcp`.

## Exec, scripts and tools

This application is locked down to prevent incorrect exec commands from running.
Devin config at `.devin/config.json` is the source of truth for allowed
commands.

Only the `agents/` and `dev/` scripts listed in `.devin/config.json` can be run.
Never create scripts there to try to circumvent permissions.

### Common commands

- Tests: `dev/test`
- Lint: `dev/lint`
- Coverage: `agents/coverage-report`
- Deno formatting: `agents/format-check`
- TS check: `agents/typecheck`
- Full gate (format, lint, typecheck, tests, coverage): `agents/pre-commit`

### Gates

- Run `/style-check` before finishing TypeScript changes.
- When finished touching TypeScript files, run `agents/typecheck` and report the
  actual output.

## Git rules

- NEVER commit, stage, or push unless the user explicitly asks
- `git push` is denied to the agent by the exec allowlist
- No `$(...)` or backtick substitution in commit messages. Plain `-m 'text'` or
  a quoted heredoc (`<<'EOF'`) is fine.
- When asked to commit, stage everything `git status` shows — modified and
  untracked — unless the user says to commit only specific work.

## Planning

- Invoke `/planning` whenever creating, researching, or revising a plan.
- Never ask planning questions in chat; record all unknowns in the plan's
  Assumptions table and resolve them through research or mark them as requiring
  a user decision.

## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full
workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Before starting a plan (not a session), `bd create` an issue for it and
  `bd update <id> --claim`
- Close an issue when the user confirms the work is done: `bd close <id>`
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files
- `.beads/*.jsonl` is tracked state — always stage it with the work it records.
  Never leave it behind as "unrelated"
- A rejected or canceled tool call is not a stopping condition — continue
  permitted work (retry canceled siblings individually) without reporting blocks
  to the user.
- Never batch a verification command (dev/test, agents/typecheck) in the same
  parallel block as calls that may be rejected — one rejection cancels the rest.
