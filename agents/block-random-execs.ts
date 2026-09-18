#!/usr/bin/env -S deno run
// PreToolUse hook: blocks exec calls outside the prescribed allowlist.
// Prints {"decision":"block","reason":...} on stdout to deny; silence means pass.

const allowedScripts = [
  'dev/test',
  'dev/lint',
  'dev/coverage',
  'agents/typecheck',
  'agents/format-check',
  'agents/pre-commit.sh',
  'agents/check-coverage.sh',
  'agents/coverage-report',
  'agents/editor-diagnostics.ts',
]

const reason = `Allowed commands: ${
  allowedScripts.join(', ')
}, git (except push), bd`

const block = () => {
  console.log(JSON.stringify({ decision: 'block', reason }))
}

const readPayload = async () => {
  const text = await new Response(Deno.stdin.readable).text()
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const hasShellMeta = (command: string) => {
  return /\$\(|`|<|>/.test(command)
}

const stripLeading = (segment: string) => {
  let rest = segment.trim()
  while (/^[A-Za-z_][A-Za-z0-9_]*=\S*\s/.test(rest)) {
    rest = rest.replace(/^[A-Za-z_][A-Za-z0-9_]*=\S*\s+/, '')
  }
  if (rest.startsWith('./')) {
    rest = rest.slice(2)
  }
  return rest
}

const gitTakesValue = (word: string) => {
  return ['-C', '-c', '--git-dir', '--work-tree', '--exec-path', '--namespace']
    .includes(word)
}

const flagWidth = (word: string) => {
  if (gitTakesValue(word)) {
    return 2
  }
  return 1
}

const gitSubcommand = (words: string[]) => {
  let index = 1
  while (index < words.length && words[index].startsWith('-')) {
    index += flagWidth(words[index])
  }
  return words[index]
}

const segmentAllowed = (segment: string) => {
  const words = stripLeading(segment).split(/\s+/)
  if (allowedScripts.includes(words[0]) || words[0] === 'bd') {
    return true
  }
  if (words[0] === 'git') {
    return gitSubcommand(words) !== 'push'
  }
  return false
}

const commandAllowed = (command: string) => {
  if (hasShellMeta(command)) {
    return false
  }
  return command.split(/\|\||&&|[;|\n]/).every((segment) => {
    if (segment.trim() === '') {
      return true
    }
    return segmentAllowed(segment)
  })
}

// deno-lint-ignore no-explicit-any
const extractCommand = (payload: any) => {
  if (payload === null || payload.tool_name !== 'exec') {
    return null
  }
  if (typeof payload.tool_input !== 'object' || payload.tool_input === null) {
    return null
  }
  if (typeof payload.tool_input.command !== 'string') {
    return null
  }
  return payload.tool_input.command
}

const main = async () => {
  const command = extractCommand(await readPayload())
  if (command === null || !commandAllowed(command)) {
    block()
  }
}

await main()
