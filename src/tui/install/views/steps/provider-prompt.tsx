/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import { Prompt } from '../prompt.tsx'
import { providerPromptViewModel } from './provider-prompt-view-model.ts'
import type { InputText } from '../../../types.ts'
import type { ProviderPromptProps } from '../../types.ts'

type FieldProps = {
  readonly label: string
  readonly input: InputText
  readonly status: 'done' | 'active' | 'pending'
  readonly masked: boolean
}

const ActiveField = ({ label, input, status, masked }: FieldProps) => {
  if (status !== 'active') return null

  return (
    <Prompt label={label} input={input} defaultValue="" bare masked={masked} />
  )
}

const PendingField = ({ label, status }: FieldProps) => {
  if (status !== 'pending') return null

  return (
    <box paddingX={1}>
      <text attributes={TextAttributes.DIM}>{label}:</text>
    </box>
  )
}

const DoneField = ({ label, input, status }: FieldProps) => {
  if (status !== 'done') return null

  return (
    <box paddingX={1}>
      <text>
        {label}: {input.text}
      </text>
    </box>
  )
}

const Field = (props: FieldProps) => (
  <>
    <DoneField {...props} />
    <ActiveField {...props} />
    <PendingField {...props} />
  </>
)

export const ProviderPrompt = (props: ProviderPromptProps) => {
  const { title, nameStatus, urlStatus, credentialsStatus } =
    providerPromptViewModel(props)

  return (
    <box flexDirection="column">
      <box border title={title} flexDirection="column">
        <Field
          label="Name"
          input={props.providerName}
          status={nameStatus}
          masked={false}
        />
        <Field
          label="Url"
          input={props.providerUrl}
          status={urlStatus}
          masked={false}
        />
        <Field
          label="API key"
          input={props.providerCredentials}
          status={credentialsStatus}
          masked
        />
      </box>
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>
          Esc to finish adding providers
        </text>
      </box>
    </box>
  )
}
