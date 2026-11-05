import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { InputText, ProviderStepName } from '../types.ts'
import type { ProviderActions } from '../interactions/handlers/provider-actions.ts'
import { useSignalValue } from '../interactions/use-signal-value.ts'
import { PromptLine } from '../text-prompt/prompt.tsx'

type FieldViewProps = {
  label: string
  input: InputText
  actions: ProviderActions
}

const AnsweredField = ({ label, input }: FieldViewProps) => (
  <box paddingX={1}>
    <text>
      {label}: {input.text}
    </text>
  </box>
)

const InputField = ({ label, input, actions }: FieldViewProps) => (
  <box paddingX={1} flexDirection="row">
    <text>{label}: </text>
    <input
      focused
      flexGrow={1}
      value={input.text}
      onInput={actions.input()}
      onSubmit={actions.submit()}
      onKeyDown={actions.keyDown()}
    />
  </box>
)

// The input has no masking, so the key is a focused box that takes the typing
// itself and draws it as dots.
const MaskedField = ({ label, input, actions }: FieldViewProps) => (
  <box
    focusable
    focused
    onKeyDown={actions.keyDown()}
    onPaste={actions.paste()}
  >
    <PromptLine label={label} input={input} placeholder="" masked />
  </box>
)

const UpcomingField = ({ label }: FieldViewProps) => (
  <box paddingX={1}>
    <text attributes={TextAttributes.DIM}>{label}:</text>
  </box>
)

const plainViews = {
  answered: AnsweredField,
  live: InputField,
  upcoming: UpcomingField,
}

const maskedViews = { ...plainViews, live: MaskedField }

const fields = {
  providerName: { label: 'Name', views: plainViews },
  providerUrl: { label: 'Url', views: plainViews },
  providerCredentials: { label: 'API key', views: maskedViews },
}

type FieldProps = {
  store: DataStore
  name: ProviderStepName
  actions: ProviderActions
}

// One provider field drawn in the state the form gives it on the current
// step: its answer, a live input (dots for the key), or a dim label.
export const Field = ({ store, name, actions }: FieldProps) => {
  const current = useSignalValue(store.navigator.current)
  const input = useSignalValue(store.providerEditForm[name].text)
  const { label, views } = fields[name]
  const View = views[store.providerEditForm.fieldState(name, current)]
  return <View label={label} input={input} actions={actions} />
}
