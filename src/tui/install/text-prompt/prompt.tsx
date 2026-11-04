import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { TextPromptPanel } from './text-prompt.tsx'
import type { InputText } from '../../types.ts'
import { useSignalValue } from '../../use-signal-value.ts'
import { PromptLineViewModel } from './prompt-line-view-model.ts'

type PromptLineProps = {
  label: string
  input: InputText
  placeholder: string
  masked: boolean
}

// One `label: value` line with a block cursor and the dimmed placeholder.
export const PromptLine = ({
  label,
  input,
  placeholder,
  masked,
}: PromptLineProps) => {
  const viewModel = new PromptLineViewModel(input, masked)
  return (
    <box paddingX={1}>
      <text>
        {label}: {viewModel.beforeCursor()}
        <span attributes={TextAttributes.DIM}>{placeholder}</span>
        <span attributes={TextAttributes.INVERSE}>{viewModel.atCursor()}</span>
        {viewModel.afterCursor()}
      </text>
    </box>
  )
}

type TextPromptProps = {
  panel: TextPromptPanel
  model: DataStore
}

// A text prompt panel's question over the answer typed into its field.
export const TextPrompt = ({ panel, model }: TextPromptProps) => {
  const inputs = useSignalValue(model.inputs)
  const input = useSignalValue(panel.field(model).text)
  return (
    <PromptLine
      label={panel.label}
      input={input}
      placeholder={panel.placeholder(model, inputs)}
      masked={false}
    />
  )
}
