import { describe, expect, it } from 'bun:test'
import { GitDiffPatchParser } from '../../../../../../src/tools/git/read-only/subcommands/diff/patch-parser.ts'

describe('GitDiffPatchParser', () => {
  it('when given a modified file, returns its path, kind and hunk', () => {
    const parser = new GitDiffPatchParser(
      'diff --git a/allowed.txt b/allowed.txt\nindex cc1c127..fe4e092 100644\n--- a/allowed.txt\n+++ b/allowed.txt\n@@ -1 +1 @@\n-allowed one\n+allowed two\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      diffs: [
        {
          path: 'allowed.txt',
          kind: 'modified',
          hunks: [
            {
              oldStart: 1,
              oldCount: 1,
              newStart: 1,
              newCount: 1,
              lines: ['-allowed one', '+allowed two'],
            },
          ],
        },
      ],
    })
  })

  it('when given new and deleted files, marks them added and deleted', () => {
    const parser = new GitDiffPatchParser(
      'diff --git a/new.txt b/new.txt\nnew file mode 100644\nindex 0000000..a1b2c3d\n--- /dev/null\n+++ b/new.txt\n@@ -0,0 +1,2 @@\n+one\n+two\ndiff --git a/old.txt b/old.txt\ndeleted file mode 100644\nindex d4e5f6a..0000000\n--- a/old.txt\n+++ /dev/null\n@@ -1 +0,0 @@\n-gone\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      diffs: [
        {
          path: 'new.txt',
          kind: 'added',
          hunks: [
            {
              oldStart: 0,
              oldCount: 0,
              newStart: 1,
              newCount: 2,
              lines: ['+one', '+two'],
            },
          ],
        },
        {
          path: 'old.txt',
          kind: 'deleted',
          hunks: [
            {
              oldStart: 1,
              oldCount: 1,
              newStart: 0,
              newCount: 0,
              lines: ['-gone'],
            },
          ],
        },
      ],
    })
  })

  it('when given a rename, marks it renamed with the old path', () => {
    const parser = new GitDiffPatchParser(
      'diff --git a/old.txt b/new.txt\nsimilarity index 100%\nrename from old.txt\nrename to new.txt\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      diffs: [
        { path: 'new.txt', kind: 'renamed', oldPath: 'old.txt', hunks: [] },
      ],
    })
  })

  it('when a file has two hunks, returns both', () => {
    const parser = new GitDiffPatchParser(
      'diff --git a/a.txt b/a.txt\nindex 1111111..2222222 100644\n--- a/a.txt\n+++ b/a.txt\n@@ -1,2 +1,2 @@\n-one\n+uno\n two\n@@ -10,2 +10,3 @@\n ten\n+eleven\n twelve\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      diffs: [
        {
          path: 'a.txt',
          kind: 'modified',
          hunks: [
            {
              oldStart: 1,
              oldCount: 2,
              newStart: 1,
              newCount: 2,
              lines: ['-one', '+uno', ' two'],
            },
            {
              oldStart: 10,
              oldCount: 2,
              newStart: 10,
              newCount: 3,
              lines: [' ten', '+eleven', ' twelve'],
            },
          ],
        },
      ],
    })
  })

  it('when a file is binary, has no hunks', () => {
    const parser = new GitDiffPatchParser(
      'diff --git a/i.png b/i.png\nindex 3333333..4444444 100644\nBinary files a/i.png and b/i.png differ\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      diffs: [{ path: 'i.png', kind: 'modified', hunks: [] }],
    })
  })
})
