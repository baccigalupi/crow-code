import { shellSegments } from './shell-segments.ts'

const hasEnvAssignment = (segment: string) =>
  /^[A-Za-z_][A-Za-z0-9_]*=\S*\s/.test(segment)

const dropEnvAssignment = (segment: string) =>
  segment.replace(/^[A-Za-z_][A-Za-z0-9_]*=\S*\s+/, '')

const dropLeadingPrefix = (segment: string) => {
  if (segment.startsWith('./')) {
    return segment.slice(2)
  }
  return segment
}

const stripLeading = (segment: string) => {
  let rest = segment.trim()
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

const segmentAllowed = (segment: string) => {
  const words = stripLeading(segment).split(/\s+/)
  const gitAllowed = words[0] === 'git' && gitSubcommand(words) !== 'push'
  return executableAllowed(words) || gitAllowed
}

export const commandAllowed = (command: string) => {
  const segments = shellSegments(command)
  if (segments === null) return false
  return segments.every((segment) =>
    segment.trim() === '' || segmentAllowed(segment)
  )
}
