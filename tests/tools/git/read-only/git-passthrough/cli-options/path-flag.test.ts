import { describe, expect, it } from 'bun:test'
import { PathFlag } from '../../../../../../src/tools/git/read-only/git-passthrough/cli-options/path-flag.ts'

describe('PathFlag', () => {
  it('when a value is given, is valid', () => {
    const flag = new PathFlag({ typed: '-O', value: 'ord' })

    const valid = flag.isValid()

    expect(valid).toBe(true)
  })

  it('when no value is given, is not valid', () => {
    const flag = new PathFlag({ typed: '-O', value: undefined })

    const valid = flag.isValid()

    expect(valid).toBe(false)
  })

  it('when the value is empty, is not valid', () => {
    const flag = new PathFlag({ typed: '--contents=', value: '' })

    const valid = flag.isValid()

    expect(valid).toBe(false)
  })

  it('when a value is given, reports it as a path', () => {
    const flag = new PathFlag({ typed: '-O', value: 'ord' })

    const paths = flag.paths()

    expect(paths).toEqual(['ord'])
  })

  it('when no value is given, reports no path', () => {
    const flag = new PathFlag({ typed: '-O', value: undefined })

    const paths = flag.paths()

    expect(paths).toEqual([])
  })
})
