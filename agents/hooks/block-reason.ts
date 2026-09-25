import type { DevinConfig } from './devin-config.ts'

const correction =
  'Run the approved command now, do not retry variants, and do not end your turn.'

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

export const blockReason = (command: string, config: DevinConfig) => {
  const script = mappedScript(command.trim())
  if (script !== '') {
    return `Blocked: run \`${script}\` instead. ${correction}`
  }
  const approved = config.allowedExecs().join(', ')
  return `Blocked: approved exec commands are ${approved}. ${correction}`
}
