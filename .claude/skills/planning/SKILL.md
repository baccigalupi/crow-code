---
name: planning
description: >-
  Create and revise implementation plans with an immutable Goal, verified
  research, Open decisions/Decisions, strict TDD, and regression
  protection. Use whenever creating, researching, or revising an
  implementation plan — including every time EnterPlanMode is used, and
  before every ExitPlanMode call.
---

# Planning

Plans use this harness's tools and plan-mode mechanics
(`EnterPlanMode`/`ExitPlanMode`, `EnterWorktree`, the command gate in
`.claude/hooks/claude-command-gate.ts`).

## Interaction rule

Do not ask planning questions in chat. Do all research first, with available
tools, until the plan has no known unknowns: every fact, count, version,
behavior difference, and "does X work" question is answered by investigation and
recorded in Verified research. Never park unresearched work in the plan. Only
what the user must decide — a choice research cannot settle — goes in the Open
decisions table, with the consequence of each plausible answer; do not silently
pick one. Don't ask whether to implement the plan in chat text; the user starts
implementation when ready.

### Blocked research is not finished research

A lookup that was blocked or came back empty — a denied command, a tool you
lack, a subagent reporting "not found" or "couldn't access" — is an unanswered
question, not an answer. Before treating anything as unfindable, exhaust the
fallbacks and record what you tried:

- Read candidate paths directly (`Read` on a likely file, not only listing a
  directory); use `bd show`/`bd comments`, `git log`/`git grep`, and the other
  allowlisted commands.
- Resume the subagent (`SendMessage`) or launch another with a different
  approach and the exact paths or commands to try; never accept its "not found"
  unverified.
- If every fallback is exhausted, ask with `AskUserQuestion` for the missing
  input only (a file path, a name, access) — a request for input, not a
  decision row. Do not write the plan around the gap.

Your own tool limits are never a reason to move work to the user's Open
decisions table.

### Open decisions test

Before adding any row to Open decisions, ask: could a tool call or a reasonable
action answer this? If yes, it is research — do it and put the answer in
Verified research. A row is allowed only when the answer is the user's
preference, priority, or risk tolerance and no investigation could settle it.
"I could not find X", "I proposed Y, confirm?", and "scope A or scope B?" where
the issue text already settles scope, are not decisions.

## Planning responses

While planning, all work product goes into the plan file — never into code
files, worktrees, `.beads/`, or committed docs. The plan file path is the one
given in the `EnterPlanMode` system reminder for this session
(`/Users/kane/.claude/plans/<slug>.md`); outside of writing code the plan mode
guard enforces, it's the only file plan mode allows editing.

