---
name: planning
description: Create and revise implementation plans with immutable goals, verified research, explicit assumptions and decisions, strict TDD, and regression protection
allowed-tools:
  - read
  - grep
  - glob
  - exec
  - mcp__codebase-memory-mcp__*
triggers:
  - user
  - model
---

# Planning

Use this workflow whenever creating, researching, or revising an implementation
plan.

## Interaction rule

Do not ask planning questions in chat. Put every uncertainty, ambiguity, missing
fact, and question-shaped item in the plan's Assumptions table, then investigate
it with available tools. If only the user can resolve an item, leave it
explicitly unresolved in the table with the consequence of each plausible
answer; do not silently choose one. Do not ask to implement the plan. You are
just to focus on the plan, and won't do implemantion.

## Worktree

Every plan is executed in a dedicated git worktree, never on the main checkout.
Creating the worktree is part of planning:

1. After `bd create`/`bd update <id> --claim`, run
   `git worktree add .worktrees/<name> -b <branch>` from the repo root, with
   `<name>`/`<branch>` derived from the Beads issue or feature name.
   `.worktrees/` is gitignored and excluded from `deno.json` tasks.
2. Record the worktree path and branch in the plan's metadata. All file paths,
   exec working directories, and verification commands in the plan are relative
   to the worktree, not the main checkout.
3. The worktree branch is rebased onto `main` only after explicit user approval.
   After `agents/pre-commit` passes, request approval to rebase; never rebase,
   merge, or fast-forward onto `main` unprompted.
4. Once the work has landed (or is abandoned), remove the worktree with
   `git worktree remove .worktrees/<name>`.

## Required plan structure

After the plan title and any generated metadata, use these sections in this
order.

### Goal

This is the plan's stable anchor and must be the first content section.

- If a Beads issue was provided, quote its complete contents verbatim.
- Otherwise, quote the user's complete prompt verbatim.
- Add a concise outcome statement below the quote without replacing or
  paraphrasing the source text.
- Never edit, reinterpret, narrow, or expand this section during research or
  revision unless the user says the goal is incorrect or explicitly changes it.
- Resolve scope discoveries in Assumptions and Decisions, not by drifting the
  Goal.

### Verified research

Begin research with the codebase-memory-mcp graph — it is the first resort, not
a fallback:

1. `list_projects`/`index_status` to confirm the index is live and fresh;
   `get_architecture` to orient.
2. `search_graph` (`name_pattern` for symbols, `semantic_query` for
   natural-language discovery) on the project that owns the code:
   `Users-kane-Projects-rho-crow-code` for this repo, `exotui`/`deno`/
   `deno-std` for dependency APIs (see AGENTS.md "Dependency lookup").
3. `trace_path` for callers/callees, `get_code_snippet` for source — pass the
   exact `qn` returned by `search_graph`.
4. `check_index_coverage` on every path the research cites; read source directly
   for reported gaps.
5. Use grep, glob, or file search only for literals and non-code files.

Record only facts verified from source code, tests, configuration,
documentation, issue state, command output, or the indexed graphs. Replace the
former `Existing structure` section with this name. Include concrete paths,
qualified symbols, call relationships, constraints, current behavior, and
relevant coverage limitations. Distinguish verified facts from inferences;
inferences belong in Assumptions.

### Assumptions

Use a table:

| ID | Assumption / unknown | Why it matters |
| -- | -------------------- | -------------- |

Rules:

- An assumption is only an assumption if it is undecided and requires a user
  decision
- Number assumptions sequentially as `A1`, `A2`, and so on; never use bare
  numbers or unnumbered rows.
- Keep an assumption's ID stable throughout plan revisions and never renumber
  later assumptions after moving one.
- Add every unknown or question here instead of asking it in chat.
- Do not leave a verified or resolved item in this table.

### Decisions

Move assumptions here once evidence verifies or refutes them and the
implementation consequence is resolved. Give each decision the matching numeric
ID: resolving `A1` creates `D1`, resolving `A2` creates `D2`, and so on. State
the originating assumption ID, evidence, and resulting scope or implementation
choice. Decisions made directly from an explicit user instruction may use the
next unused `D` number and must identify the instruction rather than inventing a
corresponding assumption. Preserve superseded decisions with their replacement
noted when revision history matters. Do not present an unresolved assumption as
a decision.

### Implementation steps (TDD)

Every production behavior change must follow real red-green-refactor TDD:

1. Add or change the smallest behavior-focused test first.
2. Run that test and record the expected failing assertion or behavior. A
   missing module, compile error, placeholder failure, or test that already
   passes is not a valid red when a behavioral red can be written.
3. Add the minimum production code that makes that test pass.
4. Run the focused test and record the expected green result.
5. Refactor only while green, then rerun the focused tests.
6. Repeat this cycle for the next behavior; do not batch all tests before all
   implementation.
7. Run the affected suite and then the repository's required full gates.

Each implementation step must name the test file, production file, behavior
under test, red command/result, minimal implementation, and green
command/result. Test-only or documentation-only changes must explain why
production TDD is not applicable.

### Regression

List behavior that must not change and the exact existing tests or verification
that protect it. Include:

- preserved user-visible behavior;
- preserved integrations, data formats, interfaces, and side effects;
- tests expected to remain unchanged and passing;
- the complete allowed test diff, when knowable;
- explicit out-of-scope behavior whose accidental change would indicate drift.

Do not use only a generic "run the full suite" entry. Name targeted regression
tests and what each proves.

### Files

List files expected to be added, modified, and intentionally untouched.

### Risks / considerations

Record remaining implementation risks, migration or compatibility concerns, and
unresolved `Requires user decision` items without changing the Goal.

### Verification

List focused red/green commands, affected suites, type checks, lint/format
checks, coverage, project-specific gates, and any necessary manual sanity
checks. Use actual commands discovered from repository instructions.

Verification must be the final section of the plan. Its final item must run the
repository's complete pre-commit gate after every other implementation and
verification step; for this repository, the command is `agents/pre-commit`.
Nothing may follow the pre-commit item in the plan.

## Implementation completion response

After `agents/pre-commit` passes, request user approval to rebase the worktree
branch onto `main` (see Worktree). Send the completion response only after that
approval is granted or declined.

After implementing a plan, the entire final chat response must use exactly one
of these forms, with no greeting, explanation, test summary, file list, or
follow-up text:

```text
Plan <plan-link> implemented
```

```text
Plan failed:
- <issue>
- <issue>
```

Use a clickable link to the implemented plan in place of `<plan-link>`. Use the
failure form if any planned work or the final pre-commit gate did not complete
successfully, and list every blocking or unresolved issue.

## Revision discipline

On every revision:

1. Keep Goal byte-for-byte stable unless the user corrects it.
2. Recheck Verified research against evidence.
3. Add newly discovered unknowns to Assumptions.
4. Move resolved assumptions to Decisions; do not duplicate them in both
   sections.
5. Update TDD steps and Regression together whenever scope changes.
6. Reject plan details that are unsupported by either verified research or an
   explicit assumption.
