import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('../../src/model-discovery/app', () => ({
  main: vi.fn(),
}))

import { main } from '../../src/model-discovery/app'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('run', () => {
  it('when imported, calls main with the refresh flag', async () => {
    vi.mocked(main).mockResolvedValue(undefined)
    vi.resetModules()

    await import('../../src/model-discovery/run')

    expect(main).toHaveBeenCalledWith(process.argv.includes('--refresh'))
  })

  it('when main rejects, logs the error and sets the exit code', async () => {
    vi.mocked(main).mockRejectedValue(new Error('boom'))
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
