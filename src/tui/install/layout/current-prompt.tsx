import type { DataStore } from '../data-store.ts'
import { useSignalValue } from '../interactions/use-signal-value.ts'

type CurrentPromptProps = { store: DataStore }

// The current step's prompt, sitting on the bottom rows. Keyed by step so
// each step starts fresh.
export const CurrentPrompt = ({ store }: CurrentPromptProps) => {
  const step = useSignalValue(store.currentStep)
  return (
    <box
      key={step.name}
      flexDirection="column"
      flexGrow={1}
      flexShrink={0}
      justifyContent="flex-end"
    >
      {step.prompt(store)}
    </box>
  )
}
