import { describe, expect, it } from 'bun:test'
import { ExactFlag } from '../../../../../../src/tools/git/read-only/git-passthrough/cli-options/exact-flag.ts'

describe('ExactFlag', () => {
  it('when checked, is valid', () => {
    const flag = new ExactFlag({ typed: '--porcelain=v2', value: 'v2' })

    const valid = flag.isValid()

    expect(valid).toBe(true)
  })
})
