import { describe, expect, it } from 'bun:test'
import { parsedStat } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/log/stat.ts'

describe('parsedStat', () => {
  it('when given path lines and a summary, returns each path and the counts', () => {
    const lines = [
      ' allowed.txt | 2 +-',
      ' notes.txt   | 1 +',
      ' 2 files changed, 2 insertions(+), 1 deletion(-)',
    ]

    const stat = parsedStat(lines)

    expect(stat).toEqual({
      summary: { changed: 2, insertions: 2, deletions: 1 },
      paths: [
        { path: 'allowed.txt', changes: '2 +-' },
        { path: 'notes.txt', changes: '1 +' },
      ],
    })
  })

  it('when the summary has no deletions, deletions is 0', () => {
    const lines = [' notes.txt | 1 +', ' 1 file changed, 1 insertion(+)']

    const stat = parsedStat(lines)

    expect(stat).toEqual({
      summary: { changed: 1, insertions: 1, deletions: 0 },
      paths: [{ path: 'notes.txt', changes: '1 +' }],
    })
  })

  it('when the summary has no insertions, insertions is 0', () => {
    const lines = [' notes.txt | 2 --', ' 1 file changed, 2 deletions(-)']

    const stat = parsedStat(lines)

    expect(stat).toEqual({
      summary: { changed: 1, insertions: 0, deletions: 2 },
      paths: [{ path: 'notes.txt', changes: '2 --' }],
    })
  })

  it('when a path contains a pipe, splits on the last one', () => {
    const lines = [
      ' a | b.txt | 3 ++-',
      ' 1 file changed, 2 insertions(+), 1 deletion(-)',
    ]

    const stat = parsedStat(lines)

    expect(stat.paths).toEqual([{ path: 'a | b.txt', changes: '3 ++-' }])
  })

  it('when a path is binary, keeps the binary changes text', () => {
    const lines = [
      ' image.png | Bin 0 -> 12 bytes',
      ' 1 file changed, 0 insertions(+), 0 deletions(-)',
    ]

    const stat = parsedStat(lines)

    expect(stat).toEqual({
      summary: { changed: 1, insertions: 0, deletions: 0 },
      paths: [{ path: 'image.png', changes: 'Bin 0 -> 12 bytes' }],
    })
  })

  it('when there are no lines, returns zero counts and no paths', () => {
    const lines: string[] = []

    const stat = parsedStat(lines)

    expect(stat).toEqual({
      summary: { changed: 0, insertions: 0, deletions: 0 },
      paths: [],
    })
  })
})
