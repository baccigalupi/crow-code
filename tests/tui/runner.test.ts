import { describe, expect, it, mock, spyOn } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { createOpenTuiRunner } from '../../src/tui/runner.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { mockStdin, mockStdout } from '../support/mock-streams.ts'

describe('createOpenTuiRunner', () => {
  it('when exit is called once mounted, status resolves completed', async () => {
    const view = () => null
    const { renderer } = await createTestRenderer({})
    const runner = createOpenTuiRunner(
      mockApplicationData(),
      { stdin: mockStdin(), stdout: mockStdout() },
      view,
      () => Promise.resolve(renderer),
    )
    spyOn(renderer, 'idle').mockImplementation(() => {
      runner.exit()
      return Promise.resolve()
    })

    const status = await runner.status()

    expect(status).toBe('completed')
  })

  it('when interrupted once mounted, status resolves interrupted', async () => {
    const view = () => null
    const { renderer } = await createTestRenderer({})
    const runner = createOpenTuiRunner(
      mockApplicationData(),
      { stdin: mockStdin(), stdout: mockStdout() },
      view,
      () => Promise.resolve(renderer),
    )
    spyOn(renderer, 'idle').mockImplementation(() => {
      runner.interrupt()
      return Promise.resolve()
    })

    const status = await runner.status()

    expect(status).toBe('interrupted')
  })

  it('when interrupted during startup, destroys the renderer once created', async () => {
    const view = () => null
    const { renderer } = await createTestRenderer({})
    const destroy = spyOn(renderer, 'destroy')
    const runner = createOpenTuiRunner(
      mockApplicationData(),
      { stdin: mockStdin() },
      view,
      () => Promise.resolve(renderer),
    )

    const pending = runner.status()
    runner.interrupt()

    expect(await pending).toBe('interrupted')
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('when a signal arrives through the runtime listener, status resolves interrupted', async () => {
    const view = () => null
    const applicationData = mockApplicationData()
    const add = spyOn(applicationData.runtime, 'addSignalListener')
    const runner = createOpenTuiRunner(
      applicationData,
      { stdin: mockStdin(), stdout: mockStdout() },
      view,
      async () => (await createTestRenderer({})).renderer,
    )

    const pending = runner.status()
    add.mock.calls[0][1]()

    expect(await pending).toBe('interrupted')
  })

  it('when creating the renderer fails, writes the error through the console error and resolves interrupted', async () => {
    const view = () => null
    const consoleError = mock()
    const applicationData = mockApplicationData({ consoleError })
    const remove = spyOn(applicationData.runtime, 'removeSignalListener')
    const runner = createOpenTuiRunner(
      applicationData,
      { stdin: mockStdin() },
      view,
      () => Promise.reject(new Error('boom')),
    )

    const status = await runner.status()

    expect(status).toBe('interrupted')
    expect(consoleError.mock.calls[0][0]).toBe('Error: boom')
    expect(remove.mock.calls[0][0]).toEqual('SIGINT')
  })

  it('when failing after the renderer exists, destroys it and writes the error', async () => {
    const view = () => null
    const consoleError = mock()
    const { renderer } = await createTestRenderer({})
    spyOn(renderer, 'idle').mockRejectedValue(new Error('idle failed'))
    const destroy = spyOn(renderer, 'destroy')
    const runner = createOpenTuiRunner(
      mockApplicationData({ consoleError }),
      { stdin: mockStdin() },
      view,
      () => Promise.resolve(renderer),
    )

    const status = await runner.status()

    expect(status).toBe('interrupted')
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(consoleError.mock.calls[0][0]).toBe('Error: idle failed')
  })

  it('when stdin cannot set raw mode, refuses to start the renderer', async () => {
    const view = () => null
    const consoleError = mock()
    const createRenderer = mock()
    const runner = createOpenTuiRunner(
      mockApplicationData({ consoleError }),
      { stdin: mockStdin({ rawMode: false }) },
      view,
      createRenderer,
    )

    const status = await runner.status()

    expect(status).toBe('interrupted')
    expect(createRenderer).not.toHaveBeenCalled()
    expect(consoleError.mock.calls[0][0]).toBe(
      'Error: Crow unable to work in this terminal - TTY compatible stdin required.',
    )
  })
})
