import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { ProviderPanel } from './provider.tsx'
import { PromptNavigation } from '../interactions/prompt-navigation.ts'
import { useSignalValue } from '../interactions/use-signal-value.ts'
import { ProviderActions } from './actions.ts'
import { Field } from './field.tsx'
import { ProviderPromptViewModel } from './prompt-view-model.ts'

type ProviderPromptProps = { panel: ProviderPanel; store: DataStore }

// The three provider steps as one "Provider N" block over an escape hint.
export const ProviderPrompt = ({ panel, store }: ProviderPromptProps) => {
  const providers = useSignalValue(store.providers.providers)
  const viewModel = new ProviderPromptViewModel(providers)
  const actions = new ProviderActions({
    panel,
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
