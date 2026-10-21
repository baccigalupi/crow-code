import { Text } from 'ink'
import { useSignalValue } from '../../src/tui/use-signal-value.ts'
import type { ReadonlySignal } from '@preact/signals-core'

export const SignalProbe = ({
  source,
}: {
  readonly source: ReadonlySignal<string>
}) => {
  const value = useSignalValue(source)
  return <Text>{value}</Text>
}
