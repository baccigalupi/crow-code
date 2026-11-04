import type { DataStore } from '../data-store.ts'
import type { Panels } from '../panels.ts'
import { useSignalValue } from '../../use-signal-value.ts'

type CurrentPromptProps = {
  model: DataStore
  panels: Panels
}

// The current panel's prompt, sitting on the bottom rows. A panel change is a
// plain re-render with the new panel's prompt.
export const CurrentPrompt = ({ model, panels }: CurrentPromptProps) => {
  const current = useSignalValue(model.navigator.current)
  return (
    <box
      flexDirection="column"
      flexGrow={1}
      flexShrink={0}
      justifyContent="flex-end"
    >
      {panels.get(current).prompt(model)}
    </box>
  )
}
