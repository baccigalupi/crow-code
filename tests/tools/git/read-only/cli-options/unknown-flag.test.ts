import { describe, expect, it } from 'bun:test'
import { UnknownFlag } from '../../../../../src/tools/git/read-only/cli-options/unknown-flag.ts'

describe('UnknownFlag', () => {
  it('when checked, is not valid', () => {
    const flag = new UnknownFlag({ typed: '--graph', value: undefined })

    const valid = flag.isValid()

    expect(valid).toBe(false)
  })

  it('when asked why, gives not allowed as the reason', () => {
    const flag = new UnknownFlag({ typed: '--graph', value: undefined })

    const reason = flag.reason()

    expect(reason).toBe('notAllowed')
  })
})
