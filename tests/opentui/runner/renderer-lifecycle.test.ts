import { describe, expect, it, mock } from 'bun:test'
import type { CliRenderer } from '@opentui/core'
import { RendererLifecycle } from '../../../src/opentui/runner/renderer-lifecycle.ts'

describe('RendererLifecycle', () => {
  it('when nothing happened, status is completed', () => {
    const lifecycle = new RendererLifecycle()

    const status = lifecycle.status()

    expect(status).toBe('completed')
  })

  it('when interrupted, status is interrupted', () => {
    const lifecycle = new RendererLifecycle()
    lifecycle.interrupt()

    const status = lifecycle.status()

    expect(status).toBe('interrupted')
  })

  it('when exited, status stays completed', () => {
    const lifecycle = new RendererLifecycle()
    lifecycle.exit()

    const status = lifecycle.status()

    expect(status).toBe('completed')
  })

  it('when exit is called after attaching, destroys the renderer', () => {
    const destroy = mock(() => {})
    const lifecycle = new RendererLifecycle()
    lifecycle.attach({ destroy } as unknown as CliRenderer)

    lifecycle.exit()

    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('when exit was called before attaching, destroys the renderer on attach', () => {
    const destroy = mock(() => {})
    const lifecycle = new RendererLifecycle()
    lifecycle.exit()

    lifecycle.attach({ destroy } as unknown as CliRenderer)

    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('when attached without a prior exit, does not destroy the renderer', () => {
    const destroy = mock(() => {})
    const lifecycle = new RendererLifecycle()

    lifecycle.attach({ destroy } as unknown as CliRenderer)

    expect(destroy).not.toHaveBeenCalled()
  })

  it('when closed, destroys the renderer and waits for it to close', async () => {
    const destroy = mock(() => {})
    const lifecycle = new RendererLifecycle()
    lifecycle.attach({
      destroy,
      closed: Promise.resolve(),
    } as unknown as CliRenderer)

    await lifecycle.close()

    expect(destroy).toHaveBeenCalledTimes(1)
  })
})
