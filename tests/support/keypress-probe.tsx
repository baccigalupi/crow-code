import { Text } from 'ink'
import { signal } from '@preact/signals-core'
import { useKeypress } from '../../src/tui/install/interactions/hooks/use-keypress.ts'
import { emptyBuffer } from '../../src/tui/input-buffer.ts'
import type {
  CrowConfigWriter,
  InstallStep,
  KeypressSignals,
} from '../../src/tui/install/types.ts'

const noop: CrowConfigWriter = () => {}

export const keypressSignals = (
  step: InstallStep,
  save: CrowConfigWriter = noop,
): KeypressSignals => ({
  repoDirectory: signal(emptyBuffer()),
  globalDirectory: signal(emptyBuffer()),
  envFile: signal(emptyBuffer()),
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