After writing or revising the plan, never paste or restate plan content in the
chat response — not the Goal quote, not a section, not a summary of what
changed. The chat response is the plan file's path and nothing else — no
greeting, no recap, no follow-up text. Give the path every time the plan file is
written or edited, not just the first time. `ExitPlanMode` is denied in
`.claude/settings.json`; never call it. End the turn with the plan file path, or
with `AskUserQuestion` — a genuine decision only the user can make (never "is
this plan okay?").

If the plan write itself failed (e.g. a blocked edit), say so in under two
sentences and name the failure — don't retry silently, per `compliant-answer`.

User feedback during planning is a plan revision: respond by editing the plan
file, not by acting on the feedback directly.

## Worktree setup

Every plan is executed in a dedicated worktree, never the main checkout. The
worktree does not exist during planning — record the intended values, create it
only when implementation starts:

1. In the plan, record the intended worktree name as planned — e.g.
   `Worktree: git-compare-tool (to be created)`. The name is a kebab-case phrase
   describing the work. Never the Beads issue ID, full or bare postfix
   (`crow-code-4vz.2`, `4vz`, `akj`) — an ID tells a reader nothing.
2. As the first step of implementation — never during planning — call
   `EnterWorktree({ name: "<kebab-case-work-description>" })`. This creates
   `.claude/worktrees/<name>` on a new branch and moves the session's cwd into
   it; no `git worktree add`, no `cd`, no `--config` flags (see the
   `correct-command` skill).
3. All subsequent file paths, `dev/*`/`agents/*` calls, and verification
   commands then target the worktree automatically.
4. Landing is the `land-tree` skill, run when the user asks.

## Beads issue

Like the worktree, the Beads issue does not exist during planning:

1. Record in the plan the issue title to create, or the provided issue ID when
   the user supplies one — e.g. `Beads: <title> (to be created)` or
   `Beads: crow-code-4vz.2`.
2. After `EnterWorktree` — never during planning, never from the main checkout —
   run `bd create` for the recorded title (unless the plan names an existing
   issue) and `bd update <id> --claim`, inside the worktree.
3. `.beads/*.jsonl` is tracked state — stage it with the implementation work it
   records.
4. Name issues in plan prose by title, or by full ID plus title. Never refer to
   an issue by a bare ID postfix.

## Required plan structure

After the plan title and any generated metadata, use these sections in this
order.

### Goal

Stable anchor, first content section.

- If a Beads issue was provided, quote its complete contents verbatim
  (`bd
  show <id>`).
- Otherwise, quote the user's complete prompt verbatim.
- Add a concise outcome statement below the quote without replacing or
  paraphrasing the source text.
- Never edit, reinterpret, narrow, or expand this section during research or
  revision unless the user says the goal is incorrect or explicitly changes it.
  Resolve scope discoveries in Open decisions/Decisions, not by drifting the
  Goal.

### Verified research

Codebase-memory-mcp graph first — it's the first resort, not a fallback:

1. `index_status`/`list_projects` to confirm the index is live;
   `get_architecture` to orient.
2. `search_graph` (`name_pattern` for symbols, `semantic_query` for
   natural-language discovery) on the project that owns the code — this repo's
   own project, or a dependency project per `AGENTS.md` § Dependency lookup.
   Treat that table, not memory, as the source of truth for which project covers
   what — it drifts (e.g. `CLAUDE.md` flags the `terminal-ui` dependency project
   checkout as stale since the TUI is actually built on Ink + React).
3. `trace_path` for callers/callees, `get_code_snippet` for source — use the
   exact `qn` `search_graph` returns.
4. `check_index_coverage` on every path the research cites; read source directly
   for reported gaps.
5. `Grep`/`Glob`/`Read` only for literals and non-code files.

Record only facts verified from source, tests, config, docs, issue state,
command output, or the indexed graphs. Include concrete paths, qualified
symbols, call relationships, constraints, current behavior, and coverage
limitations. Research is finished before the plan is written: run the commands,
read the packages, count the affected files, and compare behaviors rather than
listing them as things to check later. An inference that investigation could
confirm or refute is not allowed to stand — investigate it. "Verify at
implementation time" and "to be confirmed" are not acceptable plan content.

Named artifacts: when the issue, goal, or user prompt refers to a specific
artifact ("the mapping table in the plan", "the approved design", "the spec"),
locating and quoting it is a required research item. Never substitute your own
version of it and never write the plan with it missing. If it cannot be found
after the fallbacks in the Interaction rule, stop and ask for it.

Pre-write check: before writing or revising the plan, list every fact the plan
depends on and the source of each (file, command output, issue text). Any fact
marked "not found", "proposed by me", "assumed", or "inferred" blocks writing
the plan — go back and research it. Do not write the plan until every
dependency has a source.

### Open decisions

| ID | Decision needed from the user | Consequence of each plausible answer |
| -- | ----------------------------- | ------------------------------------ |

- Holds only decisions the user must make. Never unresearched work, unverified
  facts, guesses, or questions that investigation could answer.
- If a row is something you could look up, look it up and put the answer in
  Verified research instead.
- Number sequentially (`D1`, `D2`, …) in one numbering shared with Decisions;
  never renumber.
- A row exists only while the user's answer is outstanding. An empty table is
  fine and normal.

### Decisions

**Resolving an open decision** — do all three, in the same edit, whenever the
user answers (including answers given as feedback in chat):

1. Delete the whole `D<n>` row from Open decisions. Never leave it behind with
   "resolved", "decided", or strikethrough text.
2. Add `D<n>` here with the same number, stating the question, the user's
   answer, and the resulting scope/choice.
3. Before ending the turn, re-read the plan and confirm no ID appears in both
   Open decisions and Decisions. If one does, delete the Open decisions row.

A decision made directly from an explicit user instruction (not an open
decision) takes the next unused `D` number and must cite the instruction.
Choices fully settled by research are stated in Verified research or the steps,
not as Decisions pretending to be user-made. Preserve superseded decisions with
their replacement noted when revision history matters. Never present an
unanswered open decision as a decision.

### Implementation steps (TDD)

Step 0, in this order (see Worktree setup / Beads issue):

1. `EnterWorktree({ name: "<kebab-case-work-description>" })`.
2. `bd create` (unless the plan names an existing issue), then
   `bd update <id> --claim`.

Every subsequent step runs inside the worktree.

Every production behavior change follows real red-green-refactor TDD (same rule
as `CLAUDE.md` § TDD):

1. Add/change the smallest behavior-focused test first.
2. Run it (`dev/test tests/path/to/file.test.ts`); record the expected failing
   assertion or behavior. A missing module, compile error, placeholder failure,
   or already-passing test is not a valid red when a behavioral red can be
   written.
3. Add the minimum production code that makes it pass.
4. Rerun the focused test; record the expected green result.
5. Refactor only while green, then rerun the focused tests.
6. Repeat per behavior — don't batch all tests before all implementation.
7. Run the affected suite, then the repository's required full gates.

The heading is not the practice. Write the plan as a sequence of cycles, one
behavior per cycle, never one step that bundles several behaviors or swaps a
whole module. Each cycle is its own numbered step with these fields, all filled
in — a step missing any field is not a TDD step:

- **Behavior:** one sentence, observable from outside the code.
- **Test:** file, test name, and the literal assertion to write (input and
  expected value), so the red is predictable.
- **Red:** exact command and the exact failure expected — the assertion that
  fails and why, against the code as it exists at that point. If the test would
  pass or only fail to compile, rewrite the test or the cycle.
- **Green:** production file and the minimal change that satisfies only this
  test — not the final design.
- **Refactor:** what to clean while green, or "none".
- **Green command:** exact command and expected pass.

Rules for cycles:

- Order cycles so each red is possible: a later cycle's test depends only on
  earlier cycles' code. Stubbing a missing module to turn a compile error into
  an assertion failure is a prefatory part of the red, written in the cycle.
- Swapping a dependency or porting code is still TDD: first pin current behavior
  with a characterization test that passes on the old code (say so, that is the
  only legitimate already-green test), then one cycle per behavior that differs,
  each red against the new implementation.
- Mechanical edits with no behavior change (import renames) are not cycles.
  Group them in one separate step that names the existing tests which fail if
  the edit is wrong, and run them.
- Test-only or doc-only changes must explain why production TDD doesn't apply.
- After the last cycle, a step runs the affected suite, then the full gates.

### Regression

List behavior that must not change and the exact existing tests/verification
protecting it: preserved user-visible behavior; preserved integrations, data
formats, interfaces, side effects; tests expected to stay unchanged and passing;
the complete allowed test diff, when knowable; explicit out-of-scope behavior
whose accidental change would indicate drift. Not just "run the full suite" —
name targeted regression tests and what each proves.

### Files

List files expected to be added, modified, and intentionally untouched.

### Risks / considerations

Remaining implementation risks, migration/compatibility concerns, and unresolved
"requires user decision" items — without changing the Goal.

### Verification

List focused red/green commands, affected suites, `agents/typecheck`,
`agents/format-check`/`agents/style-check`, coverage
(`agents/check-coverage`/`agents/coverage-report`), and any necessary manual
sanity check. Use actual commands from `CLAUDE.md`/`AGENTS.md`, never invented
ones.

Verification is the final section of the plan. Its final item is always
`agents/pre-commit`, run after every other implementation and verification step.
Nothing follows it.

## Implementation narration

While executing the TDD steps, don't narrate routine mechanics in chat — a red
test, a lint/style-check/typecheck failure, and the fix that turns it green are
expected parts of every step, not status worth reporting as they happen. Make
the tool calls, fix what's red, move to the next step; stay silent in between.
The plan file's TDD steps already record each red/implementation/green — that's
where the trail lives, not the chat.

Speak up mid-implementation only for a genuine blocker: something only the user
can resolve (a new open decision, a destructive action needing confirmation,
work that contradicts the plan). Otherwise the next chat message is the
completion report.

## Implementation completion

Once every TDD step is green and `agents/pre-commit` passes, report plainly that
the plan is complete — don't recap which checks were run, don't mention any
failure encountered and fixed along the way (that's in the plan file, not the
chat). Landing is the `land-tree` skill, run when the user asks. Keep the
completion response to the result, not a recap, in under two sentences per
`compliant-answer`.

## Revision discipline

On every revision:

1. Keep Goal byte-for-byte stable unless the user corrects it.
2. Recheck Verified research against evidence.
3. Research newly discovered unknowns until answered and record them in Verified
   research; add to Open decisions only a decision the user must make.
4. For every open decision the user answered, resolve it per Decisions →
   Resolving an open decision: delete the Open decisions row, add the Decisions
   row with the same ID, then confirm no ID is in both sections.
5. Update TDD steps and Regression together whenever scope changes.
6. Reject plan details that are unsupported by verified research or a user
   decision.
