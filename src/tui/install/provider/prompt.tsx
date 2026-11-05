import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { ProviderFieldName } from '../types.ts'
import type { InputText } from '../../types.ts'
import { useSignalValue } from '../../use-signal-value.ts'
import { PromptLine } from '../text-prompt/prompt.tsx'
import { ProviderPromptViewModel } from './prompt-view-model.ts'

const fields = {
  providerName: { label: 'Name', masked: false },
  providerUrl: { label: 'Url', masked: false },
  providerCredentials: { label: 'API key', masked: true },
} as const

type FieldViewProps = { label: string; input: InputText; masked: boolean }

const AnsweredField = ({ label, input }: FieldViewProps) => (
  <box paddingX={1}>
    <text>
      {label}: {input.text}
    </text>
  </box>
)

const LiveField = (props: FieldViewProps) => (
  <PromptLine {...props} placeholder="" />
)

const UpcomingField = ({ label }: FieldViewProps) => (
  <box paddingX={1}>
    <text attributes={TextAttributes.DIM}>{label}:</text>
  </box>
)

const fieldViews = {
  answered: AnsweredField,
  live: LiveField,
  upcoming: UpcomingField,
}

type FieldProps = { store: DataStore; name: ProviderFieldName }

// A field drawn in the state the form gives it on the current step.
const Field = ({ store, name }: FieldProps) => {
  const current = useSignalValue(store.navigator.current)
  const input = useSignalValue(store.providerEditForm[name].text)
  const View = fieldViews[store.providerEditForm.fieldState(name, current)]
  return <View {...fields[name]} input={input} />
}

type ProviderPromptProps = { store: DataStore }

// The three provider steps as one "Provider N" block over an escape hint.
export const ProviderPrompt = ({ store }: ProviderPromptProps) => {
  const providers = useSignalValue(store.providers.providers)
  const viewModel = new ProviderPromptViewModel(providers)
  return (
    <box flexDirection="column">
      <box border title={viewModel.title()} flexDirection="column">
        <Field store={store} name="providerName" />
        <Field store={store} name="providerUrl" />
        <Field store={store} name="providerCredentials" />
      </box>
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>
          Esc to finish adding providers
        </text>
      </box>
    </box>
  )
}
