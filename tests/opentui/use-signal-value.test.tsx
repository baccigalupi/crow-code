/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import { testRender } from '@opentui/react/test-utils'
import { useSignalValue } from '../../src/opentui/use-signal-value.ts'
import type { ReadonlySignal } from '@preact/signals-core'

describe('useSignalValue', () => {
  it('when the signal changes, re-renders with the new value', async () => {
    const source = signal('one')
    const Reader = ({ source }: { source: ReadonlySignal<string> }) => {
      return <text>{useSignalValue(source)}</text>
    }
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <Reader source={source} />,
      { width: 10, height: 1 },
    )

    source.value = 'two'
    await renderOnce()

    expect(captureCharFrame()).toContain('two')
    renderer.destroy()
  })

  it('when the signal is set to an equal value, does not re-render', async () => {
    const source = signal('one')
    let renders = 0
    const Counting = ({ source }: { source: ReadonlySignal<string> }) => {
      renders++
      return <text>{useSignalValue(source)}</text>
    }
    const { renderer, renderOnce } = await testRender(
      <Counting source={source} />,
      { width: 10, height: 1 },
    )
    const before = renders

    source.value = 'one'
    await renderOnce()

    expect(renders).toBe(before)
    renderer.destroy()
  })
})
