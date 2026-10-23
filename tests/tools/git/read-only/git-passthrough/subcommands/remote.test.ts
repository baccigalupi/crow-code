import { describe, expect, it } from 'bun:test'
import { GitRemoteSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/remote.ts'

describe('GitRemoteSubcommand', () => {
  it('when given nothing, does not refuse', () => {
    const subcommand = new GitRemoteSubcommand({ args: [] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given -v, does not refuse', () => {
    const subcommand = new GitRemoteSubcommand({ args: ['-v'] })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['remote', '-v'])
  })

  it('when given get-url and a name, does not refuse', () => {
    const subcommand = new GitRemoteSubcommand({
      args: ['get-url', 'origin'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given add, refuses naming the allowed forms', () => {
    const subcommand = new GitRemoteSubcommand({ args: ['add', 'x', 'u'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: remote add; allowed forms for remote: (bare), -v, get-url',
    )
  })

  it('when given remove, refuses naming the allowed forms', () => {
    const subcommand = new GitRemoteSubcommand({ args: ['remove', 'x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: remote remove; allowed forms for remote: (bare), -v, get-url',
    )
  })

  it('when given rename, refuses naming the allowed forms', () => {
    const subcommand = new GitRemoteSubcommand({ args: ['rename', 'a', 'b'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: remote rename; allowed forms for remote: (bare), -v, get-url',
    )
  })

  it('when given set-url, refuses naming the allowed forms', () => {
    const subcommand = new GitRemoteSubcommand({ args: ['set-url', 'a', 'b'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: remote set-url; allowed forms for remote: (bare), -v, get-url',
    )
  })

  it('when given set-head, refuses naming the allowed forms', () => {
    const subcommand = new GitRemoteSubcommand({ args: ['set-head', 'a'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: remote set-head; allowed forms for remote: (bare), -v, get-url',
    )
  })

  it('when given prune, refuses naming the allowed forms', () => {
    const subcommand = new GitRemoteSubcommand({ args: ['prune', 'a'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: remote prune; allowed forms for remote: (bare), -v, get-url',
    )
  })

  it('when given update, refuses naming the allowed forms', () => {
    const subcommand = new GitRemoteSubcommand({ args: ['update'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: remote update; allowed forms for remote: (bare), -v, get-url',
    )
  })

  it('when given show, refuses naming the allowed forms', () => {
    const subcommand = new GitRemoteSubcommand({ args: ['show', 'origin'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: remote show; allowed forms for remote: (bare), -v, get-url',
    )
  })

  it('when -v is followed by add, refuses the arguments', () => {
    const subcommand = new GitRemoteSubcommand({
      args: ['-v', 'add', 'x', 'u'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('argument not allowed: add, x, u')
  })
})
