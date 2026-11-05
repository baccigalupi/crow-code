import { describe, expect, it } from 'bun:test'
import { signal, type ReadonlySignal } from '@preact/signals-core'
import { act } from 'react'
import { testRender } from '@opentui/react/test-utils'
import { useSignalValue } from '../../../../src/tui/install/interactions/use-signal-value.ts'

describe('useSignalValue', () => {
  it('when the signal changes, re-renders with the new value', async () => {
    const source = signal('one')
    const Reader = () => <text>{useSignalValue(source)}</text>
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <Reader />,
      { width: 10, height: 1 },
    )

    act(() => {
      source.value = 'two'
    })
    await renderOnce()

    expect(captureCharFrame()).toContain('two')
    act(() => renderer.destroy())
  })

  it('when the signal is set to an equal value, does not re-render', async () => {
    const source = signal('one')
    const renders: string[] = []
    const Counting = ({ value }: { value: ReadonlySignal<string> }) => {
      renders.push(useSignalValue(value))
      return <text>{renders.length}</text>
    }
    const { renderer, renderOnce } = await testRender(
      <Counting value={source} />,
      { width: 10, height: 1 },
    )
    const before = renders.length

    act(() => {
      source.value = 'one'
    })
    await renderOnce()

    expect(renders.length).toBe(before)
    act(() => renderer.destroy())
  })
})
