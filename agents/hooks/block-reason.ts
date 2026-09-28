import type { DevinConfig } from './devin-config.ts'

const correction =
  'Run the approved command now, do not retry variants, and do not end your turn.'

const cdPattern = /^cd\s+\S+\s+&&\s+(.+)$/

const unsafePattern = /\$\(|`|<|>|;|\||&|\n/

const mappings = [
  { pattern: /^deno\s+test\b/, script: 'dev/test' },
  { pattern: /^deno\s+check\b/, script: 'agents/typecheck' },
  { pattern: /^deno\s+fmt\b/, script: 'agents/format-check' },
  { pattern: /^deno\s+lint\b/, script: 'dev/lint' },
  { pattern: /^deno\s+coverage\b/, script: 'dev/coverage' },
  { pattern: /^(npm|npx|yarn|pnpm)\s+(run\s+)?test\b/, script: 'dev/test' },
  { pattern: /^(vitest|jest)\b/, script: 'dev/test' },
]

const mappedScript = (command: string) => {
  const found = mappings.find((mapping) => mapping.pattern.test(command))
  if (found === undefined) {
    return ''
  }
  return found.script
}

const cdExtractedCommand = (command: string) => {
  const match = cdPattern.exec(command)
  if (match === null) return ''
  return match[1]
}

const cdMessage = (action: string) =>
  `Blocked: do not use \`cd\`. Use the exec tool's \`workdir\` parameter instead. ${action}. ${correction}`

const cdBlockReason = (extracted: string, config: DevinConfig) => {
  const script = mappedScript(extracted)
  if (script !== '') {
    return cdMessage(`run \`${script}\` directly`)
  }
  if (unsafePattern.test(extracted)) {
    return cdMessage('run the command directly')
  }
  if (config.allowsExec(extracted)) {
    return cdMessage(`run \`${extracted}\` directly`)
  }
  return cdMessage('run the command directly')
}

export const blockReason = (command: string, config: DevinConfig) => {
  const trimmed = command.trim()
  const extracted = cdExtractedCommand(trimmed)
  if (extracted !== '') {
    return cdBlockReason(extracted, config)
  }
  const script = mappedScript(trimmed)
  if (script !== '') {
    return `Blocked: run \`${script}\` instead. ${correction}`
  }
  const approved = config.allowedExecs().join(', ')
  return `Blocked: approved exec commands are ${approved}. ${correction}`
}
