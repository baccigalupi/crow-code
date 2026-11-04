import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { TextFieldStore } from '../data-stores/text-field-store.ts'
import type { ProviderFieldState } from '../types.ts'
import type { InputText } from '../../types.ts'
import { useSignalValue } from '../../use-signal-value.ts'
import { PromptLine } from '../text-prompt/prompt.tsx'

const fields = {
  providerName: { label: 'Name', masked: false },
  providerUrl: { label: 'Url', masked: false },
  providerCredentials: { label: 'API key', masked: true },
} as const

type FieldViewProps = { label: string; input: InputText; masked: boolean }

const AnsweredField = ({ label, input }: FieldViewProps) => (
  <box paddingX={1}>
    <text>{`${label}: ${input.text}`}</text>
  </box>
)

const LiveField = (props: FieldViewProps) => (
  <PromptLine {...props} placeholder="" />
)

const UpcomingField = ({ label }: FieldViewProps) => (
  <box paddingX={1}>
    <text attributes={TextAttributes.DIM}>{`${label}:`}</text>
  </box>
)

const fieldViews = {
  answered: AnsweredField,
  live: LiveField,
  upcoming: UpcomingField,
}

type FieldProps = {
  label: string
  field: TextFieldStore
  masked: boolean
  state: ProviderFieldState['state']
}

// A field drawn in the state the form gives it.
const Field = ({ label, field, masked, state }: FieldProps) => {
  const input = useSignalValue(field.text)
  const View = fieldViews[state]
  return <View label={label} input={input} masked={masked} />
}

type ProviderPromptProps = { model: DataStore }

// The three provider steps as one "Provider N" block over an escape hint.
export const ProviderPrompt = ({ model }: ProviderPromptProps) => {
  const providers = useSignalValue(model.providers.providers)
  const current = useSignalValue(model.navigator.current)
  return (
    <box flexDirection="column">
      <box
        border
        title={`Provider ${providers.length + 1}`}
        flexDirection="column"
      >
        {model.providerEditForm.fieldStates(current).map(({ name, state }) => (
          <Field
            key={name}
            {...fields[name]}
            field={model.providerEditForm[name]}
            state={state}
          />
        ))}
      </box>
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>
          Esc to finish adding providers
        </text>
      </box>
    </box>
  )
}
