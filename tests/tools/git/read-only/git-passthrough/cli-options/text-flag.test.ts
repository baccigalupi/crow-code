import { describe, expect, it } from 'bun:test'
import { TextFlag } from '../../../../../../src/tools/git/read-only/git-passthrough/cli-options/text-flag.ts'

describe('TextFlag', () => {
  it('when a value is given, is valid', () => {
    const flag = new TextFlag({ typed: '--author=ada', value: 'ada' })

    const valid = flag.isValid()

    expect(valid).toBe(true)
  })

  it('when no value is given, is not valid', () => {
    const flag = new TextFlag({ typed: '--author', value: undefined })

    const valid = flag.isValid()

    expect(valid).toBe(false)
  })

  it('when the value is empty, is not valid', () => {
    const flag = new TextFlag({ typed: '--author=', value: '' })

    const valid = flag.isValid()

    expect(valid).toBe(false)
  })

  it('when no value is given, gives not allowed as the reason', () => {
    const flag = new TextFlag({ typed: '--author', value: undefined })

    const reason = flag.reason()

    expect(reason).toBe('notAllowed')
  })
})
