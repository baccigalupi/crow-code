import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { Text } from 'ink'
import { signal } from '@preact/signals-core'
import { useSignalValue } from '../../src/tui/use-signal-value.ts'
import { SignalProbe } from '../support/signal-probe.tsx'
import type { ReadonlySignal } from '@preact/signals-core'

describe('useSignalValue', () => {
  it('re-renders when the signal changes', async () => {
    const source = signal('one')
    const { lastFrame, unmount } = render(<SignalProbe source={source} />)

    source.value = 'two'
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(lastFrame()).toBe('two')
    unmount()
  })

  it('does not re-render when the signal is set to an equal value', async () => {
    const source = signal('one')
    let renders = 0
    const Counting = ({ source }: { source: ReadonlySignal<string> }) => {
      renders++
      return <Text>{useSignalValue(source)}</Text>
    }
    const { unmount } = render(<Counting source={source} />)
    const before = renders

    source.value = 'one'
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(renders).toBe(before)
    unmount()
  })
})
