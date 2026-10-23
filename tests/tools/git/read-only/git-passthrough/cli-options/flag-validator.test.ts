import { describe, expect, it } from 'bun:test'
import { BooleanFlag } from '../../../../../../src/tools/git/read-only/git-passthrough/cli-options/boolean-flag.ts'
import { GitFlagValidator } from '../../../../../../src/tools/git/read-only/git-passthrough/cli-options/flag-validator.ts'
import { NumberFlag } from '../../../../../../src/tools/git/read-only/git-passthrough/cli-options/number-flag.ts'
import { UnknownFlag } from '../../../../../../src/tools/git/read-only/git-passthrough/cli-options/unknown-flag.ts'

describe('GitFlagValidator', () => {
  it('when every flag is accepted, does not refuse', () => {
    const validator = new GitFlagValidator({
      name: 'log',
      flags: [new BooleanFlag({ typed: '--oneline', value: undefined })],
      allowed: ['--oneline'],
    })

    const refusal = validator.refusal()

    expect(refusal).toBe('')
  })

  it('when flags are refused, names them in order with the allowed flags', () => {
    const validator = new GitFlagValidator({
      name: 'log',
      flags: [
        new UnknownFlag({ typed: '--output=f', value: 'f' }),
        new BooleanFlag({ typed: '--oneline', value: undefined }),
        new UnknownFlag({ typed: '--exec=x', value: 'x' }),
      ],
      allowed: ['--oneline'],
    })

    const refusal = validator.refusal()

    expect(refusal).toBe(
      'flag not allowed: --output=f, --exec=x; allowed flags for log: --oneline',
    )
  })

  it('when one typed flag is refused more than once, names it once', () => {
    const validator = new GitFlagValidator({
      name: 'log',
      flags: [
        new UnknownFlag({ typed: '-w5', value: undefined }),
        new UnknownFlag({ typed: '-w5', value: undefined }),
      ],
      allowed: ['-w'],
    })

    const refusal = validator.refusal()

    expect(refusal).toBe('flag not allowed: -w5; allowed flags for log: -w')
  })

  it('when a number flag has a non-numeric value, says the value is not a number', () => {
    const validator = new GitFlagValidator({
      name: 'log',
      flags: [
        new NumberFlag({ typed: '-n', value: 'x' }),
        new NumberFlag({ typed: '-n5', value: '5' }),
      ],
      allowed: ['-n'],
    })

    const refusal = validator.refusal()

    expect(refusal).toBe('flag value not a number: -n x')
  })
})
