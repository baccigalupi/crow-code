import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { shouldInstrument } from '../../../agents/coverage/include.ts'

describe('shouldInstrument', () => {
  it('when path is a ts file under src, returns true', () => {
    const path = '/r/src/tools/read.ts'

    const result = shouldInstrument(path, '/r')

    expect(result).toBe(true)
  })

  it('when path is a tsx file under src, returns true', () => {
    const path = '/r/src/tui/view.tsx'

    const result = shouldInstrument(path, '/r')

    expect(result).toBe(true)
  })

  it('when path is under tests, returns false', () => {
    const path = '/r/tests/cli.test.ts'

    const result = shouldInstrument(path, '/r')

    expect(result).toBe(false)
  })

  it('when path is under agents, returns false', () => {
    const path = '/r/agents/coverage/include.ts'

    const result = shouldInstrument(path, '/r')

    expect(result).toBe(false)
  })

  it('when path is under node_modules, returns false', () => {
    const path = '/r/node_modules/a/src/b.ts'

    const result = shouldInstrument(path, '/r')

    expect(result).toBe(false)
  })

  it('when path is a migration, returns false', () => {
    const path = '/r/src/database/migrations/001.ts'

    const result = shouldInstrument(path, '/r')

    expect(result).toBe(false)
  })

  it('when path is src/application-data.ts, returns false', () => {
    const path = '/r/src/application-data.ts'

    const result = shouldInstrument(path, '/r')

    expect(result).toBe(false)
  })

  it('when path is a non-ts file under src, returns false', () => {
    const path = '/r/src/data.json'

    const result = shouldInstrument(path, '/r')

    expect(result).toBe(false)
  })

  it('when path is under src of another root, returns false', () => {
    const path = '/other/src/a.ts'

    const result = shouldInstrument(path, '/r')

    expect(result).toBe(false)
  })
})
