import type { DataStore } from '../data-store.ts'
import { useSignalValue } from '../interactions/use-signal-value.ts'
import { SetupProgress } from '../complete-setup/setup-progress.tsx'
import { ConfirmPrompt } from '../confirm/prompt.tsx'
import { DoneMessage } from '../done/done-message.tsx'
import { ProviderPrompt } from '../provider/prompt.tsx'
import { TextPrompt } from '../text-prompt/prompt.tsx'

type CurrentPromptProps = { store: DataStore }

// The current step's prompt, sitting on the bottom rows. Keyed by step so
// each step starts fresh.
export const CurrentPrompt = ({ store }: CurrentPromptProps) => {
  const step = useSignalValue(store.navigator.current)
  const prompts = {
    repoDirectory: <TextPrompt store={store} step="repoDirectory" />,
    crowGlobalDirectory: (
      <TextPrompt store={store} step="crowGlobalDirectory" />
    ),
    envFile: <TextPrompt store={store} step="envFile" />,
    ignore: <TextPrompt store={store} step="ignore" />,
    additionalRead: <TextPrompt store={store} step="additionalRead" />,
    additionalWrite: <TextPrompt store={store} step="additionalWrite" />,
    escalateRead: <TextPrompt store={store} step="escalateRead" />,
    escalateWrite: <TextPrompt store={store} step="escalateWrite" />,
    allowedLocalScripts: (
      <TextPrompt store={store} step="allowedLocalScripts" />
    ),
    providerName: <ProviderPrompt store={store} step="providerName" />,
    providerUrl: <ProviderPrompt store={store} step="providerUrl" />,
    providerCredentials: (
      <ProviderPrompt store={store} step="providerCredentials" />
    ),
    confirm: <ConfirmPrompt store={store} />,
    completeSetup: <SetupProgress store={store} />,
    done: <DoneMessage store={store} />,
  }
  return (
    <box
      key={step}
      flexDirection="column"
      flexGrow={1}
      flexShrink={0}
      justifyContent="flex-end"
    >
      {prompts[step]}
    </box>
  )
}
