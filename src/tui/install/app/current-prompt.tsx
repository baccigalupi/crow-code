import type { DataStore } from '../data-store.ts'
import type { Router } from '../router.ts'
import { useSignalValue } from '../../use-signal-value.ts'

type CurrentPromptProps = {
  store: DataStore
  router: Router
}

// The current panel's prompt, sitting on the bottom rows. A panel change is a
// plain re-render with the new panel's prompt.
export const CurrentPrompt = ({ store, router }: CurrentPromptProps) => {
  const panel = router.get(useSignalValue(store.navigator.current))
  return (
    <box
      flexDirection="column"
      flexGrow={1}
      flexShrink={0}
      justifyContent="flex-end"
    >
      {panel.prompt(store)}
    </box>
  )
}
