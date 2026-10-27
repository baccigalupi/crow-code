import { describe, expect, it } from 'bun:test'
import { GitRefKindParser } from '../../../../../src/tools/git/read-only/subcommands/ref-kind-parser.ts'

describe('GitRefKindParser', () => {
  it('when given refs/heads/main, returns branch', () => {
    const parser = new GitRefKindParser('refs/heads/main')

    const kind = parser.parse()

    expect(kind).toBe('branch')
  })

  it('when given HEAD, returns head', () => {
    const parser = new GitRefKindParser('HEAD')

    const kind = parser.parse()

    expect(kind).toBe('head')
  })

  it('when given refs/tags/v1.0, returns tag', () => {
    const parser = new GitRefKindParser('refs/tags/v1.0')

    const kind = parser.parse()

    expect(kind).toBe('tag')
  })

  it('when given refs/remotes/origin/main, returns remote', () => {
    const parser = new GitRefKindParser('refs/remotes/origin/main')

    const kind = parser.parse()

    expect(kind).toBe('remote')
  })

  it('when given refs/stash, returns stash', () => {
    const parser = new GitRefKindParser('refs/stash')

    const kind = parser.parse()

    expect(kind).toBe('stash')
  })

  it('when given refs/notes/x, returns other', () => {
    const parser = new GitRefKindParser('refs/notes/x')

    const kind = parser.parse()

    expect(kind).toBe('other')
  })
})
