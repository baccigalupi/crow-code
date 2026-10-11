import { Text } from 'ink'
import { signal } from '@preact/signals-core'
import { useKeypress } from '../../src/tui/install/interactions/hooks/use-keypress.ts'
import { emptyBuffer } from '../../src/tui/input-buffer.ts'
import type {
  InstallConfigSaver,
  InstallStep,
  KeypressSignals,
} from '../../src/tui/install/types.ts'

const noop: InstallConfigSaver = () => {}

export const keypressSignals = (
  step: InstallStep,
  save: InstallConfigSaver = noop,
): KeypressSignals => ({
  repo: signal(emptyBuffer()),
  user: signal(emptyBuffer()),
  step: signal(step),
  confirmation: signal(true),
  save,
})

export const KeypressProbe = (
  { signals }: { readonly signals: KeypressSignals },
) => {
  useKeypress(signals)
  return <Text>ready</Text>
}
