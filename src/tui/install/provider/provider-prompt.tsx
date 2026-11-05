import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { ProviderStep } from '../steps/provider-step.tsx'
import { PromptNavigation } from '../interactions/prompt-navigation.ts'
import { useSignalValue } from '../interactions/use-signal-value.ts'
import { ProviderActions } from '../interactions/handlers/provider-actions.ts'
import { Field } from './field.tsx'
import { providerPromptViewModel } from './provider-prompt-view-model.ts'

type ProviderPromptProps = { store: DataStore; step: ProviderStep }

// The three provider steps as one "Provider N" block over an escape hint.
export const ProviderPrompt = ({ store, step }: ProviderPromptProps) => {
  const providers = useSignalValue(store.providers.providers)
  const viewModel = providerPromptViewModel(providers)
  const actions = new ProviderActions({
    step,
    store,
    navigation: new PromptNavigation(store),
  })
  return (
    <box flexDirection="column">
      <box border title={viewModel.title()} flexDirection="column">
        <Field store={store} name="providerName" actions={actions} />
        <Field store={store} name="providerUrl" actions={actions} />
        <Field store={store} name="providerCredentials" actions={actions} />
      </box>
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>
          Esc to finish adding providers
        </text>
      </box>
    </box>
  )
}
