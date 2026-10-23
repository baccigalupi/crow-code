import { describe, expect, it } from 'bun:test'
import { GitPatchHunks } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/log/patch-hunks.ts'

describe('GitPatchHunks', () => {
  describe('paths', () => {
    it('when the patch has two hunks, returns the a and b path of each', () => {
      const hunks = new GitPatchHunks(
        'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two\ndiff --git a/old.txt b/new.txt\nsimilarity index 100%\nrename from old.txt\nrename to new.txt',
      )

      const paths = hunks.paths()

      expect(paths).toEqual([
        'allowed.txt',
        'allowed.txt',
        'old.txt',
        'new.txt',
      ])
    })

    it('when the patch is empty, returns []', () => {
      const hunks = new GitPatchHunks('')

      const paths = hunks.paths()

      expect(paths).toEqual([])
    })

    it('when a content line mentions diff --git, does not read it as a header', () => {
      const hunks = new GitPatchHunks(
        'diff --git a/notes.txt b/notes.txt\n@@ -0,0 +1 @@\n+diff --git a/secret.txt b/secret.txt',
      )

      const paths = hunks.paths()

      expect(paths).toEqual(['notes.txt', 'notes.txt'])
    })
  })

  describe('without', () => {
    it('when a hunk touches a forbidden path, removes that hunk', () => {
      const hunks = new GitPatchHunks(
        'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two\ndiff --git a/denied.txt b/denied.txt\n@@ -1 +1 @@\n-secret\n+secrets',
      )

      const patch = hunks.without(['denied.txt'])

      expect(patch).toBe(
        'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two',
      )
    })

    it('when a rename has a forbidden side, removes that hunk', () => {
      const hunks = new GitPatchHunks(
        'diff --git a/denied.txt b/public.txt\nrename from denied.txt\nrename to public.txt\ndiff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two',
      )

      const patch = hunks.without(['denied.txt'])

      expect(patch).toBe(
        'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two',
      )
    })

    it('when nothing is forbidden, returns the patch unchanged', () => {
      const hunks = new GitPatchHunks(
        'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two\ndiff --git a/notes.txt b/notes.txt\n@@ -0,0 +1 @@\n+notes',
      )

      const patch = hunks.without([])

      expect(patch).toBe(
        'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two\ndiff --git a/notes.txt b/notes.txt\n@@ -0,0 +1 @@\n+notes',
      )
    })

    it('when every hunk is forbidden, returns an empty patch', () => {
      const hunks = new GitPatchHunks(
        'diff --git a/denied.txt b/denied.txt\n@@ -1 +1 @@\n-secret\n+secrets',
      )

      const patch = hunks.without(['denied.txt'])

      expect(patch).toBe('')
    })
  })
})
