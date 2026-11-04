import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { TextFieldStore } from '../data-stores/text-field-store.ts'
import { useSignalValue } from '../../use-signal-value.ts'
import { PromptLine } from './text-prompt.tsx'

const fields = [
  { label: 'Name', name: 'providerName', masked: false },
  { label: 'Url', name: 'providerUrl', masked: false },
  { label: 'API key', name: 'providerCredentials', masked: true },
] as const

// Earlier fields show their values, the current one is live, later ones show
// only their label.
const Field = (props: {
  label: string
  field: TextFieldStore
  masked: boolean
  offset: number
}) => {
  const input = useSignalValue(props.field.text)
  if (props.offset === 0) {
    return <PromptLine {...props} input={input} defaultValue="" bare />
  }
  if (props.offset < 0) {
    return (
      <box paddingX={1}>
        <text>{`${props.label}: ${input.text}`}</text>
      </box>
    )
  }
  return (
    <box paddingX={1}>
      <text attributes={TextAttributes.DIM}>{`${props.label}:`}</text>
    </box>
  )
}

type ProviderPromptProps = { model: DataStore }

// The three provider steps as one "Provider N" block over an escape hint.
export const ProviderPrompt = ({ model }: ProviderPromptProps) => {
  const providers = useSignalValue(model.providers.providers)
  const current = useSignalValue(model.navigator.current)
  const step = fields.findIndex((field) => field.name === current)
  return (
    <box flexDirection="column">
      <box
        border
        title={`Provider ${providers.length + 1}`}
        flexDirection="column"
      >
        {fields.map((field, index) => (
          <Field
            key={field.name}
            label={field.label}
            field={model.providerEditForm[field.name]}
            masked={field.masked}
            offset={index - step}
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
