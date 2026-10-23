/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import { inputTextViewModel } from '../../input-text-view-model.ts'
import type { InputText } from '../../types.ts'

const DefaultValue = ({
  input,
  defaultValue,
  bare,
}: {
  readonly input: InputText
  readonly defaultValue: string
  readonly bare?: boolean
}) => {
  if (input.text.length !== 0) return null

  if (bare) return <span attributes={TextAttributes.DIM}>{defaultValue}</span>

  return <span attributes={TextAttributes.DIM}>({defaultValue})</span>
}

type PromptProps = {
  readonly label: string
  readonly input: InputText
  readonly defaultValue: string
  readonly bare?: boolean
}

export const Prompt = ({ label, input, defaultValue, bare }: PromptProps) => {
  const { before, cursor, after } = inputTextViewModel(input)
  return (
    <box paddingX={1}>
      <text>
        {label}: {before}
        <DefaultValue input={input} defaultValue={defaultValue} bare={bare} />
        <span attributes={TextAttributes.INVERSE}>{cursor}</span>
        {after}
      </text>
    </box>
  )
}
