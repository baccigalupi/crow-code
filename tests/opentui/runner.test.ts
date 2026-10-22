import { describe, expect, it, mock, spyOn } from 'bun:test'
import { PassThrough } from 'node:stream'
import type { CliRenderer } from '@opentui/core'
import { createOpenTuiRunner } from '../../src/opentui/runner.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'

describe('createOpenTuiRunner', () => {
  it('when exit is called, status resolves completed', async () => {
    const stdin = Object.assign(new PassThrough(), { setRawMode: () => {} })
    const stdout = Object.assign(new PassThrough(), { columns: 80, rows: 24 })
    const runner = createOpenTuiRunner(mockApplicationData(), {
      stdin,
      stdout,
    } as never)

    const pending = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    runner.exit()

    expect(await pending).toBe('completed')
  })

  it('when exit is called, enters and leaves the alternate screen', async () => {
    const stdin = Object.assign(new PassThrough(), { setRawMode: () => {} })
    const stdout = Object.assign(new PassThrough(), { columns: 80, rows: 24 })
    const chunks: string[] = []
    stdout.on('data', (chunk) => chunks.push(String(chunk)))
    const runner = createOpenTuiRunner(mockApplicationData(), {
      stdin,
      stdout,
    } as never)

    const pending = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    runner.exit()
    await pending

    const output = chunks.join('')
    expect(output).toContain('\x1b[?1049h')
    expect(output).toContain('\x1b[?1049l')
    expect(output.indexOf('\x1b[?1049h')).toBeLessThan(
      output.indexOf('\x1b[?1049l'),
    )
  })

  it('when interrupted, status resolves interrupted', async () => {
    const stdin = Object.assign(new PassThrough(), { setRawMode: () => {} })
    const stdout = Object.assign(new PassThrough(), { columns: 80, rows: 24 })
    const runner = createOpenTuiRunner(mockApplicationData(), {
      stdin,
      stdout,
    } as never)

    const pending = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    runner.interrupt()

    expect(await pending).toBe('interrupted')
  })

  it('when interrupted during startup, destroys the renderer once created', async () => {
    const stdin = Object.assign(new PassThrough(), { setRawMode: () => {} })
    const destroy = mock(() => {})
    const renderer = {
      isDestroyed: true,
      idle: () => Promise.resolve(),
      closed: Promise.resolve(),
      destroy,
    } as unknown as CliRenderer
    const runner = createOpenTuiRunner(
      mockApplicationData(),
      { stdin } as never,
      undefined,
      () => Promise.resolve(renderer),
    )

    const pending = runner.status()
    runner.interrupt()

    expect(await pending).toBe('interrupted')
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('when a signal arrives through the runtime listener, status resolves interrupted', async () => {
    const stdin = Object.assign(new PassThrough(), { setRawMode: () => {} })
    const stdout = Object.assign(new PassThrough(), { columns: 80, rows: 24 })
    const applicationData = mockApplicationData()
    const add = spyOn(applicationData.runtime, 'addSignalListener')
    const runner = createOpenTuiRunner(applicationData, {
      stdin,
      stdout,
    } as never)

    const pending = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    add.mock.calls[0][1]()

    expect(await pending).toBe('interrupted')
  })

  it('when creating the renderer fails, writes the error through the console error and resolves interrupted', async () => {
    const stdin = Object.assign(new PassThrough(), { setRawMode: () => {} })
    const consoleError = mock()
    const applicationData = mockApplicationData({ consoleError })
    const remove = spyOn(applicationData.runtime, 'removeSignalListener')
    const runner = createOpenTuiRunner(
      applicationData,
      { stdin } as never,
      undefined,
      () => Promise.reject(new Error('boom')),
    )

    const status = await runner.status()

    expect(status).toBe('interrupted')
    expect(consoleError.mock.calls[0][0]).toBe('Error: boom')
    expect(remove.mock.calls[0][0]).toEqual('SIGINT')
  })

  it('when failing after the renderer exists, destroys it and writes the error', async () => {
    const stdin = Object.assign(new PassThrough(), { setRawMode: () => {} })
    const consoleError = mock()
    const destroy = mock(() => {})
    const renderer = {
      isDestroyed: true,
      idle: () => Promise.reject(new Error('idle failed')),
      closed: Promise.resolve(),
      destroy,
    } as unknown as CliRenderer
    const runner = createOpenTuiRunner(
      mockApplicationData({ consoleError }),
      { stdin } as never,
      undefined,
      () => Promise.resolve(renderer),
    )

    const status = await runner.status()

    expect(status).toBe('interrupted')
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(consoleError.mock.calls[0][0]).toBe('Error: idle failed')
  })

  it('when stdin cannot set raw mode, refuses to start the renderer', async () => {
    const stdin = new PassThrough()
    const consoleError = mock()
    const createRenderer = mock()
    const runner = createOpenTuiRunner(
      mockApplicationData({ consoleError }),
      { stdin } as never,
      undefined,
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
