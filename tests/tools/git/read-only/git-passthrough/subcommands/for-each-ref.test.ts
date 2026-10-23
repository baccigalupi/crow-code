import { describe, expect, it } from 'bun:test'
import { GitForEachRefSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/for-each-ref.ts'

describe('GitForEachRefSubcommand', () => {
  it('when given --format, --sort, --count and a pattern, does not refuse', () => {
    const subcommand = new GitForEachRefSubcommand({
      args: [
        '--format=%(refname)',
        '--sort=-committerdate',
        '--count',
        '5',
        'refs/heads',
      ],
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'for-each-ref',
      '--format=%(refname)',
      '--sort=-committerdate',
      '--count',
      '5',
      'refs/heads',
    ])
  })

  it('when given --contains and --merged, does not refuse', () => {
    const subcommand = new GitForEachRefSubcommand({
      args: ['--contains', 'HEAD', '--merged', 'main'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when --count is not a number, refuses naming the value', () => {
    const subcommand = new GitForEachRefSubcommand({ args: ['--count', 'x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('flag value not a number: --count x')
  })

  it('when given --color, refuses naming the allowed flags', () => {
    const subcommand = new GitForEachRefSubcommand({
      args: ['--color=always'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --color=always; allowed flags for for-each-ref: --contains, --count, --format, --ignore-case, --merged, --no-contains, --no-merged, --perl, --points-at, --python, --shell, --sort, --tcl, -p, -s',
    )
  })
})
