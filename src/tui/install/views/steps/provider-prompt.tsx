/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import { Prompt } from '../prompt.tsx'
import { providerPromptViewModel } from './provider-prompt-view-model.ts'
import type { InputText } from '../../../types.ts'
import type { ProviderPromptProps } from '../../types.ts'

const Field = ({
  label,
  input,
  status,
  masked,
}: {
  readonly label: string
  readonly input: InputText
  readonly status: 'done' | 'active' | 'pending'
  readonly masked: boolean
}) => {
  if (status === 'active') {
    return (
      <Prompt
        label={label}
        input={input}
        defaultValue=""
        bare
        masked={masked}
      />
    )
  }
  if (status === 'pending') {
    return (
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>{label}:</text>
      </box>
    )
  }
  return (
    <box paddingX={1}>
      <text>
        {label}: {input.text}
      </text>
    </box>
  )
}

export const ProviderPrompt = (props: ProviderPromptProps) => {
  const { title, fields } = providerPromptViewModel(props)

  return (
    <box flexDirection="column">
      <box border title={title} flexDirection="column">
        {fields.map((field) => (
          <Field
            key={field.id}
            label={field.label}
            input={field.input}
            status={field.status}
            masked={field.masked}
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
