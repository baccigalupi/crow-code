import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('../../src/model-discovery/gather-model-data', () => ({
  gatherModelData: vi.fn(),
}))

import { gatherModelData } from '../../src/model-discovery/gather-model-data.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('run', () => {
  it('when imported, calls gatherModelData', async () => {
    vi.mocked(gatherModelData).mockResolvedValue(undefined)
    vi.resetModules()

    await import('../../src/model-discovery/run.js')

    expect(gatherModelData).toHaveBeenCalled()
  })

  it('when gatherModelData rejects, logs the error and sets the exit code', async () => {
    vi.mocked(gatherModelData).mockRejectedValue(new Error('boom'))
    vi.resetModules()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exitSpy = vi.spyOn(Deno, 'exit').mockImplementation(() => {})

    await import('../../src/model-discovery/run.js')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(errorSpy).toHaveBeenCalled()
    expect(exitSpy).toHaveBeenCalledWith(1)
  })
})
