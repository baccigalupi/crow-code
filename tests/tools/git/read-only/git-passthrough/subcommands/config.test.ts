import { describe, expect, it } from 'bun:test'
import { GitConfigSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/config.ts'

describe('GitConfigSubcommand', () => {
  it('when given --get and a key, does not refuse', () => {
    const subcommand = new GitConfigSubcommand({
      args: ['--get', 'user.name'],
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['config', '--get', 'user.name'])
  })

  it('when given --get-all and a key, does not refuse', () => {
    const subcommand = new GitConfigSubcommand({
      args: ['--get-all', 'remote.origin.url'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --get-regexp and a pattern, does not refuse', () => {
    const subcommand = new GitConfigSubcommand({
      args: ['--get-regexp', '^remote'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --list, does not refuse', () => {
    const subcommand = new GitConfigSubcommand({ args: ['--list'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given -l, does not refuse', () => {
    const subcommand = new GitConfigSubcommand({ args: ['-l'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given a key and a value, refuses naming the allowed forms', () => {
    const subcommand = new GitConfigSubcommand({ args: ['user.name', 'x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: config user.name; allowed forms for config: --get, --get-all, --get-regexp, --list, -l',
    )
  })

  it('when given --add, refuses naming the allowed forms', () => {
    const subcommand = new GitConfigSubcommand({ args: ['--add', 'a', 'b'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: config --add; allowed forms for config: --get, --get-all, --get-regexp, --list, -l',
    )
  })

  it('when given --unset, refuses naming the allowed forms', () => {
    const subcommand = new GitConfigSubcommand({ args: ['--unset', 'a'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: config --unset; allowed forms for config: --get, --get-all, --get-regexp, --list, -l',
    )
  })

  it('when given -e, refuses naming the allowed forms', () => {
    const subcommand = new GitConfigSubcommand({ args: ['-e'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: config -e; allowed forms for config: --get, --get-all, --get-regexp, --list, -l',
    )
  })

  it('when given --replace-all, refuses naming the allowed forms', () => {
    const subcommand = new GitConfigSubcommand({
      args: ['--replace-all', 'a', 'b'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: config --replace-all; allowed forms for config: --get, --get-all, --get-regexp, --list, -l',
    )
  })

  it('when given --rename-section, refuses naming the allowed forms', () => {
    const subcommand = new GitConfigSubcommand({
      args: ['--rename-section', 'a', 'b'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: config --rename-section; allowed forms for config: --get, --get-all, --get-regexp, --list, -l',
    )
  })

  it('when given --remove-section, refuses naming the allowed forms', () => {
    const subcommand = new GitConfigSubcommand({
      args: ['--remove-section', 'a'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: config --remove-section; allowed forms for config: --get, --get-all, --get-regexp, --list, -l',
    )
  })

  it('when --get is followed by --add, refuses the flag', () => {
    const subcommand = new GitConfigSubcommand({
      args: ['--get', 'a', '--add'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --add; allowed flags for config: none',
    )
  })

  it('when --list is given an argument, refuses the argument', () => {
    const subcommand = new GitConfigSubcommand({ args: ['--list', 'foo'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('argument not allowed: foo')
  })
})
