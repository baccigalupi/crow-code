import { describe, expect, it } from 'bun:test'
import { instrument } from '../../../agents/coverage/instrument.ts'

describe('instrument', () => {
  it('when source has an if, records both branch arms', () => {
    const source =
      'export const pick = (flag) => { if (flag) { return 1 } return 2 }'

    const result = instrument(source, 'src/pick.ts')

    expect(result.coverage.path).toBe('src/pick.ts')
    expect(Object.keys(result.coverage.b)).toHaveLength(1)
    expect(Object.values(result.coverage.b)[0]).toEqual([0, 0])
  })

  it('when source has two functions, records both', () => {
    const source = 'export const a = () => 1\nexport const b = () => 2'

    const result = instrument(source, 'src/two.ts')

    expect(Object.keys(result.coverage.fnMap)).toHaveLength(2)
  })

  it('when source is TypeScript with annotations, records both branch arms', () => {
    const source =
      'export const larger = (a: number, b: number): number => { if (a > b) { return a } return b }'

    const result = instrument(source, 'src/larger.ts')

    expect(Object.values(result.coverage.b)[0]).toEqual([0, 0])
  })

  it('when source has a legacy class decorator, records its functions', () => {
    const source = '@sealed export class Greeter { greet() { return 1 } }'

    const result = instrument(source, 'src/greeter.ts')

    expect(Object.keys(result.coverage.fnMap)).toHaveLength(1)
  })

  it('when path is .tsx, records the arrow function', () => {
    const source = 'export const View = () => <div />'

    const result = instrument(source, 'src/view.tsx')

    expect(Object.keys(result.coverage.fnMap)).toHaveLength(1)
  })

  it('when path is .ts and source has a generic arrow, parses', () => {
    const source = 'export const id = <T,>(value: T) => value'

    const result = instrument(source, 'src/id.ts')

    expect(Object.keys(result.coverage.fnMap)).toHaveLength(1)
  })
})
