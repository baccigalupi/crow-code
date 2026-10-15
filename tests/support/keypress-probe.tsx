import { Text } from 'ink'
import { signal } from '@preact/signals-core'
import { useKeypress } from '../../src/tui/install/interactions/hooks/use-keypress.ts'
import { emptyBuffer } from '../../src/tui/input-buffer.ts'
import type {
  InstallSignals,
  InstallStep,
} from '../../src/tui/install/types.ts'

export const keypressSignals = (step: InstallStep): InstallSignals => ({
  repoDirectory: signal(emptyBuffer()),
  globalDirectory: signal(emptyBuffer()),
  envFile: signal(emptyBuffer()),
  step: signal(step),
  confirmation: signal(true),
})

export const KeypressProbe = (
  { signals }: { readonly signals: InstallSignals },
) => {
  useKeypress(signals)
  return <Text>ready</Text>
}
