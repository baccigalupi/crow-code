import { describe, expect, it } from 'bun:test'
import {
  gitSafeReadEnv,
  gitSafeReadSubcommand,
} from '../../../../../src/tools/git/read-only/git-passthrough/git-safe-read.ts'

describe('git-safe-read', () => {
  it('when parent has retargeting variables, removes them and applies settings', () => {
    const parent = {
      PATH: '/usr/bin',
      HOME: '/h',
      GIT_DIR: '/x',
      GIT_ASKPASS: 'a',
      GIT_PAGER: 'less',
    }

    const env = gitSafeReadEnv(parent)

    expect(env).toEqual({
      PATH: '/usr/bin',
      HOME: '/h',
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_OPTIONAL_LOCKS: '0',
      GIT_TERMINAL_PROMPT: '0',
      GIT_PAGER: 'cat',
      PAGER: 'cat',
      GIT_EDITOR: ':',
      EDITOR: ':',
      GIT_LITERAL_PATHSPECS: '1',
    })
  })

  it('when prepended to a subcommand, the fixed overrides come first', () => {
    const subcommand = ['status']

    const args = gitSafeReadSubcommand(subcommand)

    expect(args).toEqual([
      '--no-pager',
      '-c',
      'core.fsmonitor=false',
      '-c',
      'core.hooksPath=/dev/null',
      '-c',
      'core.pager=cat',
      '-c',
      'diff.external=',
      '-c',
      'protocol.allow=never',
      '-c',
      'core.untrackedCache=false',
      'status',
    ])
  })
})
