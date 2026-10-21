import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { instrument } from '../../../agents/coverage/instrument.ts'

describe('instrument', () => {
  it('when source has an if, records both branch arms', () => {
    const source = 'export const pick = (flag) => { if (flag) { return 1 } return 2 }'

    const result = instrument(source, 'src/pick.ts', undefined)

    expect(result.coverage.path).toBe('src/pick.ts')
    expect(Object.keys(result.coverage.b)).toHaveLength(1)
    expect(Object.values(result.coverage.b)[0]).toEqual([0, 0])
  })

  it('when source has two functions, records both', () => {
    const source = 'export const a = () => 1\nexport const b = () => 2'

    const result = instrument(source, 'src/two.ts', undefined)

    expect(Object.keys(result.coverage.fnMap)).toHaveLength(2)
  })
})
