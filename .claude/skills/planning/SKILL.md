---
name: planning
description: >-
  Create and revise implementation plans with an immutable Goal, verified
  research, explicit Assumptions/Decisions, strict TDD, and regression
  protection. Use whenever creating, researching, or revising an
  implementation plan — including every time EnterPlanMode is used, and
  before every ExitPlanMode call.
---

# Planning

Claude Code port of Devin's `planning` skill (`.devin/skills/planning/SKILL.md`)
— same plan structure and discipline, adapted to this harness's tools and
plan-mode mechanics (`EnterPlanMode`/`ExitPlanMode`, `EnterWorktree`, the
command gate in `.claude/hooks/claude-command-gate.ts`) instead of Devin's
`exec`/`workdir`/plan-link UI. Keep this file in sync by hand if the Devin skill
changes — there's no automated link between the two.

## Interaction rule

Do not ask planning questions in chat. Put every uncertainty, ambiguity, missing
fact, and question-shaped item in the plan's Assumptions table, then investigate
it with available tools. If only the user can resolve an item, leave it
explicitly unresolved in the table with the consequence of each plausible answer
— do not silently pick one. Don't ask whether to implement the plan in chat
text; the user starts implementation when ready.

## Planning responses

While planning, all work product goes into the plan file — never into code
files, worktrees, `.beads/`, or committed docs. The plan file path is the one
given in the `EnterPlanMode` system reminder for this session
(`/Users/kane/.claude/plans/<slug>.md`); outside of writing code the plan mode
guard enforces, it's the only file plan mode allows editing.

After writing or revising the plan, never paste or restate plan content in the
chat response — not the Goal quote, not a section, not a summary of what
changed. Send the plan file itself with
`SendUserFile({files: ["<plan
path>"], status: "normal"})` so the user gets a
link to the current version; do this every time the plan file is written or
edited, not just the first time. The chat response contains nothing else — no
greeting, no recap, no follow-up text. `ExitPlanMode` is denied in
`.claude/settings.json`; never call it. End the turn with the plan file sent, or
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

1. In the plan, record the intended worktree name (derived from the Beads issue
   or feature name) as planned — e.g. `Worktree: write-tool (to be
   created)`.
2. As the first step of implementation — never during planning — call
   `EnterWorktree({ name: "<id>" })`. This creates `.claude/worktrees/<name>` on
   a new branch and moves the session's cwd into it; no `git worktree add`, no
   `cd`, no `--config` flags (see the `correct-command` skill).
3. All subsequent file paths, `dev/*`/`agents/*` calls, and verification
   commands then target the worktree automatically.
4. Landing is the fixed sequence from `CLAUDE.md`/`AGENTS.md`: commit in the
   worktree (`git commit -F - <<'EOF' ... EOF`) → `git rebase main` →
   `ExitWorktree({ action: "keep" })` → `git merge --ff-only <branch>` in the
   main checkout (never a merge commit; if `main` moved, repeat the rebase and
   `agents/pre-commit`, then retry) → `bd close <id>` →
   `ExitWorktree({ action: "remove" })`. Request approval once before this
   sequence; a granted approval authorizes the whole thing, including the
   commit. Never rebase, merge, or fast-forward onto `main` unprompted. If the
   work is abandoned instead, `ExitWorktree({ action: "remove" })` and leave the
   issue open.

## Beads issue

Like the worktree, the Beads issue does not exist during planning:

1. Record in the plan the issue title to create, or the provided issue ID when
   the user supplies one — e.g. `Beads: <title> (to be created)` or
   `Beads: crow-code-4vz.2`.
2. As the first step of implementation — never during planning — run `bd create`
   for the recorded title (unless the plan names an existing issue) and
   `bd update <id> --claim`.
3. `.beads/*.jsonl` is tracked state — stage it with the implementation work it
   records.

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
  Resolve scope discoveries in Assumptions/Decisions, not by drifting the Goal.

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
limitations. Distinguish verified facts from inferences — inferences belong in
Assumptions.

### Assumptions

| ID | Assumption / unknown | Why it matters |
| -- | -------------------- | -------------- |

- Only genuinely undecided items needing a user decision belong here.
- Number sequentially (`A1`, `A2`, …); keep an assumption's ID stable through
  revisions, never renumber later assumptions after resolving one out of order.
- Every unknown or question-shaped item goes here, never into a chat question.
- Don't leave a verified or resolved item in this table.

### Decisions

Move assumptions here once evidence verifies or refutes them and the
implementation consequence is resolved. Matching numeric ID: resolving `A1`
creates `D1`. State the originating assumption ID, the evidence, and the
resulting scope/choice. A decision made directly from an explicit user
instruction (not a resolved assumption) may use the next unused `D` number and
must cite the instruction instead of inventing an assumption. Preserve
superseded decisions with their replacement noted when revision history matters.
Never present an unresolved assumption as a decision.

### Implementation steps (TDD)

Setup first: create the Beads issue and worktree recorded above (see Worktree
setup / Beads issue). Every subsequent step runs inside the worktree.

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

Name, per step: test file, production file, behavior under test, red
command/result, minimal implementation, green command/result. Test-only or
doc-only changes must explain why production TDD doesn't apply.

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
can resolve (a new Assumption-shaped decision, a destructive action needing
confirmation, work that contradicts the plan). Otherwise the next chat message
is the completion report.

## Implementation completion

Once every TDD step is green and `agents/pre-commit` passes, report plainly that
the plan is complete — don't recap which checks were run, don't mention any
failure encountered and fixed along the way (that's in the plan file, not the
chat), and don't ask whether to proceed with landing: move straight into
requesting approval to land the work (see Worktree setup). Send the final
completion response only after that landing approval is granted or declined —
keep it to the result, not a recap: what landed, what didn't, and why, in under
two sentences per `compliant-answer`.

## Revision discipline

On every revision:

1. Keep Goal byte-for-byte stable unless the user corrects it.
2. Recheck Verified research against evidence.
3. Add newly discovered unknowns to Assumptions.
4. Move resolved assumptions to Decisions — never duplicate across both
   sections.
5. Update TDD steps and Regression together whenever scope changes.
6. Reject plan details that are unsupported by either verified research or an
   explicit assumption.
