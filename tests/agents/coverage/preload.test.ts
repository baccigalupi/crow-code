import { describe, expect, it } from 'bun:test'

describe('preload', () => {
  it('when a src file is imported, records coverage for it', async () => {
    const key = `${process.cwd()}/src/decorators.ts`

    await import('../../../src/decorators.ts')

    const coverage = (globalThis as unknown as { __coverage__: object })
      .__coverage__
    expect(coverage).toHaveProperty([key, 'path'], key)
  })

  it('when a src file is required synchronously, records coverage for it', () => {
    const key = `${process.cwd()}/src/operation.ts`

    require('../../../src/operation.ts')

    const coverage = (globalThis as unknown as { __coverage__: object })
      .__coverage__
    expect(coverage).toHaveProperty([key, 'path'], key)
  })
})
