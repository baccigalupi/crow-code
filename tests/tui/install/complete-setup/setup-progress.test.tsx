import { describe, expect, it } from 'bun:test'
import { RGBA, TextAttributes } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { SetupProgress } from '../../../../src/tui/install/complete-setup/setup-progress.tsx'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('SetupProgress', () => {
  it('when nothing has finished, marks the first task as running', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.progress.list([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: false,
        error: '',
      },
      {
        id: 'GlobalDirectoryTask',
        label: 'Creating ~/.crow',
        done: false,
        error: '',
      },
    ])
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <SetupProgress store={store} />,
      { width: 50, height: 4 },
    )

    await renderOnce()

    const rows = captureCharFrame().split('\n')
    expect(rows[0]).toContain('› Writing config to .crow/config.json')
    expect(rows[1]).toContain('   Creating ~/.crow')
    expect(rows[1]).not.toContain('›')
    act(() => renderer.destroy())
  })

  it('when a task is done, marks it with a green tick and dims its label', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.progress.list([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: false,
        error: '',
      },
    ])
    const { renderer, renderOnce, captureSpans } = await testRender(
      <SetupProgress store={store} />,
      { width: 50, height: 2 },
    )

    act(() => store.progress.finish('LocalConfigTask', ''))
    await renderOnce()

    const { spans } = captureSpans().lines[0]
    expect(spans[1].text).toBe('✓')
    expect(spans[1].fg).toEqual(RGBA.fromHex('#4caf50'))
    expect(spans[2].text).toBe(' Writing config to .crow/config.json')
    expect(spans[2].attributes).toBe(TextAttributes.DIM)
    act(() => renderer.destroy())
  })

  it('when a task fails, marks it red, shows its error and runs nothing else', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.progress.list([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: false,
        error: '',
      },
      {
        id: 'GlobalDirectoryTask',
        label: 'Creating ~/.crow',
        done: false,
        error: '',
      },
    ])
    const { renderer, renderOnce, captureCharFrame, captureSpans } =
      await testRender(<SetupProgress store={store} />, {
        width: 50,
        height: 4,
      })

    act(() => store.progress.finish('LocalConfigTask', 'EACCES'))
    await renderOnce()

    const rows = captureCharFrame().split('\n')
    const { lines } = captureSpans()
    expect(rows[0]).toContain('✗ Writing config to .crow/config.json')
    expect(lines[0].spans[1].fg).toEqual(RGBA.fromHex('#e05252'))
    expect(rows[1]).toContain('   EACCES')
    expect(lines[1].spans[1].attributes).toBe(TextAttributes.DIM)
    expect(rows[2]).not.toContain('›')
    expect(rows[2]).toContain('  Creating ~/.crow')
    act(() => renderer.destroy())
  })
})
