import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  TrackedChangeParser,
  trackedChangeParser,
} from '../../../../src/tools/git/tracked-changes/parser.ts'

describe('TrackedChangeParser', () => {
  it('when text is empty, returns an empty array', () => {
    const parser = new TrackedChangeParser('')

    const result = parser.parse()

    expect(result).toEqual([])
  })

  it('when text has two file diffs, returns one entry per file', () => {
    const output = `diff --git a/src/a.ts b/src/a.ts
index 1111111..2222222 100644
--- a/src/a.ts
+++ b/src/a.ts
@@ -1 +1 @@
-old
+new
diff --git a/src/b.ts b/src/b.ts
index 3333333..4444444 100644
--- a/src/b.ts
+++ b/src/b.ts
@@ -1 +1 @@
-foo
+bar
`
    const parser = new TrackedChangeParser(output)

    const result = parser.parse()

    expect(result).toEqual([
      {
        path: 'src/a.ts',
        diff: `diff --git a/src/a.ts b/src/a.ts
index 1111111..2222222 100644
--- a/src/a.ts
+++ b/src/a.ts
@@ -1 +1 @@
-old
+new
`,
      },
      {
        path: 'src/b.ts',
        diff: `diff --git a/src/b.ts b/src/b.ts
index 3333333..4444444 100644
--- a/src/b.ts
+++ b/src/b.ts
@@ -1 +1 @@
-foo
+bar
`,
      },
    ])
  })

  it('when a file is deleted, keeps the chunk and the header path', () => {
    const output = `diff --git a/gone.ts b/gone.ts
deleted file mode 100644
index 1111111..0000000
--- a/gone.ts
+++ /dev/null
@@ -1 +0,0 @@
-gone
`
    const parser = new TrackedChangeParser(output)

    const result = parser.parse()

    expect(result).toEqual([{ path: 'gone.ts', diff: output }])
  })

  it('trackedChangeParser returns the parsed array', () => {
    const output = 'diff --git a/file.ts b/file.ts\n'

    const result = trackedChangeParser(output)

    expect(result).toEqual([{ path: 'file.ts', diff: output }])
  })
})
