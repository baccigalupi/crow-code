const metacharPattern = /\$\(|`|<|>|;|\||&|\n/

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

const executableAllowed = (words: string[]) => {
  if (words[0].startsWith('agents/') || words[0].startsWith('dev/')) {
    return true
  }
  if (words[0] === 'bd') return true
  if (words[0] === 'curl') return true
  return false
}

export const commandAllowed = (command: string) => {
  if (isHeredocCommit(command)) {
    return true
  }
  if (metacharPattern.test(command) || !doubleQuotesBalanced(command)) {
    return false
  }
  const words = stripLeading(command).split(/\s+/)
  const gitAllowed = words[0] === 'git' && gitSubcommand(words) !== 'push'
  return executableAllowed(words) || gitAllowed
}
