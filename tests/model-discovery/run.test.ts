import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('../../src/model-discovery/gather-model-data', () => ({
  gatherModelData: vi.fn(),
}))

import { gatherModelData } from '../../src/model-discovery/gather-model-data'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('run', () => {
  it('when imported, calls gatherModelData', async () => {
    vi.mocked(gatherModelData).mockResolvedValue(undefined)
    vi.resetModules()

    await import('../../src/model-discovery/run')

    expect(gatherModelData).toHaveBeenCalled()
  })

  it('when gatherModelData rejects, logs the error and sets the exit code', async () => {
    vi.mocked(gatherModelData).mockRejectedValue(new Error('boom'))
    vi.resetModules()
    const originalExitCode = process.exitCode
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await import('../../src/model-discovery/run')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(errorSpy).toHaveBeenCalled()
    expect(process.exitCode).toBe(1)
    process.exitCode = originalExitCode
  })
})
