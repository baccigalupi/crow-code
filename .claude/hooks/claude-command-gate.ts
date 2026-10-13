#!/usr/bin/env -S deno run --allow-env --allow-read
// PreToolUse hook for Claude Code's Bash tool. For anything other than a
// read-only inspector (see below), this delegates to the already-tested
// Devin gate (agents/hooks/command-allowed.ts + devin-config.ts +
// block-reason.ts) as the single source of truth for "is this command
// allowed" — same .devin/config.json, same heredoc-commit and git-push
// handling. Only the IO envelope differs: Devin's hook prints
// {"decision":"block",...}; Claude Code expects
// {"hookSpecificOutput": {permissionDecision, permissionDecisionReason}}.
//
// One wording patch: blockReason's cd message points at "the exec tool's
// workdir parameter" — Devin-specific. Claude Code's Bash tool has no such
// parameter; the real fix here is the EnterWorktree tool (see
// .claude/skills/correct-command/SKILL.md § Worktrees).
//
// One allow-list supplement, handled separately rather than by reuse: Devin
// keeps its exec allowlist narrow because it has separate, non-exec tools for
// reading and searching files — grep/cat/ls never need to be *executed*
// there. This Claude Code session has no such dedicated search tool (no
// Grep/Glob), so Bash is the only way to inspect the repo. But
// command-allowed.ts's shell-safety check is a quote-blind regex — any `|`
// anywhere in the command text denies it, even inside a quoted alternation
// pattern like `grep -E "foo|bar"`. That's fine for Devin, which never runs
// quote-heavy search commands via exec, but wrong for grep/rg here. So
// read-only inspectors get their own quote-aware check instead of widening
// Devin's shared, quote-blind one.
import { blockReason } from '../../agents/hooks/block-reason.ts'
import { commandAllowed } from '../../agents/hooks/command-allowed.ts'
import { DevinConfig } from '../../agents/hooks/devin-config.ts'

const READ_ONLY_INSPECTORS = new Set([
  'rg',
  'grep',
  'egrep',
  'fgrep',
  'ls',
  'find',
  'ps',
  'cat',
  'head',
  'tail',
  'sed',
  'awk',
  'wc',
  'jq',
  'sort',
  'uniq',
  'stat',
  'file',
  'tree',
  'diff',
  'pwd',
  'echo',
  'printf',
  'basename',
  'dirname',
  'realpath',
])

const commandHead = (command: string) => command.trim().split(/\s+/)[0]

// Tracks quote state so a metacharacter inside '...' or "..." is not treated
// as a live shell operator. Deliberately narrower than a real shell parser —
// it only needs to answer "is there an operator this gate must deny" for
// single, already-head-approved commands, not to classify multi-segment
// shapes the way command-allowed.ts does for the rest of the allowlist.
const hasLiveShellOperator = (command: string) => {
  let quote = ''
  for (let index = 0; index < command.length; index += 1) {
    const char = command[index]
    if (quote === "'") {
      if (char === "'") quote = ''
      continue
    }
    if (quote === '"') {
      if (char === '"') quote = ''
      else if (char === '\\') index += 1
      continue
    }
    if (char === "'" || char === '"') {
      quote = char
      continue
    }
    if (char === '\\') {
      index += 1
      continue
    }
    if (char === '$' && command[index + 1] === '(') return true
    if ('`;|&<>\n'.includes(char)) return true
  }
  return false
}

const isSafeReadOnlyInspector = (command: string) => {
  const head = commandHead(command)
  return head !== undefined && READ_ONLY_INSPECTORS.has(head) &&
    !hasLiveShellOperator(command)
}

const workdirPhrase = "Use the exec tool's `workdir` parameter instead."
const worktreePhrase =
  'Use the EnterWorktree tool to switch into a worktree instead — see .claude/skills/correct-command/SKILL.md.'

// Devin's gate has no concept of backgrounding, so command-allowed.ts never
// considers it. Claude Code's Bash tool does (run_in_background) — and
// dev/test / dev/coverage run --clean, wiping the shared coverage/ directory
// on every invocation. Stacking a backgrounded run on a foreground one (or
// on agents/pre-commit, which runs dev/test itself) corrupts both.
const HEAVY = new Set(['dev/test', 'dev/coverage', 'agents/pre-commit'])

const isHeavy = (command: string) => {
  const head = commandHead(command)?.replace(/^\.\//, '')
  return head !== undefined && HEAVY.has(head)
}

const emit = (decision: string, reason: string) => {
  const text = JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decision,
      permissionDecisionReason: reason,
    },
  })
  Deno.stdout.writeSync(new TextEncoder().encode(text))
}

const loadConfig = async (root: string) => {
  const path = `${root}/.devin/config.json`
  return new DevinConfig(await Deno.readTextFile(path))
}

const raw = await new Response(Deno.stdin.readable).text()

try {
  const payload = JSON.parse(raw)
  const command: string = payload?.tool_input?.command ?? ''
  const cwd: string = (payload?.cwd ?? Deno.cwd()).replace(/\/+$/, '')
  const root = Deno.env.get('CLAUDE_PROJECT_DIR') ?? cwd

  const runInBackground = Boolean(payload?.tool_input?.run_in_background)

  if (command.trim() === '') {
    emit('deny', 'Empty command.')
  } else if (isSafeReadOnlyInspector(command)) {
    emit('allow', 'Read-only inspector with no live shell operator.')
  } else if (runInBackground && isHeavy(command)) {
    emit(
      'deny',
      'dev/test, dev/coverage, and agents/pre-commit run `--clean` and wipe the shared coverage/ directory on every invocation. Backgrounding one lets a second stack on top of it and corrupt the results — run it in the foreground instead.',
    )
  } else {
    const config = await loadConfig(root)
    if (commandAllowed(command, config)) {
      emit(
        'allow',
        'Approved by .devin/config.json via agents/hooks/command-allowed.ts.',
      )
    } else {
      const reason = blockReason(command, config).replace(
        workdirPhrase,
        worktreePhrase,
      )
      emit('deny', reason)
    }
  }
} catch (error) {
  emit(
    'deny',
    `claude-command-gate failed to classify this command: ${
      (error as Error).message
    }. Report this to the maintainer — it is a gate bug, not a bad command.`,
  )
}
