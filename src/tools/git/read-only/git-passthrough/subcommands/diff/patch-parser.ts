import type { GitDiffFile, GitDiffKind } from '../../../../../types.ts'
import { trackedChangeParser } from '../../../diff/tracked-changes/parser.ts'

const hunkHeader = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/
const renamePrefix = 'rename from '

const kindMarkers: [string, GitDiffKind][] = [
  ['new file mode ', 'added'],
  ['deleted file mode ', 'deleted'],
  [renamePrefix, 'renamed'],
]

const defaultKindMarker: [string, GitDiffKind] = ['', 'modified']

const hasLine = (lines: string[], prefix: string) => {
  return lines.some((line) => line.startsWith(prefix))
}

const kindOf = (lines: string[]) => {
  const marker = kindMarkers.find(([prefix]) => hasLine(lines, prefix))
  const [, kind] = marker || defaultKindMarker
  return kind
}

const renameSource = (lines: string[]) => {
  if (!hasLine(lines, renamePrefix)) {
    return {}
  }
  const line = lines.find((candidate) => candidate.startsWith(renamePrefix))
  return { oldPath: (line as string).slice(renamePrefix.length) }
}

const count = (text: string | undefined) => {
  if (text === undefined) {
    return 1
  }
  return Number(text)
}

const rangeOf = (header: string) => {
  const match = header.match(hunkHeader) as RegExpMatchArray
  return {
    oldStart: Number(match[1]),
    oldCount: count(match[2]),
    newStart: Number(match[3]),
    newCount: count(match[4]),
  }
}

const hunkAt = (lines: string[], start: number, end: number | undefined) => {
  const body = lines.slice(start + 1, end)
  return { ...rangeOf(lines[start]), lines: body.filter((line) => line !== '') }
}

const hunksOf = (lines: string[]) => {
  const starts = lines
    .map((_line, index) => index)
    .filter((index) => hunkHeader.test(lines[index]))
  return starts.map((start, position) =>
    hunkAt(lines, start, starts[position + 1]),
  )
}

export class GitDiffPatchParser {
  private output: string

  constructor(output: string) {
    this.output = output
  }

  parse() {
    const changes = trackedChangeParser(this.output)
    return { diffs: changes.map((change) => this.file(change)) }
  }

  private file(change: { path: string; diff: string }): GitDiffFile {
    const lines = change.diff.split('\n')
    return {
      path: change.path,
      kind: kindOf(lines),
      ...renameSource(lines),
      hunks: hunksOf(lines),
    }
  }
}
