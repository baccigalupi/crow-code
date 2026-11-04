import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { TextPromptPanel } from './text-prompt.tsx'
import type { InputText } from '../../types.ts'
import { useSignalValue } from '../../use-signal-value.ts'

const maskCharacter = '•'

// One `label: value` line with a block cursor and the dimmed placeholder.
// Masked inputs show only bullets.
export const PromptLine = (props: {
  label: string
  input: InputText
  placeholder: string
  masked?: boolean
}) => {
  const { input, label } = props
  const text = props.masked
    ? maskCharacter.repeat(input.text.length)
    : input.text
  const cursor = text.charAt(input.cursor) || ' '
  return (
    <box paddingX={1}>
      <text>
        {`${label}: ${text.slice(0, input.cursor)}`}
        <span attributes={TextAttributes.DIM}>{props.placeholder}</span>
        <span attributes={TextAttributes.INVERSE}>{cursor}</span>
        {text.slice(input.cursor + 1)}
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
    />
  )
}
