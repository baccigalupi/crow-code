import type { GitLogStat } from '../../../../types.ts'

const count = (line: string, pattern: RegExp) => {
  const numbers = [...line.matchAll(pattern)].map((match) => Number(match[1]))
  return numbers.reduce((total, number) => total + number, 0)
}

const summaryOf = (line: string) => {
  return {
    changed: count(line, /(\d+) files? changed/g),
    insertions: count(line, /(\d+) insertions?\(\+\)/g),
    deletions: count(line, /(\d+) deletions?\(-\)/g),
  }
}

const pathOf = (line: string) => {
  const pipe = line.lastIndexOf(' | ')
  return {
    path: line.slice(0, pipe).trim(),
    changes: line.slice(pipe + 3).trim(),
  }
}

export const parsedStat = (lines: string[]): GitLogStat => {
  const summary = lines.slice(-1).join('')
  return { summary: summaryOf(summary), paths: lines.slice(0, -1).map(pathOf) }
}
