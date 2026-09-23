import type { DevinConfig } from './devin-config.ts'

const metacharPattern = /\$\(|`|<|>|;|\||&|\n/

const shellSubstitutionPattern = /\$\(|`/

const literalMultilineCommitPattern = /^git\s+commit(?:\s+-m\s+"[^"]*")+\s*$/

const heredocOpenerPattern =
  /^git\s+commit\s+-F\s+-\s+<<'([A-Za-z0-9_.-]+)'\n([\s\S]*)$/

const terminatorIndex = (lines: string[]) => {
  if (lines[lines.length - 1] === '') {
    return lines.length - 2
  }
  return lines.length - 1
}

const isHeredocCommit = (command: string) => {
  const match = heredocOpenerPattern.exec(command)
  if (match === null) {
    return false
  }
  const lines = match[2].split('\n')
  return lines.indexOf(match[1]) === terminatorIndex(lines)
}

const hasShellSubstitution = (command: string) =>
  shellSubstitutionPattern.test(command)

const isLiteralMultilineCommit = (command: string) => {
  const stripped = stripLeading(command)
  return literalMultilineCommitPattern.test(stripped)
}

const isSafeShell = (command: string) => {
  if (hasShellSubstitution(command)) return false
  if (isLiteralMultilineCommit(command)) return true
  return !metacharPattern.test(command) && doubleQuotesBalanced(command)
}

const doubleQuotesBalanced = (command: string) => {
  const count = command.split('"').length - 1
  return count % 2 === 0
}

const hasEnvAssignment = (command: string) =>
  /^[A-Za-z_][A-Za-z0-9_]*=\S*\s/.test(command)

const dropEnvAssignment = (command: string) =>
  command.replace(/^[A-Za-z_][A-Za-z0-9_]*=\S*\s+/, '')

const dropLeadingPrefix = (command: string) => {
  if (command.startsWith('./')) {
    return command.slice(2)
  }
  return command
}

const stripLeading = (command: string) => {
  let rest = command.trim()
  while (hasEnvAssignment(rest)) {
    rest = dropEnvAssignment(rest)
  }
  return dropLeadingPrefix(rest)
}

const gitPushPattern =
  /^git(?:\s+(?:-[A-Za-z0-9-]+(?:\s+\S+)?|[^-\s]\S*))*\s+push\b/

const executableAllowed = (command: string, config: DevinConfig) =>
  config.allowsExec(command)

export const commandAllowed = (command: string, config: DevinConfig) => {
  if (isHeredocCommit(command)) return true
  if (!isSafeShell(command)) return false
  const stripped = stripLeading(command)
  if (stripped.startsWith('git ')) return !gitPushPattern.test(stripped)
  return executableAllowed(stripped, config)
}
