import { describe, expect, it } from 'bun:test'
import { BooleanFlag } from '../../../../../../src/tools/git/read-only/git-passthrough/cli-options/boolean-flag.ts'

describe('BooleanFlag', () => {
  it('when no value is given, is valid', () => {
    const flag = new BooleanFlag({ typed: '--oneline', value: undefined })

    const valid = flag.isValid()

    expect(valid).toBe(true)
  })

  it('when a value is given, is not valid', () => {
    const flag = new BooleanFlag({ typed: '--oneline=yes', value: 'yes' })

    const valid = flag.isValid()

    expect(valid).toBe(false)
  })

  it('when a value is given, gives not allowed as the reason', () => {
    const flag = new BooleanFlag({ typed: '--oneline=yes', value: 'yes' })

    const reason = flag.reason()

    expect(reason).toBe('notAllowed')
  })

  it('when asked for paths, has none', () => {
    const flag = new BooleanFlag({ typed: '--oneline', value: undefined })

    const paths = flag.paths()

    expect(paths).toEqual([])
  })

  it('when no value is given, labels it as typed', () => {
    const flag = new BooleanFlag({ typed: '--oneline', value: undefined })

    const label = flag.label()

    expect(label).toBe('--oneline')
  })
})
